const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    senderID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: { type: String },
    type: { type: String, enum: ["text", "media"], default: "text" },

    mediaUrl: { type: String },
    mediaType: { type: String },
    mediaSize: { type: Number },

    // 👇 NUEVO: usuarios que leyeron el mensaje
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
