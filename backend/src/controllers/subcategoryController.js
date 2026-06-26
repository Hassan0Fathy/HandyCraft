const Subcategory = require("../models/Subcategory");
const Product = require("../models/Product");
const Category = require("../models/Category");

// Helper to generate slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
};

exports.getSubcategories = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const filter = {};
    if (categoryId) filter.categoryId = categoryId;

    const subcategories = await Subcategory.find(filter).sort({ order: 1 });
    res.json({ success: true, data: subcategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSubcategory = async (req, res) => {
  try {
    const { categoryId, name, image, order, isActive } = req.body;
    if (!categoryId) return res.status(400).json({ success: false, message: "categoryId is required" });

    const slug = slugify(name);
    
    let assignOrder = order;
    if (assignOrder === undefined || assignOrder === null) {
      const highestOrderSub = await Subcategory.findOne({ categoryId }).sort({ order: -1 });
      assignOrder = highestOrderSub ? highestOrderSub.order + 1 : 0;
    }
    
    const subcategory = new Subcategory({
      categoryId,
      name,
      slug,
      image,
      order: assignOrder,
      isActive,
    });

    await subcategory.save();
    res.status(201).json({ success: true, data: subcategory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, name, image, order, isActive } = req.body;
    
    const updateData = {};
    if (categoryId) updateData.categoryId = categoryId;
    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name);
    }
    if (image !== undefined) updateData.image = image;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const subcategory = await Subcategory.findByIdAndUpdate(id, updateData, { new: true });
    if (!subcategory) return res.status(404).json({ success: false, message: "Subcategory not found" });

    res.json({ success: true, data: subcategory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subcategory = await Subcategory.findById(id);
    if (!subcategory) return res.status(404).json({ success: false, message: "Subcategory not found" });

    // Data Safety: Prevent deleting if products are attached
    // Note: Products currently store subcategory as a string.
    const productCount = await Product.countDocuments({ subcategory: subcategory.name });
    if (productCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot delete subcategory because products are assigned to it." 
      });
    }

    await Subcategory.findByIdAndDelete(id);
    res.json({ success: true, message: "Subcategory deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleSubcategoryActive = async (req, res) => {
  try {
    const { id } = req.params;
    const subcategory = await Subcategory.findById(id);
    if (!subcategory) return res.status(404).json({ success: false, message: "Subcategory not found" });

    subcategory.isActive = !subcategory.isActive;
    await subcategory.save();
    res.json({ success: true, data: subcategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.reorderSubcategories = async (req, res) => {
  try {
    const { orderMap } = req.body; // Expects { "id": orderIndex }
    if (!orderMap) return res.status(400).json({ success: false, message: "Order map is required" });

    const bulkOps = Object.entries(orderMap).map(([id, order]) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order } },
      },
    }));

    await Subcategory.bulkWrite(bulkOps);
    res.json({ success: true, message: "Subcategories reordered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
