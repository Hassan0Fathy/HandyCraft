const Order = require("../models/Order");
const { uploadImage } = require("../utils/cloudinary");
const {
  validateCustomerData,
  validateOrderItems,
  validatePaymentData,
  validateTotalPrice
} = require("../middleware/validators");
const {
  sanitizeCustomer,
  sanitizeItems,
  sanitizePayment
} = require("../middleware/sanitizers");

function isValidTransactionReference(value) {
  return /^\d{11}$/.test(value);
}

async function uploadCustomizationImages(items) {
  const updatedItems = [];

  for (const item of items) {
    const customization = item.customization || {};
    const incomingImages = Array.isArray(customization.images) ? customization.images : [];
    const uploadedImages = [];

    for (const image of incomingImages) {
      if (typeof image === "string" && image.startsWith("data:")) {
        const uploadedUrl = await uploadImage(image, "handycraft/reference-images");
        uploadedImages.push(uploadedUrl);
      } else if (typeof image === "string" && image.trim()) {
        uploadedImages.push(image);
      }
    }

    const { images, ...rest } = customization;

    updatedItems.push({
      ...item,
      customization: {
        ...rest,
        shapes: Array.isArray(customization.shapes) ? customization.shapes : [],
        images: uploadedImages
      }
    });
  }

  return updatedItems;
}

async function createOrder(req, res, next) {
  try {
    const { customer, items, totalPrice, payment } = req.body;

    // Step 1: Basic validation - required fields
    if (!customer || !items || !payment) {
      return res.status(400).json({
        success: false,
        message: "Customer, items, and payment are required"
      });
    }

    // Step 2: Validate customer data
    const customerValidation = validateCustomerData(customer);
    if (!customerValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Customer validation failed",
        errors: customerValidation.errors
      });
    }

    // Step 3: Validate items
    const itemsValidation = validateOrderItems(items);
    if (!itemsValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Items validation failed",
        errors: itemsValidation.errors
      });
    }

    // Step 4: Validate payment data
    const paymentValidation = validatePaymentData(payment);
    if (!paymentValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Payment validation failed",
        errors: paymentValidation.errors
      });
    }

    // Step 5: Validate total price
    const priceValidation = validateTotalPrice(totalPrice, items);
    if (!priceValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Price validation failed",
        errors: priceValidation.errors
      });
    }

    // Step 6: Sanitize all data (prevent injection)
    const sanitizedCustomer = sanitizeCustomer(customer);
    const sanitizedItems = sanitizeItems(items);
    const sanitizedPayment = sanitizePayment(payment);

    // Step 7: Upload customization images
    const itemsWithUploadedImages = await uploadCustomizationImages(sanitizedItems);

    // Step 8: Upload receipt image if provided
    let receiptImageUrl = "";
    if (payment.receiptImage) {
      try {
        receiptImageUrl = await uploadImage(payment.receiptImage, "handycraft/payment-receipts");
      } catch (uploadError) {
        console.error('Receipt image upload failed:', uploadError);
        // Receipt is optional, so continue even if upload fails
        // but log the error for debugging
      }
    }

    // Step 9: Generate orderNumber with format HC-DDMM-XXX
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const ddmm = `${day}${month}`;
    const datePrefix = `HC-${ddmm}`;
    
    // Count existing orders with same DDMM prefix
    const existingOrders = await Order.find({
      orderNumber: { $regex: `^${datePrefix}` }
    }).countDocuments();
    
    const counter = existingOrders + 1;
    const orderNumber = `${datePrefix}-${String(counter).padStart(3, '0')}`;

    // Step 10: Create order in database
    const newOrder = await Order.create({
      customer: sanitizedCustomer,
      items: itemsWithUploadedImages,
      totalPrice: Number(totalPrice),
      payment: {
        method: sanitizedPayment.method,
        transactionReference: sanitizedPayment.transactionReference,
        receiptImageUrl
      },
      orderNumber,
      status: "Pending"
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: newOrder
    });
  } catch (error) {
    // Log detailed error for debugging
    console.error('Order creation error:', error);
    next(error);
  }
}

async function getAllOrders(req, res, next) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
}

async function getSingleOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const allowedStatuses = ["Pending", "Paid", "Completed", "Rejected"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Pending, Paid, Completed, or Rejected"
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus
};
