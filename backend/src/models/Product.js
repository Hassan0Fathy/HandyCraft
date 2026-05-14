const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    images: { type: [String], default: [] },
    bestSeller: { type: Boolean, default: false },
    customFields: {
      type: [
        {
          label: { type: String, required: true, trim: true },
          type: { type: String, required: true, enum: ["text", "image"] },
          required: { type: Boolean, default: false },
          minImages: { type: Number, default: 1 },
          maxImages: { type: Number, default: 9 }
        }
      ],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
