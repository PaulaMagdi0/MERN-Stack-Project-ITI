const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const multerStorageCloudinary = require('multer-storage-cloudinary');

const app = express();

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'your-cloud-name',
    api_key: 'your-api-key',
    api_secret: 'your-api-secret'
});

// Set up multer-storage-cloudinary for image upload
const storage = multerStorageCloudinary({
    cloudinary: cloudinary,
    folder: 'user-images',  // Folder in Cloudinary where images will be stored
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif'],  // Allowed image formats
});

exports.uploadImage = multer({ storage: storage });

// Route for uploading user profile image
exports.uploadImage =  (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded.' });
    }

    res.json({
        message: 'Image uploaded successfully',
        url: req.file.secure_url,  // URL of the uploaded image in Cloudinary
    });
}
