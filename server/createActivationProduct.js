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
            title: "Activation Panel IPTV",
            description: "Abonnement Activation Panel - +12,000 Chaînes & VOD (4K/FHD)",
            price: 45, // Default price
            oldPrice: 75,
            hasDiscount: true,
            image: "https://i.imgur.com/example.png", // Placeholder image
            category: "IPTV",
            type: "m3u", // Default to M3U
            provider: "activation", // IMPORTANT: Set provider to activation
            pack: "132", // Default Pack ID (String)
            duration: 12, // Default 12 months
            isFeatured: true
        });

        await product.save();
        console.log("Product 'Activation Panel IPTV' created successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Error creating product:", err);
        process.exit(1);
    }
};
