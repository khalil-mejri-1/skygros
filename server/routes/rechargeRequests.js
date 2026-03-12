const router = require('express').Router();
const RechargeRequest = require('../models/RechargeRequest');
const User = require('../models/User');

// GET ALL RECHARGE REQUESTS (Admin)
router.get('/', async (req, res) => {
    try {
        const requests = await RechargeRequest.find()
            .populate('user', 'username email balance')
            .sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json(err);
    }
});

// CREATE RECHARGE REQUEST (User)
router.post('/', async (req, res) => {
    const { userId, amount, paymentMethod, whatsappNumber } = req.body;
    try {
        if (!userId || !amount || !paymentMethod) {
            return res.status(400).json({ message: "Données manquantes." });
        }
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

        const newRequest = new RechargeRequest({
            user: userId,
            amount,
            paymentMethod: {
                name: paymentMethod.name,
                whatsapp: whatsappNumber || paymentMethod.details || ''
            }
        });
        await newRequest.save();
        res.status(201).json({ message: "Demande envoyée avec succès!", request: newRequest });
    } catch (err) {
        console.error("Recharge request error:", err);
        res.status(500).json(err);
    }
});

// APPROVE RECHARGE REQUEST (Admin) → Credit balance to user
router.put('/:id/approve', async (req, res) => {
    try {
        const request = await RechargeRequest.findById(req.params.id).populate('user');
        if (!request) return res.status(404).json({ message: "Demande non trouvée." });
        if (request.status !== 'pending') return res.status(400).json({ message: "Cette demande a déjà été traitée." });

        // Credit balance
        const user = await User.findById(request.user._id);
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });
        user.balance += request.amount;
        await user.save();

        request.status = 'approved';
        await request.save();

        res.status(200).json({ message: "Solde rechargé avec succès!", newBalance: user.balance });
    } catch (err) {
        console.error("Approve recharge error:", err);
        res.status(500).json(err);
    }
});

// REJECT RECHARGE REQUEST (Admin)
router.put('/:id/reject', async (req, res) => {
    try {
        const request = await RechargeRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Demande non trouvée." });
        if (request.status !== 'pending') return res.status(400).json({ message: "Cette demande a déjà été traitée." });

        request.status = 'rejected';
        request.adminNote = req.body.note || '';
        await request.save();

        res.status(200).json({ message: "Demande rejetée." });
    } catch (err) {
        console.error("Reject recharge error:", err);
        res.status(500).json(err);
    }
});

// DELETE RECHARGE REQUEST (Admin)
router.delete('/:id', async (req, res) => {
    try {
        await RechargeRequest.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Demande supprimée." });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
