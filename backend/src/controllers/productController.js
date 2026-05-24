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
    const { name, price, category, subcategory, description, bestSeller } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          name, 
          price, 
          category, 
          subcategory,
          description, 
          bestSeller 
        } 
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    next(error);
  }
}

module.exports = { getProducts, getProductById, deleteProduct, updateProduct };
