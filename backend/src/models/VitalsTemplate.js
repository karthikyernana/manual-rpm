const mongoose = require('mongoose');

const VitalsTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  fields: [{
    name: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    normal: {
      min: Number,
      max: Number
    },
    min: Number,
    max: Number,
    required: {
      type: Boolean,
      default: true
    }
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  category: {
    type: String,
    enum: ['cardiac', 'diabetic', 'respiratory', 'general', 'custom'],
    default: 'custom'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('VitalsTemplate', VitalsTemplateSchema);
