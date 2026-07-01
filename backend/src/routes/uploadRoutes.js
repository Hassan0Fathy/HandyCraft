const express = require("express");
const cloudinary = require("../config/cloudinary");
const { verifyAuth } = require("../middleware/auth");
const multer = require("multer");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// ... (other routes)

router.post("/image", verifyAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    console.time("BackendTotalTime");
    console.time("CloudinaryUpload");

    // Convert buffer to base64 data URI to use upload() instead of upload_stream()
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "handycraft/products",
    });

    console.timeEnd("CloudinaryUpload");
    console.timeEnd("BackendTotalTime");
    
    return res.json({ success: true, url: result.secure_url });

  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;