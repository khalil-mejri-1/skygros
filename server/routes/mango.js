const router = require('express').Router();
const axios = require('axios');

const MANGO_BASE_URL = 'https://api.coinmango.org/api/v1';

const getAuthToken = async () => {
    const clientID = process.env.MANGO_CLIENT_ID;
    const apiKey = process.env.MANGO_API_KEY;
    const response = await axios.post(`${MANGO_BASE_URL}/authentication/login`, {}, {
        headers: {
            'x-client-id': clientID,
            'x-api-key': apiKey
        }
    });
    return response.data.data.token;
};

// GET SERVICES for a serial number (Experimental)
router.get('/services/:sn', async (req, res) => {
    try {
        const token = await getAuthToken();
        const response = await axios.get(`${MANGO_BASE_URL}/renewal/${req.params.sn}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        res.status(200).json(response.data);
    } catch (err) {
        console.error("Mango Services Error:", err.message);
        res.status(500).json({ message: "Failed to fetch mango services", details: err.message });
    }
});

// GET COUNTRIES (Static list)
router.get('/countries', (req, res) => {
    const countries = [
        { code: "ALL", name: "Tous les pays" }
    ];
    res.status(200).json(countries);
});

// GET PACKAGES (Stub)
router.get('/packages', (req, res) => {
    res.status(200).json([]);
});

module.exports = router;
