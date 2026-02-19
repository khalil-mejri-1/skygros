const axios = require('axios');
const router = require('express').Router();

const apiKey = process.env.PROMAX_API_KEY || '7dHa1DfhEdWJWgYJSETHLbOeHgxYI9B3ad0SGkHT%2Fl3jftyZAco%2Fs22w%2F9Kg3Ht3';

// GET PACKAGES (Bouquets)
router.get('/packages', async (req, res) => {
    try {
        const response = await axios.get('https://api.promax-dash.com/api.php', {
            params: {
                action: 'bouquet',
                public: 1,
                api_key: apiKey
            }
        });

        // Response format is already [{ "id": "...", "name": "..." }, ...]
        res.status(200).json(response.data);
    } catch (err) {
        console.error("Promax Error:", err);
        res.status(500).json({ message: "Failed to fetch packages", error: err.message });
    }
});

// GET COUNTRIES
router.get('/countries', (req, res) => {
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
