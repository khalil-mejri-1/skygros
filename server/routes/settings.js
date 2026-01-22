const router = require('express').Router();
const GeneralSettings = require('../models/GeneralSettings');

// GET SETTINGS
router.get('/', async (req, res) => {
    try {
        let settings = await GeneralSettings.findOne();
        if (!settings) {
            // Create default settings if none exist
            settings = new GeneralSettings();
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
