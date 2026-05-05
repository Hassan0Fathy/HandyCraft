const express = require("express");

const {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus
} = require("../controllers/orderController");

const { verifyAuth } = require("../middleware/auth");

const router = express.Router();

// POST /api/orders - Create order (public endpoint, rate limited)
router.post("/", createOrder);

// GET /api/orders - Get all orders (protected - admin only)
router.get("/", verifyAuth, getAllOrders);

// GET /api/orders/:id - Get single order (protected - admin only)
router.get("/:id", verifyAuth, getSingleOrder);

// PATCH /api/orders/:id - Update order status (protected - admin only)
router.patch("/:id", verifyAuth, updateOrderStatus);

module.exports = router;
