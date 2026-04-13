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

module.exports = router;
