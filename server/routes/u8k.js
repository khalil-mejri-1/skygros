const router = require('express').Router();
const { getPackages } = require('../utils/u8kApi');

// GET PACKAGES (Bouquets)
router.get('/packages', async (req, res) => {
    try {
        const response = await getPackages();
        // The API returns { bouquets: [{id, name, is_adult}], vods: [...] }
        const bouquets = response.bouquets || [];
        res.status(200).json(bouquets);
    } catch (err) {
        console.error("U8K Packages Error:", err.message);
        res.status(500).json({ message: "Failed to fetch packages", details: err.message });
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
