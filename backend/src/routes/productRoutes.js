const express = require("express");
const { verifyAuth } = require("../middleware/auth");
const Product = require("../models/Product");
const { deleteProduct, updateProduct } = require("../controllers/productController");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json(products);
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });
    return res.json(product);
  } catch (err) {
    return next(err);
  }
});

router.post("/", verifyAuth, async (req, res) => {
  try {
    const { name, price, category, subcategory, description, images, customFields, bestSeller } = req.body || {};
    if (!name || !price || !category || !description) {
      return res.status(400).json({ error: "Missing required fields: name, price, category, description" });
    }

    const product = await Product.create({
      name: String(name).trim(),
      price: Number(price),
      category: String(category).trim(),
      subcategory: String(subcategory || "").trim(),
      description: String(description).trim(),
      bestSeller: bestSeller === true || bestSeller === 'true',
      images: Array.isArray(images)
        ? images.filter(url => typeof url === 'string' && url.trim()).map(url => String(url).trim())
        : [],
      customFields: Array.isArray(customFields)
        ? customFields
            .map((f) => ({
              label: String(f?.label || "").trim(),
              type: String(f?.type || "").trim(),
              required: f?.required === true || f?.required === 'true',
              minImages: Number(f?.minImages) || 1,
              maxImages: Number(f?.maxImages) || 9
            }))
            .filter((f) => f.label && (f.type === "text" || f.type === "image"))
        : []
    });
    return res.status(201).json(product);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", verifyAuth, deleteProduct);

router.patch("/:id", verifyAuth, updateProduct);

module.exports = router;