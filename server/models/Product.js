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
    provider: { type: String, enum: ['neo', 'strong8k', 'activation', 'tivipanel', 'promax'], default: 'neo' },
    type: { type: String, enum: ['normal', 'm3u', 'mag'], default: 'normal' },
    pack: { type: String }, // Pack ID (String to support 'all' or numeric IDs)
    duration: { type: Number }, // Duration in months
    showBouquetSorter: { type: Boolean, default: true },
    showBouquetSorter: { type: Boolean, default: true },
    bouquetNames: { type: Map, of: String, default: {} }, // Map of bouquetId -> customName
    durationPrices: [{
        duration: { type: Number, required: true }, // e.g. 1, 3, 6, 12
        price: { type: Number, required: true }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
