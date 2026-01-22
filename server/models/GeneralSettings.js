const mongoose = require('mongoose');

const GeneralSettingsSchema = new mongoose.Schema({
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
    }
}, { timestamps: true });

module.exports = mongoose.model('GeneralSettings', GeneralSettingsSchema);
