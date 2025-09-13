// backend/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    barcode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    weight: { type: Number, required: true },
    mrp: { type: Number, required: true }
});

module.exports = mongoose.model('Product', productSchema);