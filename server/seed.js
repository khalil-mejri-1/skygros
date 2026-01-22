const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const url = process.env.MONGO_URI || 'mongodb+srv://feriddaghbouji_db_user:ow6ytVLbpYNxGBtC@cluster0.wkxzy5g.mongodb.net/';

const products = [
    {
        title: "Cyber Warrior 2077",
        description: "Experience the future of warfare in this adrenaline-pumping action RPG. Explore a vast open world and customize your cybernetic enhancements.",
        price: 59.99,
        image: "/assets/game_cover.png",
        category: "Games",
        isFeatured: true
    },
    {
        title: "Space Odyssey: Horizons",
        description: "Command your starship and explore the galaxy. Engage in epic space battles and discover new civilizations.",
        price: 49.99,
        image: "/assets/game_cover.png",
        category: "Games",
        isFeatured: true
    },
    {
        title: "$50 Steam Gift Card",
        description: "Add $50 to your Steam Wallet. Buy games, software, and more on the Steam platform.",
        price: 50.00,
        image: "/assets/gift_card.png",
        category: "Gift Cards",
        isFeatured: false
    },
    {
        title: "$100 PlayStation Store Card",
        description: "Top up your PSN wallet. Purchase games, add-ons, and movies from the PlayStation Store.",
        price: 100.00,
        image: "/assets/gift_card.png",
        category: "Gift Cards",
        isFeatured: true
    },
    {
        title: "Apex Legends Coin Pack",
        description: "Get 1000 Apex Coins + Bonus. Customize your character and weapons with exclusive skins.",
        price: 9.99,
        image: "/assets/game_cover.png",
        category: "In-Game Currency",
        isFeatured: false
    },
    {
        title: "Netflix Subscription 1 Month",
        description: "Stream your favorite movies and TV shows for a whole month. Ultra HD available.",
        price: 15.99,
        image: "/assets/gift_card.png",
        category: "Subscriptions",
        isFeatured: false
    }
];

const seedDB = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(url);
        console.log("Connected. Clearing DB...");
        await Product.deleteMany({});
        console.log("Seeding...");
        await Product.insertMany(products);
        console.log("Database Seeded Successfully!");
        process.exit();
    } catch (err) {
        console.log("Error:", err);
        process.exit(1);
    }
};

seedDB();
