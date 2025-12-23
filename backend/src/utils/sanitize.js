const validator = require('validator');

/**
 * Sanitize string input to prevent XSS attacks
 * @param {string} str - Input string to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return validator.escape(validator.trim(str));
};

/**
 * Sanitize object recursively
 * @param {object} obj - Object to sanitize
 * @returns {object} - Sanitized object
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  // Preserve arrays - recursively sanitize each element
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => sanitizeObject(item));
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Express middleware to sanitize request body
 */
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    // Don't sanitize password fields - they may contain special chars
    const passwordFields = ['password', 'confirmPassword', 'newPassword', 'oldPassword'];
    const body = { ...req.body };
    
    passwordFields.forEach(field => {
      delete body[field];
    });
    
    const sanitizedBody = sanitizeObject(body);
    
    // Restore password fields
    passwordFields.forEach(field => {
      if (req.body[field] !== undefined) {
        sanitizedBody[field] = req.body[field];
      }
    });
    
    req.body = sanitizedBody;
  }
  next();
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean}
 */
const isValidObjectId = (id) => {
  return validator.isMongoId(id);
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  return validator.isEmail(email);
};

/**
 * Normalize dates to UTC
 * Converts date strings to ISO format for consistent timezone handling
 */
const normalizeDates = (req, res, next) => {
  const normalizeDateFields = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    
    const dateFields = ['dob', 'admissionDate', 'dueDate', 'scheduledTime', 'recordedAt', 'expiresAt'];
    
    for (const field of dateFields) {
      if (obj[field] && typeof obj[field] === 'string') {
        try {
          obj[field] = new Date(obj[field]).toISOString();
        } catch (e) {
          // Keep original if conversion fails
        }
      }
    }
    
    // Recursively check nested objects
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        normalizeDateFields(obj[key]);
      }
    }
  };
  
  if (req.body) normalizeDateFields(req.body);
  next();
};

module.exports = {
  sanitizeString,
  sanitizeObject,
  sanitizeBody,
  isValidObjectId,
  isValidEmail,
  normalizeDates
};
