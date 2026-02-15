const mongoose = require('mongoose');

const ResetCodeRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, required: true },
    code: { type: String, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productTitle: { type: String },
    productImage: { type: String },
    password: { type: String }, // Only if type is 'm3u'
    status: { type: String, default: 'PENDING', enum: ['PENDING', 'COMPLETED', 'REJECTED'] },
}, { timestamps: true });

module.exports = mongoose.model('ResetCodeRequest', ResetCodeRequestSchema);
