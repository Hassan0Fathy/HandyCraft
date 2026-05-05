const express = require("express");
const { login } = require("../controllers/authController");

const router = express.Router();

/**
 * POST /api/auth/login
 * Admin login endpoint
 * Body: { password: "your-password" }
 * Returns: { token: "jwt-token", expiresIn: "24h" }
 */
router.post("/login", login);

module.exports = router;
