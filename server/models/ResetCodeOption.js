const mongoose = require('mongoose');

const ResetCodeOptionSchema = new mongoose.Schema({
    label: { type: String, required: true },
    value: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('ResetCodeOption', ResetCodeOptionSchema);
