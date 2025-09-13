// backend/models/Verification.js
const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
    barcode: { type: String, required: true },
    status: { type: String, enum: ['PASS', 'FAIL'], required: true },
    reason: { type: String, default: null },
    qrCodeData: { type: String, default: null },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }, // Link to Customer
    scanCount: { type: Number, default: 0 }, // To track QR scans
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Verification', verificationSchema);