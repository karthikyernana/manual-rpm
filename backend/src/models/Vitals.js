const mongoose = require('mongoose');

// Template definitions for different patient types
const VITAL_TEMPLATES = {
  general: {
    name: 'General',
    fields: [
      { name: 'temperature', label: 'Temperature (°F)', unit: '°F', min: 95, max: 105, normal: { min: 97, max: 99 } },
      { name: 'heartRate', label: 'Heart Rate (bpm)', unit: 'bpm', min: 40, max: 200, normal: { min: 60, max: 100 } },
      { name: 'bloodPressureSystolic', label: 'Blood Pressure - Systolic', unit: 'mmHg', min: 70, max: 200, normal: { min: 90, max: 120 } },
      { name: 'bloodPressureDiastolic', label: 'Blood Pressure - Diastolic', unit: 'mmHg', min: 40, max: 130, normal: { min: 60, max: 80 } },
      { name: 'oxygenSaturation', label: 'Oxygen Saturation (SpO2)', unit: '%', min: 70, max: 100, normal: { min: 95, max: 100 } },
      { name: 'respiratoryRate', label: 'Respiratory Rate', unit: '/min', min: 8, max: 40, normal: { min: 12, max: 20 } }
    ]
  },
  cardiac: {
    name: 'Cardiac',
    fields: [
      { name: 'heartRate', label: 'Heart Rate (bpm)', unit: 'bpm', min: 40, max: 200, normal: { min: 60, max: 100 } },
      { name: 'bloodPressureSystolic', label: 'BP - Systolic', unit: 'mmHg', min: 70, max: 200, normal: { min: 90, max: 120 } },
      { name: 'bloodPressureDiastolic', label: 'BP - Diastolic', unit: 'mmHg', min: 40, max: 130, normal: { min: 60, max: 80 } },
      { name: 'oxygenSaturation', label: 'Oxygen Saturation (SpO2)', unit: '%', min: 70, max: 100, normal: { min: 95, max: 100 } },
      { name: 'temperature', label: 'Temperature (°F)', unit: '°F', min: 95, max: 105, normal: { min: 97, max: 99 } },
      { name: 'weight', label: 'Weight (lbs)', unit: 'lbs', min: 50, max: 500, normal: null },
      { name: 'edema', label: 'Edema Level', unit: 'scale', min: 0, max: 4, normal: { min: 0, max: 0 } },
      { name: 'chestPain', label: 'Chest Pain', unit: 'boolean', normal: null }
    ]
  },
  diabetic: {
    name: 'Diabetic',
    fields: [
      { name: 'bloodGlucose', label: 'Blood Glucose', unit: 'mg/dL', min: 40, max: 600, normal: { min: 70, max: 140 } },
      { name: 'bloodPressureSystolic', label: 'BP - Systolic', unit: 'mmHg', min: 70, max: 200, normal: { min: 90, max: 120 } },
      { name: 'bloodPressureDiastolic', label: 'BP - Diastolic', unit: 'mmHg', min: 40, max: 130, normal: { min: 60, max: 80 } },
      { name: 'weight', label: 'Weight (lbs)', unit: 'lbs', min: 50, max: 500, normal: null },
      { name: 'temperature', label: 'Temperature (°F)', unit: '°F', min: 95, max: 105, normal: { min: 97, max: 99 } },
      { name: 'heartRate', label: 'Heart Rate (bpm)', unit: 'bpm', min: 40, max: 200, normal: { min: 60, max: 100 } },
      { name: 'footCheck', label: 'Foot Check', unit: 'boolean', normal: null },
      { name: 'insulinTaken', label: 'Insulin Taken', unit: 'boolean', normal: null }
    ]
  }
};

const vitalsSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  template: {
    type: String,
    enum: ['general', 'cardiac', 'diabetic'],
    required: true
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recordedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  // Dynamic vitals data based on template
  vitals: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  notes: {
    type: String
  },
  // Flagged if any vital is outside normal range
  flagged: {
    type: Boolean,
    default: false
  },
  flaggedFields: [{
    field: String,
    value: Number,
    normalRange: {
      min: Number,
      max: Number
    }
  }]
}, {
  timestamps: true
});

// Index for efficient querying
vitalsSchema.index({ patient: 1, recordedAt: -1 });
vitalsSchema.index({ flagged: 1, recordedAt: -1 });

// Pre-save hook to check for flagged values
vitalsSchema.pre('save', async function() {
  const template = VITAL_TEMPLATES[this.template];
  if (!template) return;

  this.flagged = false;
  this.flaggedFields = [];

  template.fields.forEach(field => {
    const value = this.vitals[field.name];
    
    // Skip if no value or no normal range defined
    if (value === undefined || value === null || !field.normal) return;
    
    // Skip boolean fields
    if (field.unit === 'boolean') return;

    // Check if value is outside normal range
    if (value < field.normal.min || value > field.normal.max) {
      this.flagged = true;
      this.flaggedFields.push({
        field: field.name,
        value: value,
        normalRange: field.normal
      });
    }
  });
});

// Static method to get template definition
vitalsSchema.statics.getTemplate = function(templateName) {
  return VITAL_TEMPLATES[templateName];
};

// Static method to get all templates
vitalsSchema.statics.getTemplates = function() {
  return VITAL_TEMPLATES;
};

module.exports = mongoose.model('Vitals', vitalsSchema);
