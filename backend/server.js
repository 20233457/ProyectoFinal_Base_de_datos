const http = require("http");
const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const socketio = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const User = require("./models/User");
const Message = require("./models/Message");
const Chat = require("./models/Chat");
const jwt = require("jsonwebtoken");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.on("auth", async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return;

      socket.userId = user._id.toString();
      socket.username = user.username;

      const prev = onlineUsers.get(socket.userId) || 0;
      onlineUsers.set(socket.userId, prev + 1);

      user.status = "online";
      user.lastSeen = new Date();
      await user.save();

      io.emit("presence", { userId: socket.userId, status: "online" });
    } catch (error) {
      console.error("Error en auth socket:", error.message);
    }
  });

  socket.on("join_chat", (chatID) => {
    if (!chatID) return;
    console.log(`Socket ${socket.id} se unió al chat ${chatID}`);
    socket.join(chatID.toString());
  });

  socket.on("send_message", async (data) => {
    try {
      if (!socket.userId) return;
      const { chatID, text } = data;
      if (!chatID || !text) return;

      const message = await Message.create({
        chatID,
        senderID: socket.userId,
        text,
        type: "text"
      });

      await Chat.findByIdAndUpdate(chatID, { lastMessage: message._id });

      const populated = await message.populate("senderID", "username");

      io.to(chatID.toString()).emit("new_message", {
        _id: populated._id,
        chatID: populated.chatID.toString(),
        senderID: populated.senderID.username,
        text: populated.text,
        type: populated.type,
        createdAt: populated.createdAt
      });
    } catch (error) {
      console.error("Error al enviar mensaje:", error.message);
    }
  });

  socket.on("typing", (data) => {
    if (!socket.userId) return;
    const { chatID, isTyping } = data || {};
    if (!chatID) return;

    io.to(chatID.toString()).emit("typing", {
      chatID,
      userId: socket.userId,
      username: socket.username,
      isTyping
    });
  });

  socket.on("disconnect", async () => {
    console.log("Cliente desconectado:", socket.id);
    if (socket.userId) {
      const prev = onlineUsers.get(socket.userId) || 0;
      const next = prev - 1;
      if (next <= 0) {
        onlineUsers.delete(socket.userId);
        const user = await User.findById(socket.userId);
        if (user) {
          user.status = "offline";
          user.lastSeen = new Date();
          await user.save();
        }
        io.emit("presence", { userId: socket.userId, status: "offline" });
      } else {
        onlineUsers.set(socket.userId, next);
      }
    }
  });
});

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
