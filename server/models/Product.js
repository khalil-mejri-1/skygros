const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    hasDiscount: { type: Boolean, default: false },
    image: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String },
    keys: [{
        key: { type: String, required: true },
        isSold: { type: Boolean, default: false },
        soldTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        soldAt: { type: Date }
    }],
    isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
