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
            title: "TiviPanel IPTV",
            description: "Abonnement TiviPanel - Qualité Exceptionnelle - M3U/MAG",
            price: 55, // Default price
            oldPrice: 85,
            hasDiscount: true,
            image: "https://i.imgur.com/tiviexample.png", // Placeholder image
            category: "IPTV",
            type: "m3u", // Default to M3U
            provider: "tivipanel", // IMPORTANT: Set provider to tivipanel
            pack: "1", // Default Pack ID (String) - Assuming '1' maps to a valid package/duration
            duration: 12, // Default 12 months (This might be ignored if 'pack' covers duration)
            isFeatured: true
        });

        await product.save();
        console.log("Product 'TiviPanel IPTV' created successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Error creating product:", err);
        process.exit(1);
    }
};
