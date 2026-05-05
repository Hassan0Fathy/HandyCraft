const jwt = require('jsonwebtoken');

/**
 * Verify JWT token from request header
 */
function verifyAuth(req, res, next) {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        message: 'Server misconfigured: JWT secret not set'
      });
    }

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided'
      });
    }

    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}

/**
 * Generate JWT token for admin login
 */
function generateToken(adminId) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('Server misconfigured: JWT secret not set');
  }

  return jwt.sign(
    { adminId, role: 'admin' },
    jwtSecret,
    { expiresIn: '24h' }
  );
}

module.exports = {
  verifyAuth,
  generateToken
};
