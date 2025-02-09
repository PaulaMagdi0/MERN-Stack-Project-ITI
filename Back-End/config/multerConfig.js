const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cloudinary = require('./cloudinaryConfig'); // Assuming Cloudinary is correctly configured

// Ensure "uploads" directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `image-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// Middleware for handling file uploads
module.exports = upload;
