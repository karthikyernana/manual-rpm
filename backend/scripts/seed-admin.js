require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const seedAdmin = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@manual-rpm.com' });
    
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      email: 'admin@manual-rpm.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      name: 'System Administrator',
      role: 'admin'
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Email: admin@manual-rpm.com');
    console.log('   Password: Admin@123');
    console.log('\n⚠️  IMPORTANT: Change password after first login!\n');

    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedAdmin();
