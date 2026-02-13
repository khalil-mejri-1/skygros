const mongoose = require('mongoose');

const GeneralSettingsSchema = new mongoose.Schema({
    smtpEmail: { type: String, default: "" },
    smtpPassword: { type: String, default: "" },
    footer: {
        aboutText: { type: String, default: "satpromax est en train de devenir un leader mondial dans le domaine du divertissement numérique..." },
        contactNumber: { type: String, default: "+216 22 484 915" },
        facebookLink: { type: String, default: "#" },
        telegramLink: { type: String, default: "#" },
        dynamicSocials: [
            { name: { type: String }, icon: { type: String }, url: { type: String } }
        ],
        col1Title: { type: String, default: "IPTV & Sharing" },
        col1Links: [
            { name: { type: String }, url: { type: String } }
        ],
        col2Title: { type: String, default: "Streaming" },
        col2Links: [
            { name: { type: String }, url: { type: String } }
        ],
        col3Title: { type: String, default: "Cartes Cadeaux" },
        col3Links: [
            { name: { type: String }, url: { type: String } }
        ],
        newsletterTitle: { type: String, default: "Newsletter" },
        newsletterDesc: { type: String, default: "Abonnez-vous pour recevoir des offres spéciales et des cadeaux exclusifs." }
    },
    ranks: [
        {
            name: { type: String, default: "Bronze" },
            minPurchases: { type: Number, default: 0 },
            rewardDemoCount: { type: Number, default: 0 },
            color: { type: String, default: "#cd7f32" },
            icon: { type: String, default: "FaMedal" }
        },
        {
            name: { type: String, default: "Silver" },
            minPurchases: { type: Number, default: 10 },
            color: { type: String, default: "#c0c0c0" },
            icon: { type: String, default: "FaMedal" }
        },
        {
            name: { type: String, default: "Gold" },
            minPurchases: { type: Number, default: 20 },
            color: { type: String, default: "#ffd700" },
            icon: { type: String, default: "FaMedal" }
        }
    ],
    home: {
        carousel: {
            type: [{
                image: { type: String },
                title: { type: String },
                subtitle: { type: String },
                color: { type: String },
                buttonText: { type: String, default: "DÉCOUVRIR" },
                link: { type: String, default: "#" }
            }],
            default: [
                {
                    image: "/assets/slider2.png",
                    title: "Cyberpunk Edge",
                    subtitle: "FUTUR DU GAMING",
                    color: "#ff9900"
                },
                {
                    image: "/assets/slider1.png",
                    title: "Elden Legends",
                    subtitle: "PRÉPAREZ-VOUS À CONQUÉRIR",
                    color: "#8e44ad"
                },
                {
                    image: "/assets/slider3.png",
                    title: "Sports Mondiaux",
                    subtitle: "EXPÉRIENCE ULTIME",
                    color: "#00d285"
                }
            ]
        },
        statsCards: {
            type: [{
                title: { type: String },
                value: { type: String },
                icon: { type: String },
                accent: { type: String },
                label: { type: String }
            }],
            default: [
                {
                    title: "Total Codes",
                    value: "2,245",
                    icon: "FaShoppingCart",
                    accent: "#0099ff",
                    label: "ACHETÉS"
                },
                {
                    title: "Abos Actifs",
                    value: "16",
                    icon: "MdOndemandVideo",
                    accent: "#ff4757",
                    label: "beIN Sports"
                },
                {
                    title: "Sur Demande",
                    value: "51",
                    icon: "FaUser",
                    accent: "#00d285",
                    label: "REQUÊTES"
                }
            ]
        },
        bestSellers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
        sports: {
            type: [{
                name: { type: String },
                image: { type: String }
            }],
            default: []
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('GeneralSettings', GeneralSettingsSchema);
