const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

// Load env vars
dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://feriddaghbouji_db_user:OyLOqJgd87aDaVZw@cluster0.wkxzy5g.mongodb.net/test?retryWrites=true&w=majority';

// Connect to DB
mongoose.connect(mongoUri)
    .then(() => {
        console.log('DB Connection Successfull!');
        createProduct();
    })
    .catch((err) => {
        console.error("DB Connection Error:", err);
        process.exit(1);
    });

const createProduct = async () => {
    try {
        const product = new Product({
            title: "Strong 8K IPTV",
            description: "Abonnement Strong 8K - Qualité Premium (+10,000 Chaînes & VOD)",
            price: 50, // Default price, can be edited
            oldPrice: 80,
            hasDiscount: true,
            image: "https://i.imgur.com/yX8b1jM.png", // Placeholder image
            category: "IPTV",
            type: "m3u", // Default to M3U auto-generation
            provider: "strong8k", // IMPORTANT: Set provider to strong8k
            pack: 132, // Default Pack ID from user example (SMALL - ARABIC), user can edit this in Admin
            duration: 12, // Default 12 months
            isFeatured: true
        });

        await product.save();
        console.log("Product 'Strong 8K IPTV' created successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Error creating product:", err);
        process.exit(1);
    }
};
