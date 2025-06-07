const cloudinary = require('cloudinary').v2;
require('dotenv').config(); // Ensure .env variables are loaded

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Optional, but recommended for https URLs
});

module.exports = cloudinary;
