const jwt = require("jsonwebtoken");

/**
 * Admin login - simple password-based auth
 * In production, use a proper user model with bcrypt hashing
 */
async function login(req, res, next) {
  try {
    const { password } = req.body;

    // Use environment variable for admin password
    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;
    if (!adminPassword || !jwtSecret) {
      return res.status(500).json({ error: "Server config error" });
    }

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    // Simple comparison (in production, use bcrypt.compare)
    if (password !== adminPassword) {
      return res.status(401).json({ error: "Wrong password" });
    }

    const token = jwt.sign({ role: "admin" }, jwtSecret);
    return res.json({ token });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login
};
