const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { listMyChats, getOrCreateDirectChat, createGroup } = require("../controllers/chatController");

router.get("/", protect, listMyChats);
router.post("/direct", protect, getOrCreateDirectChat);
router.post("/group", protect, createGroup);

module.exports = router;

