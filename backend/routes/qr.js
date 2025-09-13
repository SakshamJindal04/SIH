const express = require("express");
const router = express.Router();
const QRCode = require("qrcode");

// POST /qr
router.post("/", async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: "Missing data for QR" });

    const qr = await QRCode.toDataURL(JSON.stringify(data));
    res.json({ qr });
  } catch (err) {
    res.status(500).json({ error: "QR generation failed" });
  }
});

module.exports = router;
