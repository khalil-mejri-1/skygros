const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

// Load env vars
dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://feriddaghbouji_db_user:OyLOqJgd87aDaVZw@cluster0.wkxzy5g.mongodb.net/skygros?retryWrites=true&w=majority';

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
            title: "U8K IPTV",
            description: "Abonnement U8K - Server Premium et Stable",
            price: 50, // Default price, can be edited
            oldPrice: 80,
            hasDiscount: true,
            image: "https://i.imgur.com/yX8b1jM.png", // Placeholder image
            category: "ABONNEMENT IPTV",
            type: "m3u", // Default to M3U auto-generation
            provider: "u8k", // IMPORTANT: Set provider to u8k
            pack: "*", 
            duration: 12, // Default 12 months
            isFeatured: true
        });

        await product.save();
        console.log("Product 'U8K IPTV' created successfully under 'ABONNEMENT IPTV'!");
        process.exit(0);
    } catch (err) {
        console.error("Error creating product:", err);
        process.exit(1);
    }
};
