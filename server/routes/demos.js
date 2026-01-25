const router = require('express').Router();
const DemoStock = require('../models/DemoStock');
const User = require('../models/User');

// --- ADMIN ROUTES ---

// GET ALL DEMO STOCKS (For Admin Table)
router.get('/', async (req, res) => {
    try {
        const demos = await DemoStock.find().populate('claimedBy', 'username email').sort({ createdAt: -1 });
        res.status(200).json(demos);
    } catch (err) {
        res.status(500).json(err);
    }
});

// ADD DEMOS (Bulk or Single)
router.post('/', async (req, res) => {
    try {
        // Expected body: { serviceName, description, image, contentList: ["user:pass", "key2"] }
        const { serviceName, description, image, contentList } = req.body;

        if (!Array.isArray(contentList) || contentList.length === 0) {
            return res.status(400).json("Content list is empty");
        }

        const docs = contentList.map(c => ({
            serviceName,
            description,
            image,
            content: c,
            isClaimed: false
        }));

        await DemoStock.insertMany(docs);
        res.status(200).json({ message: "Demos added successfully", count: docs.length });
    } catch (err) {
        res.status(500).json(err);
    }
});

// DELETE DEMO
router.delete('/:id', async (req, res) => {
    try {
        await DemoStock.findByIdAndDelete(req.params.id);
        res.status(200).json("Demo deleted");
    } catch (err) {
        res.status(500).json(err);
    }
});


// --- USER ROUTES ---

// CLAIM DEMO
router.post('/claim', async (req, res) => {
    const { userId, serviceName } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json("User not found");

        if (user.demoBalance <= 0) {
            return res.status(400).json("Insufficient Demo Balance");
        }

        // Atomic Find and Update to prevent concurrency issues
        const query = { isClaimed: false };
        if (serviceName) query.serviceName = serviceName;

        const demo = await DemoStock.findOneAndUpdate(
            query,
            {
                $set: {
                    isClaimed: true,
                    claimedBy: user._id,
                    claimedAt: new Date()
                }
            },
            { new: true }
        );

        if (!demo) {
            return res.status(404).json({ message: "Stock épuisé pour ce service. Veuillez réessayer plus tard." });
        }

        // Deduct balance
        user.demoBalance -= 1;
        await user.save();

        res.status(200).json({ demo, newBalance: user.demoBalance });

    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

// GET MY CLAIMED DEMOS
router.get('/user/:userId', async (req, res) => {
    try {
        const demos = await DemoStock.find({ claimedBy: req.params.userId }).sort({ claimedAt: -1 });
        res.status(200).json(demos);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET AVAILABLE SERVICES LIST (Distinct names for User Selection)
router.get('/available-types', async (req, res) => {
    try {
        // Return distinct service names that have count > 0 && isClaimed: false
        const available = await DemoStock.aggregate([
            { $match: { isClaimed: false } },
            {
                $group: {
                    _id: "$serviceName",
                    count: { $sum: 1 },
                    description: { $first: "$description" },
                    image: { $first: "$image" }
                }
            }
        ]);
        res.status(200).json(available);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
