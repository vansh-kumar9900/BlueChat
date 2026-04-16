const Message = require("../models/Message");
const Chat = require("../models/Chat");

exports.getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const allowed = chat.members.map(String).includes(String(req.user._id));
    if (!allowed) return res.status(403).json({ message: "Not allowed" });

    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 })
      .populate("sender", "_id username avatarUrl");

    res.json(messages);
  } catch (err) {
    next(err);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const me = req.user._id;

    await Message.updateMany(
      { chatId, sender: { $ne: me }, readBy: { $ne: me } },
      { $addToSet: { readBy: me } }
    );

    res.json({ message: "Marked read" });
  } catch (err) {
    next(err);
  }
};

exports.getUnreadCounts = async (req, res, next) => {
  try {
    const me = req.user._id;
    const chats = await Chat.find({ members: me }).select("_id");

    const counts = {};
    for (const c of chats) {
      // eslint-disable-next-line no-await-in-loop
      const n = await Message.countDocuments({
        chatId: c._id,
        sender: { $ne: me },
        readBy: { $ne: me }
      });
      counts[String(c._id)] = n;
    }

    res.json(counts);
  } catch (err) {
    next(err);
  }
};

