const User = require("../models/User");

async function protect(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) return res.status(401).json({ message: "No token" });

    const user = await User.findOne({ sessionToken: token }).select("-passwordHash");
    if (!user) return res.status(401).json({ message: "Invalid token" });

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { protect };

