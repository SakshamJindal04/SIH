const express = require("express");
const router = express.Router();
const Verification = require("../models/Verification");

// GET /logs
router.get("/", async (req, res) => {
  try {
    const logs = await Verification.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

module.exports = router;
