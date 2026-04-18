const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    hasDiscount: { type: Boolean, default: false },
    image: { type: String, required: true },
    secondaryImages: [String],
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
    provider: { type: String, enum: ['neo', 'strong8k', 'activation', 'tivipanel', 'tivione', 'promax', 'mango', 'golden', 'u8k'], default: 'neo' },
    type: { type: String, enum: ['normal', 'm3u', 'mag', 'mango', 'activecode'], default: 'normal' },
    pack: { type: String }, // Pack ID (String to support 'all' or numeric IDs)
    duration: { type: Number }, // Duration in months
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 21883 },
    guarantees: { 
        type: [String], 
        default: [
            "Satisfait ou remboursé 30 jours",
            "Livraison suivie et sécurisée",
            "Support client réactif 7j/7"
        ] 
    },
    showBouquetSorter: { type: Boolean, default: true },
    showCountrySelector: { type: Boolean, default: true },
    bouquetNames: { type: Map, of: String, default: {} }, // Map of bouquetId -> customName
    deliveryType: { type: String, enum: ['codes', 'link'], default: 'codes' },
    deliveryLink: { type: String },
    hasMultiDuration: { type: Boolean, default: false },
    durationPrices: [{
        duration: { type: String, required: true }, // e.g. "1 mois", "5 mois", "1 an"
        price: { type: Number, required: true },
        oldPrice: { type: Number }
    }],
    metaTitle: { type: String },
    metaDescription: { type: String },
    apiConfig: {
        apiKey: { type: String },
        apiSecret: { type: String },
        clientId: { type: String },
        paymentPassword: { type: String },
        baseUrl: { type: String }
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
