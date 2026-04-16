const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

function createApp() {
  const app = express();

  // Allow localhost dev ports (5173/5174) without fighting CORS.
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        const allowed = [process.env.CLIENT_ORIGIN].filter(Boolean);
        if (allowed.includes(origin)) return cb(null, true);

        // Dev-friendly: allow localhost/127.0.0.1 on any port.
        try {
          const url = new URL(origin);
          if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
            return cb(null, true);
          }
        } catch {
          // If origin isn't a valid URL, treat it as disallowed.
        }

        return cb(new Error(`Not allowed by CORS: ${origin}`));
      }
    })
  );
  app.use(express.json());
  app.use(morgan("dev"));

  // Serve uploaded avatars
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/chats", chatRoutes);
  app.use("/api/messages", messageRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

