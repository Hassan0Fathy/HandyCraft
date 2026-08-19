const Product = require("../models/Product");

async function getProducts(req, res, next) {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted', data: product });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { name, price, category, subcategory, description, images, customFields, bestSeller, hasVariants, variants, status } = req.body;
    let { sku } = req.body;
    
    // Normalize SKU: trim and treat "" or whitespace as undefined
    let normalizedSku = (sku !== undefined && sku !== null) ? String(sku).trim() : undefined;
    if (normalizedSku === '') normalizedSku = undefined;

    const updateData = {
      name,
      price,
      category,
      subcategory,
      description,
      bestSeller,
      hasVariants,
      images,
      customFields,
      variants,
      status
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    // Use $set for standard fields, $unset for SKU if it was explicitly cleared
    const updateOps = { $set: updateData };
    
    if (normalizedSku !== undefined) {
      updateOps.$set.sku = normalizedSku;
    } else if (req.body.hasOwnProperty('sku')) {
      // User explicitly cleared/submitted empty SKU
      updateOps.$unset = { sku: "" };
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateOps,
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: "SKU already exists" });
    }
    console.error('[Update Product Error]', error);
    next(error);
  }
}

module.exports = { getProducts, getProductById, deleteProduct, updateProduct };
