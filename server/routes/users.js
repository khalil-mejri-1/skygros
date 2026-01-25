const router = require('express').Router();
const User = require('../models/User');
const QRCode = require('qrcode');
const speakeasy = require('speakeasy');

// GET SINGLE USER
router.get('/:id', async (req, res) => {
    try {
        if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json("Invalid ID format");
        }
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json("User not found");
        res.status(200).json(user);
    } catch (err) {
        console.error("GET USER ERROR:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});

// GET ALL USERS
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});

// ADD BALANCE
router.post('/add-balance', async (req, res) => {
    const { userId, amount } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json("User not found");

        user.balance += Number(amount);
        await user.save();
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 2FA SETUP (GENERATE SECRET & QR)
router.post('/2fa/setup', async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json("User not found!");

        const secret = speakeasy.generateSecret({
            name: `Ferid Market (${user.email})`,
            length: 20
        });

        // Temporarily store secret (not enabled yet)
        user.twoFASecret = secret.base32;
        await user.save();

        const qrCode = await QRCode.toDataURL(secret.otpauth_url);
        res.status(200).json({ qrCode, secret: secret.base32 });
    } catch (err) {
        console.error("2FA Setup Error:", err);
        res.status(500).json(err);
    }
});

// 2FA CONFIRM (ENABLE)
router.post('/2fa/confirm', async (req, res) => {
    try {
        const { userId, token } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json("User not found!");

        const verified = speakeasy.totp.verify({
            secret: user.twoFASecret,
            encoding: 'base32',
            token,
            window: 1
        });

        if (!verified) return res.status(400).json("Invalid code!");

        user.is2FAEnabled = true;
        await user.save();
        res.status(200).json({ message: "2FA enabled successfully", is2FAEnabled: true });
    } catch (err) {
        res.status(500).json(err);
    }
});

// 2FA DISABLE
router.post('/2fa/disable', async (req, res) => {
    try {
        const { userId, token } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json("User not found!");

        const verified = speakeasy.totp.verify({
            secret: user.twoFASecret,
            encoding: 'base32',
            token,
            window: 1
        });

        if (!verified) return res.status(400).json("Invalid code!");

        user.is2FAEnabled = false;
        user.twoFASecret = null;
        await user.save();
        res.status(200).json({ message: "2FA disabled successfully", is2FAEnabled: false });
    } catch (err) {
        res.status(500).json(err);
    }
});

// CHECK & CLAIM RANK REWARDS
router.post('/check-rank-rewards', async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        const GeneralSettings = require('../models/GeneralSettings'); // Lazy load
        const settings = await GeneralSettings.findOne();

        if (!user || !settings || !settings.ranks) return res.status(200).json({ message: "No action" });

        const count = user.purchaseCount || 0;
        let totalReward = 0;
        let newClaims = [];

        // Check if user qualifies for any rank reward they haven't claimed
        settings.ranks.forEach(rank => {
            // If user has enough purchases for this rank
            if (count >= rank.minPurchases) {
                // Check if already claimed
                // We use rank.name as ID. Ideally should use _id if stable, but name works if unique.
                const rankId = rank.name;

                if (!user.claimedRankRewards.includes(rankId)) {
                    // Award!
                    if (rank.rewardDemoCount > 0) {
                        totalReward += rank.rewardDemoCount;
                        newClaims.push(rankId);
                    }
                }
            }
        });

        if (totalReward > 0) {
            user.demoBalance += totalReward;
            user.claimedRankRewards = [...user.claimedRankRewards, ...newClaims];
            await user.save();
            return res.status(200).json({
                message: "Rewarded",
                rewardAmount: totalReward,
                newBalance: user.demoBalance,
                newClaims
            });
        }

        res.status(200).json({ message: "No new rewards" });

    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

module.exports = router;
