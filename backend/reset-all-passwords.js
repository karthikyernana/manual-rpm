const mongoose = require('mongoose');
require('dotenv').config();

const resetAllPasswords = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const User = require('./src/models/User');
  
  console.log('\n🔄 Resetting passwords for all users...\n');
  
  // Define password for each user
  const userPasswords = {
    'admin@manual-rpm.com': 'Admin@123',
    'admin@vitalis.com': 'Admin@123',
    'karthikyernana@gmail.com': 'Admin@123'
  };
  
  const users = await User.find({});
  
  for (const user of users) {
    const password = userPasswords[user.email] || 'Admin@123';
    user.password = password;
    await user.save();
    console.log(`✅ ${user.email} - Password: ${password}`);
  }
  
  console.log('\n✅ All passwords reset successfully!\n');
  console.log('📋 You can now login with any of these accounts using password: Admin@123');
  
  await mongoose.connection.close();
  process.exit(0);
};

resetAllPasswords().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
