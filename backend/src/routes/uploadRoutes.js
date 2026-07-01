const express = require("express");
const cloudinary = require("../config/cloudinary");
const { verifyAuth } = require("../middleware/auth");
const multer = require("multer");
const streamifier = require("streamifier");

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

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "handycraft/products",
        timeout: 120000
      },
      (error, result) => {
        console.timeEnd("CloudinaryUpload");
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ success: false, message: error.message });
        }
        console.timeEnd("BackendTotalTime");
        return res.json({ success: true, url: result.secure_url });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;