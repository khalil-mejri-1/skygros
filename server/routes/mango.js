const router = require('express').Router();
const axios = require('axios');
const User = require('../models/User');
const Order = require('../models/Order');
const https = require('https');

// Create an agent to force IPv4 (matching curl -4)
const ipv4Agent = new https.Agent({ family: 4 });

const MANGO_BASE_URL = 'https://api.coinmango.org/api/v1';

// Internal cached token to avoid multiple logins
let cachedToken = null;
let tokenExpiry = null;

const getAuthToken = async () => {
    // Check if token is still valid (simple check)
    if (cachedToken && tokenExpiry && new Date() < new Date(tokenExpiry)) {
        return cachedToken;
    }

    const clientID = (process.env.MANGO_CLIENT_ID || '').trim();
    const apiKey = (process.env.MANGO_API_KEY || '').trim();

    if (!clientID || !apiKey) {
        throw new Error("MANGO_CLIENT_ID or MANGO_API_KEY missing in environment");
    }

    try {
        const response = await axios.post(`${MANGO_BASE_URL}/authentication/login`, {}, {
            httpsAgent: ipv4Agent,
            headers: {
                'x-client-id': clientID,
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.code === "200") {
            cachedToken = response.data.data.token;
            tokenExpiry = response.data.data.expiresAt;
            return cachedToken;
        } else {
            throw new Error(response.data.message || "Mango Login Failed");
        }
    } catch (err) {
        console.error("Mango Auth Error:", err.response?.data || err.message);
        throw err;
    }
};

const unlockAccount = async (token) => {
    const paymentPassword = process.env.MANGO_PAYMENT_PASSWORD;
    if (!paymentPassword) throw new Error("MANGO_PAYMENT_PASSWORD not configured");

    try {
        const response = await axios.post(`${MANGO_BASE_URL}/payment/unlockAccount`, {
            paymentPassword: paymentPassword
        }, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            httpsAgent: ipv4Agent
        });
        return response.data.code === "200";
    } catch (err) {
        console.error("Mango Unlock Error:", err.response?.data || err.message);
        return false;
    }
};

// GET SERVICES for Box or Netfly
router.get('/services/:type/:identifier', async (req, res) => {
    try {
        const { type, identifier } = req.params;
        const token = await getAuthToken();
        
        let endpoint = '';
        if (type === 'box') {
            endpoint = `/renewal/${identifier}`;
        } else if (type === 'netfly') {
            endpoint = `/netfly/${identifier}`;
        } else if (type === 'mars') {
            endpoint = `/mars/${identifier}`;
        } else {
            return res.status(400).json({ message: "Invalid service type" });
        }

        const response = await axios.get(`${MANGO_BASE_URL}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` },
            httpsAgent: ipv4Agent
        });

        res.status(200).json(response.data);
    } catch (err) {
        console.error("Mango Services Error:", err.response?.data || err.message);
        res.status(err.response?.status || 500).json({ 
            message: "Failed to fetch mango services", 
            details: err.response?.data?.message || err.message 
        });
    }
});

// PURCHASE / PAY FLOW
router.post('/purchase', async (req, res) => {
    const { userId, serviceKey, identifier, type, price } = req.body;

    try {
        // 1. Verify User Balance on our site
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.balance < price) return res.status(400).json({ message: "Insufficient balance on site" });

        // 2. Mango Operations
        const token = await getAuthToken();

        // 3. Create Mango Order
        const orderRes = await axios.post(`${MANGO_BASE_URL}/orders/create`, {
            serviceKey: serviceKey
        }, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            httpsAgent: ipv4Agent
        });

        if (orderRes.data.code !== "200") {
            return res.status(400).json({ message: "Mango order creation failed", details: orderRes.data.message });
        }

        const orderNumber = orderRes.data.data.orderNumber;

        // 4. Unlock if needed
        await unlockAccount(token);

        // 5. Initiate Payment
        const paymentRes = await axios.post(`${MANGO_BASE_URL}/payment/payment`, {
            orderNumber: orderNumber
        }, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            httpsAgent: ipv4Agent
        });

        if (paymentRes.data.code !== "200") {
            return res.status(400).json({ message: "Mango payment failed", details: paymentRes.data.message });
        }

        // 6. Payment Success -> Update local database
        user.balance -= price;
        await user.save();

        const newOrder = new Order({
            user: userId,
            products: [], 
            total: price,
            status: 'completed',
            paymentMethod: 'balance',
            mangoDetails: {
                orderNumber: orderNumber,
                identifier: identifier,
                type: type,
                serviceKey: serviceKey
            }
        });
        await newOrder.save();

        res.status(200).json({
            message: "Purchase success",
            newBalance: user.balance,
            orderNumber: orderNumber
        });

    } catch (err) {
        console.error("Mango Purchase Error:", err.response?.data || err.message);
        res.status(500).json({ message: "Internal server error during purchase", details: err.response?.data?.message || err.message });
    }
});

// TEST CONNECTION
router.post('/test-connection', async (req, res) => {
    try {
        const clientID = (process.env.MANGO_CLIENT_ID || '').trim();
        const apiKey = (process.env.MANGO_API_KEY || '').trim();

        // Fetch Server Public IP
        let serverIp = "Unknown";
        try {
            const ipRes = await axios.get('https://api.ipify.org?format=json');
            serverIp = ipRes.data.ip;
        } catch (ipErr) {
            console.error("Failed to fetch server IP:", ipErr.message);
        }

        const response = await axios.post(`${MANGO_BASE_URL}/authentication/login`, {}, {
            httpsAgent: ipv4Agent,
            headers: {
                'x-client-id': clientID,
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        res.status(200).json({
            ...response.data,
            serverIp: serverIp
        });
    } catch (err) {
        console.error("Mango Test Error:", err.response?.data || err.message);
        res.status(err.response?.status || 500).json(err.response?.data || { message: err.message });
    }
});

// GET BALANCE
router.get('/balance', async (req, res) => {
    try {
        const token = await getAuthToken();
        const response = await axios.get(`${MANGO_BASE_URL}/balance/current`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        res.status(200).json(response.data);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch mango balance" });
    }
});

module.exports = router;
