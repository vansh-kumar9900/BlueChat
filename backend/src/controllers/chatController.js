const Chat = require("../models/Chat");

exports.getOrCreateDirectChat = async (req, res, next) => {
  try {
    const { otherUserId } = req.body;
    const me = req.user._id;

    if (!otherUserId) return res.status(400).json({ message: "Missing otherUserId" });

    // Find existing 1-1 chat (members exactly 2)
    let chat = await Chat.findOne({
      isGroup: false,
      members: { $all: [me, otherUserId] },
      $expr: { $eq: [{ $size: "$members" }, 2] }
    });

    if (!chat) {
      chat = await Chat.create({ isGroup: false, members: [me, otherUserId] });
    }

    res.json(chat);
  } catch (err) {
    next(err);
  }
};

exports.createGroup = async (req, res, next) => {
  try {
    const { name, memberIds } = req.body;

    if (!name || !Array.isArray(memberIds) || memberIds.length < 2) {
      return res.status(400).json({ message: "Need group name + at least 2 other members" });
    }

    const members = Array.from(new Set([String(req.user._id), ...memberIds.map(String)]));

    const chat = await Chat.create({
      isGroup: true,
      name,
      members
    });

    res.status(201).json(chat);
  } catch (err) {
    next(err);
  }
};

exports.listMyChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ members: req.user._id })
      .sort({ updatedAt: -1 })
      .populate("members", "_id username avatarUrl onlineStatus lastSeen");

    res.json(chats);
  } catch (err) {
    next(err);
  }
};

