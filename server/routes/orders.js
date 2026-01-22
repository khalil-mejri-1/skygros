const router = require('express').Router();
const Order = require('../models/Order');

const mongoose = require('mongoose');

// GET ALL ORDERS (ADMIN)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'username email')
            .sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET USER ORDERS
router.get('/user/:userId', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
            return res.status(400).json("Invalid User ID format");
        }

        const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (err) {
        console.error("Order fetch error:", err);
        res.status(500).json(err);
    }
});

// MANUALLY FULFILL ORDER
router.put('/fulfill/:orderId', async (req, res) => {
    try {
        const { licenseKey } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.orderId,
            {
                licenseKey: licenseKey,
                status: 'COMPLETED'
            },
            { new: true }
        );
        res.status(200).json(updatedOrder);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
