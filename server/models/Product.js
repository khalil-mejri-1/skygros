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
    isHidden: { type: Boolean, default: false },
    // New Fields for NEO 4K Integration
    type: { type: String, enum: ['normal', 'm3u', 'mag'], default: 'normal' },
    pack: { type: Number }, // NEO 4K Pack ID
    duration: { type: Number } // Duration in months
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
