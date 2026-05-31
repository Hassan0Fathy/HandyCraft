const mongoose = require("mongoose");

const customFieldSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  type: { type: String, required: true, enum: ["text", "image"] },
  required: { type: Boolean, default: false },
  minImages: { type: Number, default: 1 },
  maxImages: { type: Number, default: 9 }
});

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, min: 0 }, // Optional override price
  images: { type: [String], default: [] },
  customFields: { type: [customFieldSchema], default: [] }
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    subcategory: { type: String, trim: true, default: "" },
    description: { type: String, required: true, trim: true },
    images: { type: [String], default: [] },
    bestSeller: { type: Boolean, default: false },
    customFields: { type: [customFieldSchema], default: [] },
    hasVariants: { type: Boolean, default: false },
    variants: { type: [variantSchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
