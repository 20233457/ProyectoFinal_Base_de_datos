const express = require("express");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
      .populate("participants", "username status")
      .populate({
        path: "lastMessage",
        select: "text type createdAt"
      })
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

router.post("/create-or-get", protect, async (req, res) => {
  try {
    const { otherUserId } = req.body;
    if (!otherUserId) {
      return res.status(400).json({ message: "otherUserId requerido" });
    }

    let chat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [req.user._id, otherUserId] }
    })
      .populate("participants", "username status")
      .populate("lastMessage");

    if (!chat) {
      chat = await Chat.create({
        isGroup: false,
        participants: [req.user._id, otherUserId]
      });
      chat = await chat.populate("participants", "username status");
    }

    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

router.post("/create-group", protect, async (req, res) => {
  try {
    const { name, participantIds } = req.body;
    if (!name || !participantIds || !participantIds.length) {
      return res.status(400).json({ message: "Nombre y participantes requeridos" });
    }

    const uniqueIds = Array.from(new Set([...participantIds, String(req.user._id)]));

    let chat = await Chat.create({
      isGroup: true,
      name,
      participants: uniqueIds
    });

    chat = await chat.populate("participants", "username status");

    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

router.get("/:chatId/messages", protect, async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chatID: chatId })
      .populate("senderID", "username")
      .sort({ createdAt: 1 });

    const mapped = messages.map((m) => ({
      _id: m._id,
      chatID: m.chatID,
      senderID: { username: m.senderID.username },
      text: m.text,
      type: m.type,
      mediaUrl: m.mediaUrl,
      mediaType: m.mediaType,
      mediaSize: m.mediaSize,
      createdAt: m.createdAt
    }));

    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
