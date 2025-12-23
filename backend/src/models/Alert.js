const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  vitals: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vitals',
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true
  },
  flaggedFields: [{
    field: String,
    value: Number,
    normalRange: {
      min: Number,
      max: Number
    }
  }],
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved'],
    default: 'active',
    index: true
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
alertSchema.index({ patient: 1, status: 1, createdAt: -1 });
alertSchema.index({ status: 1, severity: 1, createdAt: -1 });

// Static method to calculate severity based on how far outside normal range
alertSchema.statics.calculateSeverity = function(flaggedFields) {
  if (!flaggedFields || flaggedFields.length === 0) return 'low';
  
  // Critical boolean indicators (chest pain, breathing difficulty, etc.)
  const criticalBooleanFields = ['chestPain', 'breathingDifficulty', 'unconscious', 'severeChestPain'];
  const hasCriticalBoolean = flaggedFields.some(field => 
    criticalBooleanFields.includes(field.field) && field.value === true
  );
  
  if (hasCriticalBoolean) return 'critical';
  
  let maxDeviation = 0;
  
  flaggedFields.forEach(field => {
    if (!field.normalRange) return;
    
    const { min, max } = field.normalRange;
    const value = field.value;
    const range = max - min;
    
    let deviation = 0;
    if (value < min) {
      deviation = (min - value) / range;
    } else if (value > max) {
      deviation = (value - max) / range;
    }
    
    maxDeviation = Math.max(maxDeviation, deviation);
  });
  
  // Determine severity based on deviation percentage
  if (maxDeviation > 0.5) return 'critical';  // >50% outside range
  if (maxDeviation > 0.3) return 'high';      // >30% outside range
  if (maxDeviation > 0.15) return 'medium';   // >15% outside range
  return 'low';
};

module.exports = mongoose.model('Alert', alertSchema);
