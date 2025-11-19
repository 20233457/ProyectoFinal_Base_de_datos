const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    isGroup: { type: Boolean, default: false },
    name: { type: String },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null
    }
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
