const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

// Security middleware
app.use(helmet()); // Adds various HTTP headers for security

// Rate limiting - prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Increased to allow more interactions
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => req.path.startsWith('/api/upload') // Skip uploads to allow multiple photos
});

const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // max 50 orders per hour per IP
  message: 'Too many orders from this IP, please try again later.'
});

app.use(limiter);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in the allowed list
    if (allowedOrigins.includes(origin)) return callback(null, true);
    
    // Check if it's a localhost origin
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) return callback(null, true);
    
    // Check if it's a Netlify, Render, or Cloudflare Pages subdomain
    if (origin.endsWith('.netlify.app') || origin.endsWith('.onrender.com') || origin.endsWith('.pages.dev') || origin.endsWith('.runasp.net')) return callback(null, true);
    
    console.warn(`CORS blocked request from origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.get("/", (req, res) => {
  res.json({
    message: "HandyCraft backend is running"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy"
  });
});

app.get("/api/config", (req, res) => {
  res.json({
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:5000/api',
    ENVIRONMENT: process.env.NODE_ENV || 'development'
  });
});

// Auth routes (login endpoint for admin)
app.use("/api/auth", authRoutes);
// also expose admin login path for compatibility
app.use("/api/admin", authRoutes);

// Order routes with rate limiting
app.use("/api/orders", orderLimiter, orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.use((error, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const statusCode = error.statusCode || error.status || 500;
  const message = error.message || "An error occurred";

  // Log error details (for debugging)
  console.error({
    status: statusCode,
    message,
    ...(isDevelopment && { stack: error.stack })
  });

  // Send safe error response (don't expose stack traces in production)
  res.status(statusCode).json({
    success: false,
    message,
    ...(isDevelopment && { stack: error.stack })
  });
});

module.exports = app;
