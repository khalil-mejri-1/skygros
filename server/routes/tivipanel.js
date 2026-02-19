const axios = require('axios');
const router = require('express').Router();

const apiKey = process.env.TIVIPANEL_API_KEY || 'a27f6a82-0202-11f1-8b37-6edf5d6edfcb';

// GET PACKAGES (Bouquets)
router.get('/packages', async (req, res) => {
    try {
        const response = await axios.get('https://api.tivipanel.net/reseller/panel_api.php', {
            params: {
                action: 'package',
                api_key: apiKey
            }
        });

        // Response format: [{ "id": "19", "message": "Official ..." }, ...]
        // Frontend expects [{ "id": "...", "name": "..." }]
        const data = response.data;
        const packages = Array.isArray(data) ? data.map(pkg => ({
            id: pkg.id,
            name: pkg.message || pkg.package
        })) : [];

        res.status(200).json(packages);
    } catch (err) {
        console.error("TiviPanel Error:", err);
        res.status(500).json({ message: "Failed to fetch packages", error: err.message });
    }
});

// GET COUNTRIES (Reusing static list)
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
