// Use centralized cloudinary config
const cloudinary = require('../config/cloudinary');

async function uploadImage(imageData, folder) {
  if (!imageData) return '';
  const result = await cloudinary.uploader.upload(imageData, { folder });
  return result.secure_url;
}

module.exports = { uploadImage };
