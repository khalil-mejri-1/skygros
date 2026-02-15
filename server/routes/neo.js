const router = require('express').Router();
const axios = require('axios');

// Helper to check API Key
const checkApiKey = () => {
    if (!process.env.NEO_API_KEY) {
        throw new Error("NEO_API_KEY Missing");
    }
    return process.env.NEO_API_KEY;
};

// GET PACKAGES (Use for "Sort Bouquets" / Packs)
router.get('/packages', async (req, res) => {
    try {
        const apiKey = checkApiKey();
        const response = await axios.get('https://neo4kpro.me/api/api.php', {
            params: {
                action: 'bouquet', // Correct action per docs
                api_key: apiKey
            }
        });
        res.status(200).json(response.data);
    } catch (err) {
        console.error("NEO Packages Error:", err.message);
        res.status(500).json({ message: "Failed to fetch packages", details: err.message });
    }
});

// GET COUNTRIES (Static List as API doesn't provide one)
router.get('/countries', (req, res) => {
    // Standard static list
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

// CHECK RESELLER CREDITS (Optional check)
router.get('/reseller', async (req, res) => {
    try {
        const apiKey = checkApiKey();
        const response = await axios.get('https://neo4kpro.me/api/api.php', {
            params: {
                action: 'reseller',
                api_key: apiKey
            }
        });
        res.status(200).json(response.data);
    } catch (err) {
        console.error("NEO Reseller Error:", err.message);
        res.status(500).json({ message: "Failed to fetch reseller info" });
    }
});

module.exports = router;
