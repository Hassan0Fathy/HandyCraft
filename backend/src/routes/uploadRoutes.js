const express = require("express");
const cloudinary = require("../config/cloudinary");
const { verifyAuth } = require("../middleware/auth");
const multer = require("multer");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});
// Public upload for customer order images (no auth required)
router.post("/public", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    console.log(`[Cloudinary] Starting public upload. Size: ${(req.file.size / 1024).toFixed(2)}KB, Type: ${req.file.mimetype}`);

    // Convert buffer to data URI
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const start = Date.now();
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "handycraft/customer-uploads",
      resource_type: "auto",
      timeout: 120000
    });
    const duration = Date.now() - start;

    console.log(`[Cloudinary] Public upload success in ${duration}ms. URL: ${result.secure_url}`);

    return res.json({ 
      success: true, 
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (err) {
    console.error("[Cloudinary] Public upload failure:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/image", verifyAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "handycraft/products",
      timeout: 120000
    });

    return res.json({ success: true, url: result.secure_url });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;