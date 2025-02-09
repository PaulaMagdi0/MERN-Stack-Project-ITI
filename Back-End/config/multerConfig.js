const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define upload directories
const UPLOAD_DIR = path.join(__dirname, "../uploads");
const IMAGE_DIR = path.join(UPLOAD_DIR, "images");
const PDF_DIR = path.join(UPLOAD_DIR, "pdfs");

// Function to create directories safely
const ensureDirectoryExists = (dir) => {
    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    } catch (error) {
        console.error(`Error creating directory ${dir}:`, error);
    }
};

// Create directories
[UPLOAD_DIR, IMAGE_DIR, PDF_DIR].forEach(ensureDirectoryExists);

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dest;
        if (file.fieldname === "image") {
            dest = IMAGE_DIR;
        } else if (file.fieldname === "pdf") {
            dest = PDF_DIR;
        } else {
            return cb(new Error("Invalid fieldname for upload"), false);
        }
        ensureDirectoryExists(dest);
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename
        const ext = path.extname(file.originalname);
        const sanitizedFilename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, "_");
        const timestamp = Date.now();
        cb(null, `${file.fieldname}-${sanitizedFilename}-${timestamp}${ext}`);
    }
});

// File filter for validation
const fileFilter = (req, file, cb) => {
    const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const allowedPdfType = "application/pdf";

    if (file.fieldname === "image" && allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
    } else if (file.fieldname === "pdf" && file.mimetype === allowedPdfType) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: Images (jpeg, png, gif, webp) & PDFs.`), false);
    }
};

// Multer upload instance
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

module.exports = upload;
