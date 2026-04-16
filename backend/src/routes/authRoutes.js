const router = require("express").Router();
const { signup, login, logout } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", protect, logout);

module.exports = router;

