const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    subcategory: {
      type: String,
      trim: true,
      default: ""
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    customization: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      governorate: { type: String, required: true, trim: true, enum: ["Cairo", "Giza"] },
      instagram: { type: String, trim: true, default: "" }
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "Order must contain at least one item"
      }
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    payment: {
      method: { type: String, required: true, trim: true },
      gmail: { type: String, required: true, trim: true },
      transactionReference: {
        type: String,
        trim: true,
        default: ""
      },
      receiptImageUrl: { type: String, default: "" }
    },
    orderNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Completed", "Rejected"],
      default: "Pending"
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

module.exports = mongoose.model("Order", orderSchema);