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
    methods: ["GET", "POST"],
  },
});

/**
 * Guardamos los usuarios conectados:
 * userId -> Set<socketId>
 */
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  /**
   * El frontend debe mandar el token JWT por este evento "auth"
   * inmediatamente después de conectarse al socket.
   */
  socket.on("auth", async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return;

      socket.userId = user._id.toString();
      socket.username = user.username;

      // Registramos el socket en la lista de sockets del usuario
      let sockets = onlineUsers.get(socket.userId);
      if (!sockets) {
        sockets = new Set();
      }
      sockets.add(socket.id);
      onlineUsers.set(socket.userId, sockets);

      // Marcamos usuario como online
      user.status = "online";
      user.lastSeen = new Date();
      await user.save();

      io.emit("presence", { userId: socket.userId, status: "online" });
      console.log(`Usuario ${socket.username} (${socket.userId}) online`);
    } catch (error) {
      console.error("Error en auth socket:", error.message);
    }
  });

  socket.on("join_chat", (chatID) => {
    if (!chatID) return;
    console.log(`Socket ${socket.id} se unió al chat ${chatID}`);
    socket.join(chatID.toString());
  });

  /**
   * Enviar mensaje
   * data: { chatID, text, type? }
   */
  socket.on("send_message", async (data) => {
    try {
      if (!socket.userId) return;

      const { chatID, text, type } = data || {};
      if (!chatID || !text) return;

      // 1) Crear mensaje
      const message = await Message.create({
        chatID,
        senderID: socket.userId,
        text,
        type: type || "text",
        // readBy al inicio vacío (solo se irá llenando cuando usuarios lean)
      });

      // 2) Actualizar último mensaje del chat
      await Chat.findByIdAndUpdate(chatID, { lastMessage: message._id });

      // 3) Obtener mensaje con datos del remitente
      const populated = await message
        .populate("senderID", "username")
        .execPopulate?.(); // según versión de mongoose
      // por si execPopulate no existe, fallback:
      const msgDoc = populated || message;

      const outgoingMessage = {
        _id: msgDoc._id.toString(),
        chatID: msgDoc.chatID.toString(),
        senderID: msgDoc.senderID._id.toString(),
        senderUsername: msgDoc.senderID.username,
        text: msgDoc.text,
        type: msgDoc.type,
        createdAt: msgDoc.createdAt,
        readBy: (msgDoc.readBy || []).map((id) => id.toString()),
      };

      // 4) Emitir mensaje al room del chat (usuarios que ya están dentro)
      io.to(chatID.toString()).emit("new_message", outgoingMessage);

      // 5) Obtener info del chat para la lista (incluyendo participantes)
      const chat = await Chat.findById(chatID)
        .populate("participants", "username status")
        .populate("lastMessage")
        .lean();

      if (!chat) return;

      const chatSummary = {
        _id: chat._id.toString(),
        isGroup: chat.isGroup || false,
        name: chat.name || null,
        participants: chat.participants.map((u) => ({
          _id: u._id.toString(),
          username: u.username,
          status: u.status || "offline",
        })),
        lastMessage: chat.lastMessage
          ? {
              _id: chat.lastMessage._id.toString(),
              text: chat.lastMessage.text,
              type: chat.lastMessage.type,
              senderID: chat.lastMessage.senderID?.toString?.() || null,
              createdAt: chat.lastMessage.createdAt,
            }
          : {
              _id: outgoingMessage._id,
              text: outgoingMessage.text,
              type: outgoingMessage.type,
              senderID: outgoingMessage.senderID,
              createdAt: outgoingMessage.createdAt,
            },
      };

      // 6) Avisar a TODOS los participantes, aunque no estén en el room
      //    Esto permite que, si es un chat nuevo para alguien, le aparezca
      //    en la lista de la izquierda.
      chatSummary.participants.forEach((participant) => {
        const targetUserId = participant._id;
        const sockets = onlineUsers.get(targetUserId);
        if (!sockets) return;

        sockets.forEach((sid) => {
          io.to(sid).emit("chat_updated", {
            chat: chatSummary,
            fromUserId: socket.userId,
          });
        });
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
      isTyping,
    });
  });

  // 👇 Confirmación de lectura
  socket.on("messages_read", async ({ chatID, lastMessageId }) => {
    try {
      if (!socket.userId || !chatID) return;

      const filter = {
        chatID,
        readBy: { $ne: socket.userId },
      };

      if (lastMessageId) {
        filter._id = { $lte: lastMessageId };
      }

      await Message.updateMany(filter, {
        $addToSet: { readBy: socket.userId },
      });

      // Avisar a todos en ese chat que este usuario ya leyó
      io.to(chatID.toString()).emit("messages_read", {
        chatID,
        userId: socket.userId,
        lastMessageId: lastMessageId || null,
      });
    } catch (err) {
      console.error("Error en messages_read:", err.message);
    }
  });

  socket.on("disconnect", async () => {
    console.log("Cliente desconectado:", socket.id);

    if (socket.userId) {
      const sockets = onlineUsers.get(socket.userId);

      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          // último socket de ese usuario: marcarlo offline
          onlineUsers.delete(socket.userId);

          const user = await User.findById(socket.userId);
          if (user) {
            user.status = "offline";
            user.lastSeen = new Date();
            await user.save();
          }
          io.emit("presence", { userId: socket.userId, status: "offline" });
        } else {
          // aún tiene otros sockets abiertos
          onlineUsers.set(socket.userId, sockets);
        }
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
