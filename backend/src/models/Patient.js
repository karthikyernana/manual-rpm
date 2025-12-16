const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  mrn: {
    type: String,
    required: [true, 'MRN (Medical Record Number) is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  dob: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },
  ward: {
    type: String,
    required: [true, 'Ward is required'],
    trim: true
  },
  bed: {
    type: String,
    trim: true
  },
  consent: {
    type: Boolean,
    default: false
  },
  primaryNurse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  primaryDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  template: {
    type: String,
    enum: ['general', 'cardiac', 'diabetic'],
    default: 'general'
  },
  phone: {
    type: String,
    trim: true
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for performance
patientSchema.index({ mrn: 1 });
patientSchema.index({ ward: 1, active: 1 });
patientSchema.index({ primaryNurse: 1 });
patientSchema.index({ name: 'text' }); // Text search on name

module.exports = mongoose.model('Patient', patientSchema);
