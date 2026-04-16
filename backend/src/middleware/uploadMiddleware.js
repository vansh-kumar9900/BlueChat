const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  }
});

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) return cb(new Error("Only images allowed"));
  cb(null, true);
}

const upload = multer({ storage, fileFilter });

module.exports = { upload };

