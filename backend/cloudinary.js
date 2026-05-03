import { v2 as cloudinary } from 'cloudinary';

// Cloudinary depends on process.env which is populated by dotenv inside index.js
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  // Handling the slight typo CLOUDINART in the .env keys dynamically
  api_secret: process.env.CLOUDINART_SECRET_API_KEY?.trim() || process.env.CLOUDINARY_SECRET_API_KEY?.trim(),
});

export default cloudinary;
