const mongoose = require('mongoose');

const DemoStockSchema = new mongoose.Schema({
    serviceName: { type: String, required: true }, // e.g. "IPTV Premium"
    description: { type: String },
    image: { type: String }, // Product image for the demo
    content: { type: String, required: true }, // The actual credential or link
    isClaimed: { type: Boolean, default: false },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    claimedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('DemoStock', DemoStockSchema);
