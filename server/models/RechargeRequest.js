const mongoose = require('mongoose');

const RechargeRequestSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    paymentMethod: {
        name: { type: String, required: true },
        whatsapp: { type: String }
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNote: { type: String },
    proofImage: { type: String } // Optional: if they upload a screenshot
}, { timestamps: true });

module.exports = mongoose.model('RechargeRequest', RechargeRequestSchema);
