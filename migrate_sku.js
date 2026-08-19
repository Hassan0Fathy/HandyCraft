require('dotenv').config({path: './backend/.env'});
const mongoose = require('mongoose');
const Product = require('./backend/src/models/Product');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await Product.updateMany(
      { sku: '' },
      { $unset: { sku: 1 } }
    );
    console.log(`Matched ${result.matchedCount} documents, modified ${result.modifiedCount} documents`);

    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (err) {
    console.error(err);
  }
}

migrate();