const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

router.post("/register", async (req, res) => {
  console.log('>>>Llego a /api/auth/register', req.body);
  try {
    const { username, email, phone, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Usuario y contraseña son obligatorios" });
    }

    const existingUser = await User.findOne({
      $or: [
        { username },
        email ? { email } : null,
        phone ? { phone } : null
      ].filter(Boolean)
    });

    if (existingUser) {
      return res.status(400).json({ message: "Usuario, correo o teléfono ya registrado" });
    }

    const user = await User.create({
      username,
      email: email || undefined,
      phone: phone || undefined,
      password
    });

    const token = createToken(user._id);

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        status: user.status,
        lastSeen: user.lastSeen
      },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: "Faltan credenciales" });
    }

    const user = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier },
        { phone: identifier }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    const token = createToken(user._id);

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        status: user.status,
        lastSeen: user.lastSeen
      },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
