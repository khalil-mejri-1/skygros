const router = require('express').Router();
const axios = require('axios');

// Helper to check API Key
const checkApiKey = () => {
    const key = process.env.STRONG8K_API_KEY || 'cec67373579d901151b52f29d3750ec1';
    if (!key) {
        throw new Error("STRONG8K_API_KEY Missing");
    }
    return key;
};

// GET PACKAGES (Bouquets)
router.get('/packages', async (req, res) => {
    try {
        const apiKey = checkApiKey();
        // User requested endpoint: https://my8k.me/api/api.php?action=bouquet&api_key=STRONG8K_API_KEY
        const response = await axios.get('https://my8k.me/api/api.php', {
            params: {
                action: 'bouquet',
                api_key: apiKey
            }
        });

        // Response is expected to be an array of objects: [{ "id": "132", "name": "SMALL - ARABIC" }, ...]
        res.status(200).json(response.data);
    } catch (err) {
        console.error("Strong8K Packages Error:", err.message);
        res.status(500).json({ message: "Failed to fetch packages", details: err.message });
    }
});

// GET COUNTRIES (Reusing static list or adapting if API provides one, defaulting to static for now as no country endpoint was specified by user)
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
