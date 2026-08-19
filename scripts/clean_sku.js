require('dotenv').config({path: './backend/.env'});
const mongoose = require('mongoose');

async function clean() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 30000 });
  console.log('Connected');
  
  const products = mongoose.connection.collection('products');
  const result = await products.updateMany({ sku: '' }, { $unset: { sku: '' } });
  console.log('Cleaned:', result.modifiedCount);
  
  await mongoose.disconnect();
}
clean();
