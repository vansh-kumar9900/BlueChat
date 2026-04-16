const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { getMessages, markRead, getUnreadCounts } = require("../controllers/messageController");

router.get("/unread-counts", protect, getUnreadCounts);
router.get("/:chatId", protect, getMessages);
router.post("/:chatId/read", protect, markRead);

module.exports = router;

