require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const { createApp } = require("./app");
const { connectDB } = require("./config/db");

const User = require("./models/User");
const Chat = require("./models/Chat");
const Message = require("./models/Message");

const app = createApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (origin === process.env.CLIENT_ORIGIN) return cb(null, true);
      try {
        const url = new URL(origin);
        if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
          return cb(null, true);
        }
      } catch {
        // ignore
      }
      return cb(new Error(`Not allowed by CORS: ${origin}`));
    }
  }
});

// userId -> socketId (simple in-memory presence)
const onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("user_connected", async ({ userId }) => {
    if (!userId) return;

    onlineUsers.set(String(userId), socket.id);

    await User.findByIdAndUpdate(userId, { onlineStatus: true });
    io.emit("presence_update", { userId, onlineStatus: true });
  });

  socket.on("join_chat", ({ chatId }) => {
    if (!chatId) return;
    socket.join(String(chatId));
  });

  socket.on("leave_chat", ({ chatId }) => {
    if (!chatId) return;
    socket.leave(String(chatId));
  });

  socket.on("typing", ({ chatId, userId }) => {
    if (!chatId || !userId) return;
    socket.to(String(chatId)).emit("typing", { chatId, userId });
  });

  socket.on("stop_typing", ({ chatId, userId }) => {
    if (!chatId || !userId) return;
    socket.to(String(chatId)).emit("stop_typing", { chatId, userId });
  });

  socket.on("send_message", async ({ chatId, senderId, text }) => {
    try {
      if (!chatId || !senderId || !text?.trim()) return;

      const chat = await Chat.findById(chatId);
      if (!chat) return;

      const msg = await Message.create({
        chatId,
        sender: senderId,
        text: text.trim(),
        readBy: [senderId]
      });

      // bump chat updatedAt
      chat.updatedAt = new Date();
      await chat.save();

      const populated = await Message.findById(msg._id).populate("sender", "_id username avatarUrl");
      io.to(String(chatId)).emit("receive_message", populated);
    } catch (e) {
      console.error("send_message error", e);
    }
  });

  socket.on("disconnect", async () => {
    try {
      let disconnectedUserId = null;
      for (const [userId, sid] of onlineUsers.entries()) {
        if (sid === socket.id) disconnectedUserId = userId;
      }
      if (!disconnectedUserId) return;

      onlineUsers.delete(disconnectedUserId);

      const lastSeen = new Date();
      await User.findByIdAndUpdate(disconnectedUserId, {
        onlineStatus: false,
        lastSeen
      });

      io.emit("presence_update", {
        userId: disconnectedUserId,
        onlineStatus: false,
        lastSeen
      });
    } catch (e) {
      console.error("disconnect error", e);
    }
  });
});

(async () => {
  await connectDB(process.env.MONGO_URI);

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();

