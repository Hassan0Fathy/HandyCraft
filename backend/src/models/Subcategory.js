const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    image: { type: String, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for sorting and filtering within a category
subcategorySchema.index({ categoryId: 1, order: 1, isActive: 1 });

module.exports = mongoose.model("Subcategory", subcategorySchema);
