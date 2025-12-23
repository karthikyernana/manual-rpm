const AuditLog = require('../models/AuditLog');

/**
 * Log an audit event
 * @param {Object} params - Audit log parameters
 * @param {string} params.action - Action type (e.g., 'patient_create')
 * @param {ObjectId} params.userId - User who performed the action
 * @param {string} params.resourceType - Type of resource (e.g., 'patient')
 * @param {ObjectId} params.resourceId - ID of the resource
 * @param {string} params.resourceName - Human-readable name of the resource
 * @param {string} params.details - Additional details
 * @param {Object} params.metadata - Any additional metadata
 * @param {Object} params.req - Express request object (for IP and user agent)
 */
const logAudit = async ({
  action,
  userId,
  resourceType = null,
  resourceId = null,
  resourceName = null,
  details = null,
  metadata = {},
  req = null
}) => {
  try {
    const logData = {
      action,
      user: userId,
      resourceType,
      resourceId,
      resourceName,
      details,
      metadata
    };

    if (req) {
      logData.ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
      logData.userAgent = req.headers['user-agent'];
    }

    await AuditLog.log(logData);
  } catch (error) {
    console.error('Audit log error:', error);
    // Don't throw - audit logging should not break main functionality
  }
};

// Action type constants
const ACTIONS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  PATIENT_CREATE: 'patient_create',
  PATIENT_UPDATE: 'patient_update',
  PATIENT_DELETE: 'patient_delete',
  PATIENT_DISCHARGE: 'patient_discharge',
  PATIENT_READMIT: 'patient_readmit',
  PATIENT_VIEW: 'patient_view',
  VITALS_RECORD: 'vitals_record',
  VITALS_UPDATE: 'vitals_update',
  VITALS_DELETE: 'vitals_delete',
  ALERT_CREATE: 'alert_create',
  ALERT_RESOLVE: 'alert_resolve',
  ALERT_DISMISS: 'alert_dismiss',
  REMINDER_CREATE: 'reminder_create',
  REMINDER_COMPLETE: 'reminder_complete',
  REMINDER_SNOOZE: 'reminder_snooze',
  TEMPLATE_CREATE: 'template_create',
  TEMPLATE_UPDATE: 'template_update',
  TEMPLATE_DELETE: 'template_delete',
  USER_CREATE: 'user_create',
  USER_UPDATE: 'user_update',
  USER_DELETE: 'user_delete',
  SETTINGS_CHANGE: 'settings_change',
  EXPORT_PDF: 'export_pdf',
  EXPORT_CSV: 'export_csv',
  SHARE_CREATE: 'share_create'
};

module.exports = { logAudit, ACTIONS };
