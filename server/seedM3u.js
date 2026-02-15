const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://feriddaghbouji_db_user:OyLOqJgd87aDaVZw@cluster0.wkxzy5g.mongodb.net/skygros?retryWrites=true&w=majority')
    .then(() => {
        console.log('DB Connection Successfull!');
        seedProduct();
    })
    .catch((err) => {
        console.error(err);
    });

const seedProduct = async () => {
    try {
        const m3uProduct = new Product({
            title: "IPTV Ultra Premium",
            description: "Accès illimité à +10,000 chaînes et VOD (Films & Séries). Qualité 4K/FHD/HD. Compatible Smart TV, Android Box, Mag, Smartphone, PC.",
            price: 49.99,
            oldPrice: 79.99,
            hasDiscount: true,
            image: "https://i.imgur.com/3p9F0wJ.jpg", // Placeholder or generic IPTV image
            category: "IPTV",
            subcategory: "Premium",
            keys: [], // No keys needed for m3u auto-generation
            isFeatured: true,
            type: "m3u",
            pack: 0, // Default pack, will be overridden by user selection or fixed if needed
            duration: 12 // Default duration
        });

        await m3uProduct.save();
        console.log("M3U Product Added Successfully!");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
