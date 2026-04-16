const User = require("../models/User");

exports.getMe = async (req, res) => {
  res.json(req.user);
};

exports.listUsers = async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    const filter = q ? { username: { $regex: q, $options: "i" } } : {};

    const users = await User.find(filter).select("_id username avatarUrl onlineStatus lastSeen");
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file" });

    // backend serves /uploads as static
    const avatarUrl = `/uploads/${req.file.filename}`;

    const user = await User.findById(req.user._id);
    user.avatarUrl = avatarUrl;
    await user.save();

    res.json({ avatarUrl });
  } catch (err) {
    next(err);
  }
};

