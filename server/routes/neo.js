const router = require('express').Router();
const axios = require('axios');

// Helper to check API Key
const checkApiKey = () => {
    if (!process.env.NEO_API_KEY) {
        throw new Error("NEO_API_KEY Missing");
    }
    return process.env.NEO_API_KEY;
};

// Helper to clean API response from PHP warnings/garbage
const cleanResponse = (data) => {
    if (typeof data === 'string') {
        try {
            // Find the first { and last } to extract JSON
            const start = data.indexOf('{');
            const end = data.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                return JSON.parse(data.substring(start, end + 1));
            }
        } catch (e) {
            console.error("Failed to parse cleaned JSON:", e);
        }
    }
    return data;
};

// GET PACKAGES (Use for "Sort Bouquets" / Packs)
router.get('/packages', async (req, res) => {
    try {
        const customApiKey = req.query.apiKey;
        const customBaseUrl = req.query.baseUrl;
        
        const apiKey = (customApiKey && customApiKey !== 'undefined') ? customApiKey : process.env.NEO_API_KEY;
        const endpoint = (customBaseUrl && customBaseUrl !== 'undefined') ? customBaseUrl : 'https://neo4kpro.me/api/api.php';

        if (!apiKey) {
            throw new Error("NEO_API_KEY Missing");
        }

        const response = await axios.get(endpoint, {
            params: {
                action: 'bouquet',
                api_key: apiKey
            }
        });

        console.log("NEO RAW BOUQUET RESPONSE:", response.data);
        const cleanedData = cleanResponse(response.data);
        console.log("NEO CLEANED BOUQUET DATA:", cleanedData);
        res.status(200).json(cleanedData);
    } catch (err) {
        console.error("NEO Packages Error:", err.message);
        res.status(500).json({ message: "Failed to fetch packages", details: err.message });
    }
});

// GET COUNTRIES (Static List as API doesn't provide one)
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
        const cleanedData = cleanResponse(response.data);
        res.status(200).json(cleanedData);
    } catch (err) {
        console.error("NEO Reseller Error:", err.message);
        res.status(500).json({ message: "Failed to fetch reseller info" });
    }
});

// TEST API CONNECTION
router.get('/test-connection', async (req, res) => {
    try {
        const customApiKey = req.query.apiKey;
        const customBaseUrl = req.query.baseUrl;
        
        const apiKey = (customApiKey && customApiKey !== 'undefined') ? customApiKey : process.env.NEO_API_KEY;
        const endpoint = (customBaseUrl && customBaseUrl !== 'undefined') ? customBaseUrl : 'https://neo4kpro.me/api/api.php';

        if (!apiKey) {
            return res.status(400).json({ status: "error", message: "NEO_API_KEY Missing" });
        }

        const response = await axios.get(endpoint, {
            params: {
                action: 'reseller',
                api_key: apiKey
            }
        });

        const cleanedData = cleanResponse(response.data);

        if (cleanedData) {
             res.status(200).json({ 
                status: "success", 
                message: "Connection Successful", 
                data: cleanedData 
            });
        } else {
            res.status(400).json({ status: "error", message: "Empty response from API", raw: response.data });
        }
    } catch (err) {
        console.error("NEO Test Connection Error:", err.message);
        res.status(500).json({ 
            status: "error", 
            message: "Connection Failed", 
            details: err.message 
        });
    }
});

module.exports = router;
