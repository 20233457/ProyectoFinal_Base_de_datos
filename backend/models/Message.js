const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true
    },
    senderID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    text: { type: String },
    type: { type: String, enum: ["text", "media"], default: "text" },
    mediaUrl: { type: String },
    mediaType: { type: String },
    mediaSize: { type: Number }
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
