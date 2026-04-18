const router = require('express').Router();
const GeneralSettings = require('../models/GeneralSettings');

// GET SETTINGS
router.get('/', async (req, res) => {
    try {
        let settings = await GeneralSettings.findOne();
        if (!settings) {
            settings = new GeneralSettings();
            await settings.save();
        } else if (!settings.ranks || settings.ranks.length === 0) {
            // Populate default ranks if missing in existing settings
            settings.ranks = [
                { name: "Bronze", minPurchases: 0, color: "#cd7f32", icon: "FaMedal" },
                { name: "Silver", minPurchases: 10, color: "#c0c0c0", icon: "FaMedal" },
                { name: "Gold", minPurchases: 20, color: "#ffd700", icon: "FaMedal" }
            ];
            await settings.save();
        }
        
        if (!settings.seoPages || settings.seoPages.length === 0) {
            settings.seoPages = [
                { path: "/", name: "Accueil", title: "Skygros - Accueil", description: "Plateforme moderne", keywords: "iptv, streaming" },
                { path: "/products", name: "Produits", title: "Skygros - Produits", description: "Nos produits IPTV", keywords: "iptv, serveurs, acheter" },
                { path: "/panier", name: "Panier", title: "Skygros - Panier", description: "Votre panier d'achat", keywords: "panier, achat" },
                { path: "/login", name: "Connexion", title: "Skygros - Connexion", description: "Connectez-vous à votre compte", keywords: "login, connexion" },
                { path: "/register", name: "Inscription", title: "Skygros - Inscription", description: "Créez votre compte", keywords: "inscription, register" },
                { path: "/historique", name: "Historique", title: "Skygros - Historique", description: "Historique d'achat", keywords: "historique, commandes" }
            ];
            await settings.save();
        }
        res.status(200).json(settings);
    } catch (err) {
        console.error("GET SETTINGS ERROR:", err);
        res.status(500).json({ message: err.message || "Internal Server Error", error: err });
    }
});

// UPDATE SETTINGS
router.put('/', async (req, res) => {
    try {
        let settings = await GeneralSettings.findOne();
        if (!settings) {
            settings = new GeneralSettings(req.body);
            await settings.save();
        } else {
            settings = await GeneralSettings.findOneAndUpdate({}, req.body, { new: true });
        }
        res.status(200).json(settings);
    } catch (err) {
        console.error("PUT SETTINGS ERROR:", err);
        res.status(500).json({ message: err.message || "Internal Server Error", error: err });
    }
});

// GET GLOBAL API CONFIGS (for Admin display)
router.get('/global-api-config', async (req, res) => {
    try {
        const config = {
            neo: { 
                apiKey: process.env.NEO_API_KEY,
                baseUrl: process.env.NEO_BASE_URL || 'https://neo4kpro.me/api/api.php'
            },
            strong8k: { 
                apiKey: process.env.STRONG8K_API_KEY,
                baseUrl: process.env.STRONG8K_BASE_URL || 'https://my8k.me/api/api.php'
            },
            activation: { 
                apiKey: process.env.ACTIVATION_API_KEY,
                baseUrl: process.env.ACTIVATION_BASE_URL || 'https://activationpanel.net/api/api.php'
            },
            tivipanel: { 
                apiKey: process.env.TIVIPANEL_API_KEY,
                baseUrl: process.env.TIVIPANEL_BASE_URL || 'https://api.tivipanel.net/reseller/panel_api.php'
            },
            tivione: { 
                apiKey: process.env.TIVIONE_API_KEY || 'a27f6a82-0202-11f1-8b37-6edf5d6edfcb',
                baseUrl: process.env.TIVIONE_BASE_URL || 'https://api.tivipanel.net/reseller/panel_api.php'
            },
            promax: { 
                apiKey: process.env.PROMAX_API_KEY,
                baseUrl: process.env.PROMAX_BASE_URL || 'https://api.promax-dash.com/api.php'
            },
            mango: { 
                clientId: process.env.MANGO_CLIENT_ID, 
                apiKey: process.env.MANGO_API_KEY, 
                paymentPassword: process.env.MANGO_PAYMENT_PASSWORD,
                baseUrl: process.env.MANGO_BASE_URL || 'https://api.coinmango.org/api/v1'
            },
            golden: { 
                apiKey: process.env.GOLDEN_API_KEY, 
                baseUrl: process.env.GOLDEN_BASE_URL || 'https://newpanel.cx/api'
            },
            u8k: { 
                apiKey: process.env.U8K_API_KEY, 
                apiSecret: process.env.U8K_API_SECRET,
                baseUrl: process.env.U8K_BASE_URL || 'https://u8k.me/api/v1'
            }
        };
        res.status(200).json(config);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch global config" });
    }
});

module.exports = router;
