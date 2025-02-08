const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Set upload directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type"), false);
        }
    }
});

module.exports = upload;
