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
    enum: ['general', 'cardiac', 'diabetic', 'custom'],
    default: 'general'
  },
  customTemplateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VitalsTemplate'
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
  status: {
    type: String,
    enum: ['admitted', 'discharged'],
    default: 'admitted',
    index: true
  },
  dischargedAt: {
    type: Date
  },
  dischargedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  admissionHistory: [{
    admittedAt: { type: Date, required: true },
    dischargedAt: { type: Date, required: true },
    dischargedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    ward: String,
    bed: String,
    dischargeNotes: String
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for performance (mrn already has unique:true which creates index)
patientSchema.index({ ward: 1, active: 1 });
patientSchema.index({ primaryNurse: 1 });
patientSchema.index({ name: 'text' }); // Text search on name

// Prevent duplicate bed assignments (only for active patients with assigned beds)
patientSchema.index(
  { ward: 1, bed: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { 
      active: true, 
      bed: { $exists: true, $ne: '', $ne: null } 
    },
    name: 'unique_ward_bed_for_active_patients'
  }
);

module.exports = mongoose.model('Patient', patientSchema);
