require('dotenv').config();
const mongoose = require('mongoose');
const { execSync } = require('child_process');

const resetProduction = async () => {
  try {
    // Safety check - prevent accidental production wipes
    if (process.env.NODE_ENV === 'production') {
      console.error('\n⚠️  WARNING: Running in production mode!');
      console.error('⚠️  This will DELETE ALL DATA from your production database!');
      console.log('\nPress Ctrl+C now to cancel, or wait 10 seconds to proceed...\n');
      await new Promise(resolve => setTimeout(resolve, 10000));
    } else {
      console.log('\n⚠️  WARNING: This will DELETE ALL DATA!\n');
      console.log(`📊 Database: ${process.env.MONGODB_URI?.split('@')[1]?.split('/')[1] || 'Unknown'}\n`);
      console.log('Press Ctrl+C now to cancel, or wait 5 seconds...\n');
      await new Promise(resolve => setTimeout(resolve, 5001));
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    console.log('🗑️  Dropping all collections...');
    const collections = await mongoose.connection.db.collections();
    
    for (let collection of collections) {
      console.log(`   - Dropping ${collection.collectionName}...`);
      await collection.drop();
    }
    
    console.log('\n✅ Database cleared!\n');
    await mongoose.connection.close();

    console.log('👤 Creating admin user...\n');
    execSync('node scripts/seed-admin.js', { stdio: 'inherit' });

    console.log('\n🎉 Production reset complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Start your backend: npm run dev');
    console.log('   2. Login with: admin@manual-rpm.com / Admin@123');
    console.log('   3. Change admin password immediately!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetProduction();
