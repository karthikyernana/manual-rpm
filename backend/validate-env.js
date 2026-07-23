#!/usr/bin/env node

/**
 * Environment Validation Script
 * Checks if all required environment variables are set up correctly
 * Run this before starting the server to catch configuration issues early
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Checking environment configuration...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ FATAL ERROR: .env file not found!');
  console.error(`   Expected location: ${envPath}`);
  console.error('\n📋 To fix this:');
  console.error('   1. Copy .env.example to .env');
  console.error('   2. Update MONGODB_URI with your MongoDB connection string');
  console.error('   3. Update JWT_SECRET with a random 32+ character string');
  console.error('\n📖 See FRIEND_SETUP_GUIDE.md for detailed instructions\n');
  process.exit(1);
}

// Load environment variables
require('dotenv').config();

let errors = [];
let warnings = [];

// Validation checks
const checks = {
  MONGODB_URI: {
    required: true,
    validate: (val) => val && val.includes('mongodb'),
    error: 'Must be a valid MongoDB connection string (must include "mongodb")',
    example: 'mongodb+srv://user:password@cluster.mongodb.net/database'
  },
  JWT_SECRET: {
    required: true,
    validate: (val) => val && val.length >= 32,
    error: 'Must be at least 32 characters long for security',
    example: 'Kj8fH2nP9mQ4rT7sV1wX6yZ3aB5cD0eF2gH4jK7lM9nP1qR3sT5uV7wX9yZ1aB3c'
  },
  JWT_EXPIRY: {
    required: false,
    validate: (val) => !val || /^\d+[smh]$/.test(val),
    warning: 'Should be in format like "1h" or "24h"',
    example: '1h'
  },
  PORT: {
    required: false,
    validate: (val) => !val || /^\d+$/.test(val),
    warning: 'Should be a valid port number',
    example: '5001'
  },
  FRONTEND_URL: {
    required: false,
    validate: (val) => !val || val.startsWith('http'),
    warning: 'Should be a valid URL starting with http:// or https://',
    example: 'http://localhost:5173'
  },
  NODE_ENV: {
    required: false,
    validate: (val) => !val || ['development', 'production', 'test'].includes(val),
    warning: 'Should be "development" or "production"',
    example: 'development'
  }
};

// Perform checks
Object.entries(checks).forEach(([key, config]) => {
  const value = process.env[key];
  
  if (config.required && !value) {
    errors.push({
      key,
      message: `${key} is required but not set`,
      example: config.example
    });
    return;
  }

  if (value && config.validate && !config.validate(value)) {
    if (config.error) {
      errors.push({
        key,
        message: config.error,
        example: config.example
      });
    } else if (config.warning) {
      warnings.push({
        key,
        message: config.warning,
        value: value,
        example: config.example
      });
    }
  }
});

// Print results
if (errors.length > 0) {
  console.error('❌ Configuration errors found:\n');
  errors.forEach((err) => {
    console.error(`  ❌ ${err.key}`);
    console.error(`     Error: ${err.message}`);
    console.error(`     Example: ${err.example}\n`);
  });
  console.error('📖 See FRIEND_SETUP_GUIDE.md for detailed instructions\n');
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn('⚠️  Configuration warnings:\n');
  warnings.forEach((warn) => {
    console.warn(`  ⚠️  ${warn.key}`);
    console.warn(`     Current: ${warn.value}`);
    console.warn(`     Expected format: ${warn.example}`);
    console.warn(`     Issue: ${warn.message}\n`);
  });
}

// Success message
console.log('✅ Environment configuration is valid!\n');
console.log('Environment Details:');
console.log(`  • NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`  • PORT: ${process.env.PORT || 5001}`);
console.log(`  • FRONTEND_URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
console.log(`  • JWT_EXPIRY: ${process.env.JWT_EXPIRY || '1h'}`);
console.log(`  • MongoDB: ${process.env.MONGODB_URI.split('@')[1] || 'configured'}`);
console.log(`  • JWT_SECRET: ${process.env.JWT_SECRET.substring(0, 10)}... (${process.env.JWT_SECRET.length} chars)\n`);

