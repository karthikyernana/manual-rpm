const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    validate: {
      validator: function(v) {
        // At least one letter and one number
        return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v);
      },
      message: 'Password must contain at least one letter and one number'
    },
    select: false  // Don't return password in queries by default
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'nurse', 'coordinator'],
    default: 'nurse'
  },
  phone: {
    type: String,
    trim: true
  },
  notificationPrefs: {
    automaticMode: {
      type: Boolean,
      default: true
    },
    manualTime: String,
    quietHoursStart: {
      type: String,
      default: '22:00'
    },
    quietHoursEnd: {
      type: String,
      default: '07:00'
    }
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Note: email already has unique:true which creates an index automatically

module.exports = mongoose.model('User', userSchema);
