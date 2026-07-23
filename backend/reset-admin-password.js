const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const resetPassword = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const User = require('./src/models/User');
  
  console.log('\n🔄 Resetting admin password...\n');
  
  // Find admin user
  const admin = await User.findOne({ email: 'admin@manual-rpm.com' });
  
  if (!admin) {
    console.log('❌ Admin user not found!');
    process.exit(1);
  }
  
  // Set new password
  const newPassword = 'Admin@123';
  admin.password = newPassword;
  await admin.save();
  
  console.log('✅ Password reset successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('   Email: admin@manual-rpm.com');
  console.log('   Password: Admin@123');
  
  // Verify it works
  const testUser = await User.findOne({ email: 'admin@manual-rpm.com' }).select('+password');
  const isMatch = await testUser.comparePassword('Admin@123');
  console.log(`\n✓ Password verification: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
  
  await mongoose.connection.close();
  process.exit(0);
};

resetPassword().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
