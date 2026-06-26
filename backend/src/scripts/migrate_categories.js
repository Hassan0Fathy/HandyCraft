const mongoose = require("mongoose");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const Product = require("../models/Product");
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const db = require("../config/db");

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
};

async function migrateCategories() {
  console.log("🚀 Starting Category Migration...");
  try {
    const products = await Product.find({});
    const uniqueCategories = [...new Set(products.map(p => p.category))].filter(Boolean);
    
    console.log(`Found ${uniqueCategories.length} unique categories in products.`);
    
    let categoryMap = {};

    for (const catName of uniqueCategories) {
      let category = await Category.findOne({ name: catName });
      if (!category) {
        category = new Category({
          name: catName,
          slug: slugify(catName),
          order: 0,
          isActive: true
        });
        await category.save();
        console.log(`Created Category: ${catName}`);
      }
      categoryMap[catName] = category._id;
    }

    // Now handle subcategories
    const uniqueSubcats = [];
    products.forEach(p => {
      if (p.subcategory) {
        uniqueSubcats.push({
          category: p.category,
          name: p.subcategory
        });
      }
    });

    // Unique pairs of category + subcategory
    const uniqueSubcatPairs = Array.from(
      new Map(uniqueSubcats.map(item => [item.category + "|" + item.name, item])).values()
    );

    console.log(`Found ${uniqueSubcatPairs.length} unique subcategory pairs.`);

    for (const pair of uniqueSubcatPairs) {
      const catId = categoryMap[pair.category];
      if (!catId) continue;

      const exists = await Subcategory.findOne({ name: pair.name, categoryId: catId });
      if (!exists) {
        const subcat = new Subcategory({
          categoryId: catId,
          name: pair.name,
          slug: slugify(pair.name),
          order: 0,
          isActive: true
        });
        await subcat.save();
        console.log(`Created Subcategory: ${pair.name} in ${pair.category}`);
      }
    }

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

async function run() {
  try {
    await db();
    await migrateCategories();
  } catch (err) {
    console.error("Database connection error:", err);
  }
}

run();
