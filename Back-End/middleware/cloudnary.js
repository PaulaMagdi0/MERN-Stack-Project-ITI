// Configure Cloudinary
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig'); // Import Cloudinary config

// Set up Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'goodreads-images',  // Cloudinary folder for all images
        format: async (req, file) => 'png', // Convert all images to PNG format
        public_id: (req, file) => Date.now() + '-' + file.originalname  // Unique filename
    }
});

const upload = multer({ storage: storage });

module.exports = upload;

