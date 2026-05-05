const crypto = require('crypto');

// Test signature generation
const timestamp = Math.floor(Date.now() / 1000);
const folder = "handycraft/products";
const secret = process.env.CLOUDINARY_SECRET || "test_secret";

// Build params object for signing (alphabetical order matters)
const params = {
  folder: folder,
  timestamp: timestamp
};

// Create string to sign: param1=value1&param2=value2...
const paramsString = Object.keys(params)
  .sort()
  .map(key => `${key}=${params[key]}`)
  .join('&');

// Sign with secret
const stringToSign = paramsString + secret;
console.log('String to sign:', stringToSign);

const signature = crypto
  .createHash('sha1')
  .update(stringToSign)
  .digest('hex');

console.log('Generated signature:', signature);
console.log('Timestamp:', timestamp);
console.log('Folder:', folder);
