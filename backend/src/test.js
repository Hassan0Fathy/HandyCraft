require('dotenv').config({ path: '../.env' });
const cloudinary = require('./config/cloudinary');
const ts = Math.floor(Date.now()/1000);
const sig = cloudinary.utils.api_sign_request(
  { folder: 'handycraft/products', timestamp: ts },
  process.env.CLOUDINARY_SECRET
);
console.log('timestamp:', ts);
console.log('signature:', sig);
console.log('secret:', process.env.CLOUDINARY_SECRET);