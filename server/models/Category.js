const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    icon: { type: String, required: true }, // Can be a React Icon name or Image URL
    subcategories: [{ type: String }],
    description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
