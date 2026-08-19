require('dotenv').config({path: './backend/.env'});
const mongoose = require('mongoose');

async function migrate() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not set in ./backend/.env');
    }
    
    // Connect explicitly and wait
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Use the established connection's model
    const Product = require('../backend/src/models/Product');

    // 1. Drop the existing index
    try {
        await Product.collection.dropIndex('sku_1');
        console.log('Dropped existing index: sku_1');
    } catch (err) {
        console.log('Index sku_1 might not exist or already dropped, skipping:', err.message);
    }

    // 2. Clean existing data: convert "" to undefined (unset)
    const result = await Product.updateMany(
      { sku: '' },
      { $unset: { sku: "" } }
    );
    console.log(`Cleaned ${result.modifiedCount} products with empty string SKU`);

    // 3. Re-create the unique sparse index
    await Product.collection.createIndex({ sku: 1 }, { unique: true, sparse: true });
    console.log('Re-created unique sparse index: sku_1');

    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
