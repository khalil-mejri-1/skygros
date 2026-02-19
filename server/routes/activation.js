const router = require('express').Router();
const axios = require('axios');

const apiKey = process.env.ACTIVATION_API_KEY || 'c47f4a37f6f8e13c103611ba40ac5cbd';

// GET PACKAGES (Bouquets)
router.get('/packages', async (req, res) => {
    try {
        const response = await axios.get('https://activationpanel.net/api/api.php', {
            params: {
                action: 'bouquet',
                api_key: apiKey
            }
        });

        // Response format is likely JSON array: [{"id": 132, "name": "SMALL - ARABIC"}, ...]
        res.status(200).json(response.data);
    } catch (err) {
        console.error("ACTIVATION PANEL Error:", err);
        res.status(500).json({ message: "Failed to fetch packages", error: err.message });
    }
});

// GET COUNTRIES (No specific endpoint provided, reuse static list or fetch if available)
router.get('/countries', (req, res) => {
    // Standard static list matching the one used for Neo, can be adjusted if Strong8k supports different ones
    const countries = [
        { code: "ALL", name: "VPN (Tous les pays)" },
        { code: "TN", name: "Tunisie" },
        { code: "FR", name: "France" },
        { code: "BE", name: "Belgique" },
        { code: "DE", name: "Allemagne" },
        { code: "ES", name: "Espagne" },
        { code: "IT", name: "Italie" },
        { code: "CH", name: "Suisse" },
        { code: "UK", name: "Royaume-Uni" },
        { code: "CA", name: "Canada" },
        { code: "US", name: "États-Unis" },
        { code: "MA", name: "Maroc" },
        { code: "DZ", name: "Algérie" }
    ];
    res.status(200).json(countries);
});

module.exports = router;
