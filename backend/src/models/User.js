const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true, trim: true },
    passwordHash: { type: String, required: true },

    // Simple auth: store a random token in DB on login
    sessionToken: { type: String, default: null },

    avatarUrl: { type: String, default: "" },

    onlineStatus: { type: Boolean, default: false },
    lastSeen: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

