const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // There's only one settings document for the whole system
  _id: {
    type: String,
    default: 'system_settings'
  },
  
  // Ward Management
  wards: {
    type: [{
      name: { type: String, required: true },
      beds: { type: Number, default: 10 },
      active: { type: Boolean, default: true }
    }],
    default: [
      { name: 'ICU-1', beds: 10, active: true },
      { name: 'ICU-2', beds: 10, active: true },
      { name: 'General-1', beds: 20, active: true },
      { name: 'Cardiac', beds: 15, active: true },
      { name: 'Pediatric', beds: 12, active: true }
    ]
  },
  
  // Vitals Configuration
  defaultVitalsInterval: {
    type: Number,
    default: 4, // hours
    enum: [1, 2, 4, 6, 8, 12, 24]
  },
  
  autoGenerateReminders: {
    type: Boolean,
    default: true
  },
  
  // Alert Settings
  alertRetentionDays: {
    type: Number,
    default: 90,
    min: 7,
    max: 365
  },
  
  criticalAlertNotifications: {
    type: Boolean,
    default: true
  },
  
  // Notification Preferences
  emailNotifications: {
    type: Boolean,
    default: true
  },
  
  dailySummaryEmail: {
    type: Boolean,
    default: true
  },
  
  // Audit Settings
  auditRetentionDays: {
    type: Number,
    default: 365,
    min: 30,
    max: 730
  }
}, {
  timestamps: true
});

// Static method to get settings (create default if not exists)
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findById('system_settings');
  
  if (!settings) {
    settings = await this.create({ _id: 'system_settings' });
  }
  
  return settings;
};

// Static method to update settings
settingsSchema.statics.updateSettings = async function(updates) {
  const settings = await this.findByIdAndUpdate(
    'system_settings',
    { $set: updates },
    { new: true, upsert: true, runValidators: true }
  );
  
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
