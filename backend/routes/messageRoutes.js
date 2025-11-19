const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Message = require("../models/Message");
const Chat = require("../models/Chat");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(
      null,
      base.replace(/\s+/g, "_") + "_" + Date.now().toString() + ext
    );
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }
});

router.post(
  "/upload",
  protect,
  upload.single("file"),
  async (req, res) => {
    try {
      const { chatID } = req.body;
      if (!chatID) {
        return res.status(400).json({ message: "chatID requerido" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Archivo requerido" });
      }

      const mediaUrl = "/uploads/" + req.file.filename;
      const mediaType = req.file.mimetype;
      const mediaSize = req.file.size;

      const message = await Message.create({
        chatID,
        senderID: req.user._id,
        type: "media",
        mediaUrl,
        mediaType,
        mediaSize
      });

      await Chat.findByIdAndUpdate(chatID, {
        lastMessage: message._id
      });

      const populated = await message.populate("senderID", "username");

      if (req.io) {
        req.io.to(chatID.toString()).emit("new_message", {
          _id: populated._id,
          chatID: populated.chatID.toString(),
          senderID: populated.senderID.username,
          text: populated.text,
          type: populated.type,
          mediaUrl: populated.mediaUrl,
          mediaType: populated.mediaType,
          mediaSize: populated.mediaSize,
          createdAt: populated.createdAt
        });
      }

      res.json({
        _id: populated._id,
        chatID: populated.chatID,
        senderID: { username: populated.senderID.username },
        type: populated.type,
        mediaUrl: populated.mediaUrl,
        mediaType: populated.mediaType,
        mediaSize: populated.mediaSize,
        createdAt: populated.createdAt
      });
    } catch (error) {
      console.error(error);
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "El archivo supera el límite de 100 MB" });
      }
      res.status(500).json({ message: "Error en el servidor" });
    }
  }
);

module.exports = router;
