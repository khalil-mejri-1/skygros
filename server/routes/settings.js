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
        res.status(200).json(settings);
    } catch (err) {
        res.status(500).json(err);
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
        res.status(500).json(err);
    }
});

module.exports = router;
