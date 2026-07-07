const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Please provide a password as an argument: node hash_password.js "your-password"');
  process.exit(1);
}

const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    process.exit(1);
  }
  console.log('
--------------------------------------------------');
  console.log('Your hashed password for .env:');
  console.log('
' + hash + '
');
  console.log('--------------------------------------------------');
  console.log('Update your .env file: ADMIN_PASSWORD=' + hash);
});
