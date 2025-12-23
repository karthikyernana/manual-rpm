const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'patient_create',
      'patient_update',
      'patient_delete',
      'patient_discharge',
      'patient_readmit',
      'patient_view',
      'vitals_record',
      'vitals_update',
      'vitals_delete',
      'alert_create',
      'alert_resolve',
      'alert_dismiss',
      'reminder_create',
      'reminder_complete',
      'reminder_snooze',
      'template_create',
      'template_update',
      'template_delete',
      'user_create',
      'user_update',
      'user_delete',
      'settings_change',
      'export_pdf',
      'export_csv',
      'share_create'
    ]
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resourceType: {
    type: String,
    enum: ['patient', 'vitals', 'alert', 'reminder', 'template', 'user', 'settings', 'share', null],
    default: null
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  resourceName: {
    type: String,
    default: null
  },
  details: {
    type: String,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ip: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });

// Static method to create log
auditLogSchema.statics.log = async function(data) {
  try {
    return await this.create(data);
  } catch (error) {
    console.error('Audit log error:', error);
    // Don't throw - audit logging should not break main functionality
    return null;
  }
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
