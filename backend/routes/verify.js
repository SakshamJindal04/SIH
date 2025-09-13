const express = require("express");
const router = express.Router();
const Verification = require("../models/Verification");
const QRCode = require("qrcode");

// POST /verify
router.post("/", async (req, res) => {
  try {
    const { weight, barcode, mrp, expiry } = req.body;

    // Basic validation
    let status = "PASS";
    let reason = "";

    if (!weight || weight <= 0) {
      status = "FAIL";
      reason = "Invalid weight";
    }
    if (!barcode || !barcode.startsWith("89")) {
      status = "FAIL";
      reason = "Invalid barcode";
    }
    if (new Date(expiry) <= new Date()) {
      status = "FAIL";
      reason = "Expired product";
    }

    // Create QR data if PASS
    let qrData = null;
    if (status === "PASS") {
      qrData = await QRCode.toDataURL(JSON.stringify({ barcode, weight, mrp, expiry }));
    }

    // Save in DB
    const verification = new Verification({
      weight,
      barcode,
      mrp,
      expiry,
      status,
      reason,
      qrData,
    });
    await verification.save();

    res.json({ status, reason, qrData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
