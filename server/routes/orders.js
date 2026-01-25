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

        if (updatedOrder) {
            const User = require('../models/User');
            await User.findByIdAndUpdate(updatedOrder.userId, { $inc: { purchaseCount: 1 } });
        }

        res.status(200).json(updatedOrder);
    } catch (err) {
        res.status(500).json(err);
    }
});

// REFUND ORDER (ADMIN)
router.post('/refund/:orderId', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json("Order not found!");
        if (order.status === 'REFUNDED') return res.status(400).json("Order already refunded!");

        const User = require('../models/User');
        const user = await User.findById(order.userId);
        if (!user) return res.status(404).json("User not found!");

        // Update User Balance
        const refundAmount = order.price * (order.quantity || 1);
        user.balance += refundAmount;

        // Update Order Status
        order.status = 'REFUNDED';

        await user.save();
        await order.save();

        res.status(200).json({ message: "Refund successful!", order });
    } catch (err) {
        console.error("Refund error:", err);
        res.status(500).json(err);
    }
});

module.exports = router;
