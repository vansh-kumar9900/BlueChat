const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateToken } = require("../utils/generateToken");

exports.signup = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) return res.status(400).json({ message: "Missing fields" });
    if (password.length < 4) return res.status(400).json({ message: "Password too short" });

    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ message: "Username already taken" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash });

    res.status(201).json({ message: "Signup success", userId: user._id });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const sessionToken = generateToken();
    user.sessionToken = sessionToken;
    await user.save();

    res.json({
      message: "Login success",
      token: sessionToken,
      user: {
        _id: user._id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        onlineStatus: user.onlineStatus,
        lastSeen: user.lastSeen
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.sessionToken = null;
    await user.save();
    res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
};

