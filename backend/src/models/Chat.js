const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    isGroup: { type: Boolean, default: false },
    name: { type: String, default: "" }, // for groups
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    avatarUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);

