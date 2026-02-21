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
                status: 'COMPLETED',
                userNotified: false
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

// DELETE ORDER
router.delete('/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.status(200).json("Order deleted success");
    } catch (err) {
        res.status(500).json(err);
    }
});

// BULK DELETE ORDERS
router.post('/bulk-delete', async (req, res) => {
    try {
        const { orderIds } = req.body;
        await Order.deleteMany({ _id: { $in: orderIds } });
        res.status(200).json("Orders deleted success");
    } catch (err) {
        res.status(500).json(err);
    }
});
// MARK ALL AS SEEN
router.put('/mark-all-seen', async (req, res) => {
    try {
        await Order.updateMany({ isSeen: { $ne: true } }, { isSeen: true });
        res.status(200).json("All orders marked as seen");
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET UNNOTIFIED ORDERS FOR USER
router.get('/notifications/:userId', async (req, res) => {
    try {
        const orders = await Order.find({
            userId: req.params.userId,
            status: 'COMPLETED',
            userNotified: { $ne: true }
        }).sort({ updatedAt: -1 });
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json(err);
    }
});

// MARK NOTIFICATIONS AS READ
router.put('/notifications/mark-read/:userId', async (req, res) => {
    try {
        await Order.updateMany(
            { userId: req.params.userId, status: 'COMPLETED', userNotified: { $ne: true } },
            { userNotified: true }
        );
        res.status(200).json("Notifications marked as read");
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
