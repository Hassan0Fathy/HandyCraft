const mongoose = require("mongoose");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const Product = require("../models/Product");
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const db = require("../config/db");

async function migrateProductCategories() {
  console.log("🚀 Starting Product Category Migration...");
  try {
    const categories = await Category.find({});
    const subcategories = await Subcategory.find({});
    const products = await Product.find({});
    
    let updatedCount = 0;
    let notMatchedCount = 0;
    const missingCategories = new Set();
    const missingSubcategories = new Set();

    for (const product of products) {
      const category = categories.find(c => c.name.toLowerCase() === product.category.toLowerCase());
      
      if (!category) {
        missingCategories.add(product.category);
        notMatchedCount++;
        continue;
      }

      let subcategory = null;
      if (product.subcategory) {
        subcategory = subcategories.find(s => 
          s.categoryId.equals(category._id) && 
          s.name.toLowerCase() === product.subcategory.toLowerCase()
        );
        
        if (!subcategory) {
          missingSubcategories.add(`${product.category} > ${product.subcategory}`);
        }
      }

      // Update product with new references if they exist
      // We keep the string fields for now for compatibility, 
      // but should ideally move to ObjectId references
      product.category = category.name; // Ensure normalized name
      if (subcategory) {
        product.subcategory = subcategory.name; // Ensure normalized name
      }
      
      // Note: If you want to change schema to ObjectId, you'd need to modify Product.js
      // and do: product.category = category._id; product.subcategory = subcategory?._id;
      
      await product.save();
      updatedCount++;
    }

    console.log("✅ Migration Report:");
    console.log(`- Total products scanned: ${products.length}`);
    console.log(`- Products updated: ${updatedCount}`);
    console.log(`- Products not matched: ${notMatchedCount}`);
    console.log(`- Missing Categories:`, Array.from(missingCategories));
    console.log(`- Missing Subcategories:`, Array.from(missingSubcategories));

  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

async function run() {
  try {
    await db();
    await migrateProductCategories();
  } catch (err) {
    console.error("Database connection error:", err);
  }
}

run();
