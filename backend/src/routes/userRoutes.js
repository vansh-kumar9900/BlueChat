const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { listUsers, getMe, uploadAvatar } = require("../controllers/userController");
const { upload } = require("../middleware/uploadMiddleware");

router.get("/me", protect, getMe);
router.get("/", protect, listUsers);
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);

module.exports = router;

