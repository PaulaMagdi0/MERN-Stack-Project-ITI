require("dotenv").config(); // Load environment variables

const cloudinary = require("cloudinary").v2; // Correct import for v2

// Configure Cloudinary using environment variables
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

module.exports = cloudinary; // Export to use in other parts of your app
