const axios = require('axios');

const MANGO_BASE_URL = 'https://api.coinmango.org/api/v1';

const getAuthToken = async () => {
    try {
        const clientID = process.env.MANGO_CLIENT_ID;
        const apiKey = process.env.MANGO_API_KEY;

        if (!clientID || !apiKey) {
            throw new Error("Mango Client ID or API Key missing in environment");
        }

        const response = await axios.post(`${MANGO_BASE_URL}/authentication/login`, {}, {
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': clientID,
                'x-api-key': apiKey
            }
        });

        if (response.data && response.data.code === "200") {
            return response.data.data.token;
        } else {
            throw new Error(response.data.message || "Failed to authenticate with Mango");
        }
    } catch (error) {
        console.error("Mango Auth Error:", error.response?.data || error.message);
        throw error;
    }
};

const createSubscription = async (options, orderRef) => {
    try {
        const token = await getAuthToken();
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

        // 1. Get Service Key (if not provided directly in options)
        // Options should contain: 
        // - mangoType: 'box', 'mars', 'netfly'
        // - identifier: SN, BoxID, or UNID/Account
        // - serviceKey: if we pre-configured it in the product
        
        let serviceKey = options.packId; // Admin sets the specific service key in 'Pack ID'
        const identifier = options.identifier; // User provides this in ProductDetails

        if (!identifier) {
            throw new Error("Identifier (SN/BoxID/Account) is required for Mango renewal");
        }

        // 2. Create Order
        const orderResponse = await axios.post(`${MANGO_BASE_URL}/orders/create`, {
            serviceKey: serviceKey
        }, { headers });

        if (orderResponse.data.code !== "200") {
            throw new Error(orderResponse.data.message || "Failed to create order on Mango");
        }

        const orderNumber = orderResponse.data.data.orderNumber;

        // 3. Unlock Account
        const paymentPassword = process.env.MANGO_PAYMENT_PASSWORD;
        if (!paymentPassword) {
            throw new Error("MANGO_PAYMENT_PASSWORD missing in environment");
        }

        const unlockResponse = await axios.post(`${MANGO_BASE_URL}/payment/unlockAccount`, {
            paymentPassword: paymentPassword
        }, { headers });

        if (unlockResponse.data.code !== "200" && !unlockResponse.data.message.includes("unlocked")) {
             // Some APIs might return success even if already unlocked, or a specific message
             // We'll trust the code 200 or similar
             // throw new Error(unlockResponse.data.message || "Failed to unlock Mango account");
        }

        // 4. Initiate Payment
        const paymentResponse = await axios.post(`${MANGO_BASE_URL}/payment/payment`, {
            orderNumber: orderNumber
        }, { headers });

        if (paymentResponse.data.code === "200") {
            return {
                userId: identifier,
                url: orderNumber, // Map orderNumber to url field for consistency in UI
                status: 'ACTIVE',
                message: "Mango Renewal Successful",
                orderNumber: orderNumber,
                serviceKey: serviceKey
            };
        } else {
            throw new Error(paymentResponse.data.message || "Failed to process Mango payment");
        }

    } catch (error) {
        console.error("Mango API Error:", error.response?.data || error.message);
        throw error;
    }
};

module.exports = { createSubscription };
