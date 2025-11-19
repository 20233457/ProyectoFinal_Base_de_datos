const express = require("express");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/search", protect, async (req, res) => {
  try {
    const q = req.query.q || "";
    if (!q) return res.json([]);

    const users = await User.find({
      username: { $regex: q, $options: "i" }
    })
      .select("_id username email phone status lastSeen")
      .limit(20);

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
