// Form validation utilities

export const validators = {
  // Required field
  required: (value) => {
    if (value === null || value === undefined || value === '') {
      return 'This field is required';
    }
    return null;
  },

  // Email validation
  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Please enter a valid email address';
  },

  // Minimum length
  minLength: (min) => (value) => {
    if (!value) return null;
    return value.length >= min ? null : `Must be at least ${min} characters`;
  },

  // Maximum length
  maxLength: (max) => (value) => {
    if (!value) return null;
    return value.length <= max ? null : `Must be no more than ${max} characters`;
  },

  // Number validation
  number: (value) => {
    if (!value) return null;
    return !isNaN(value) ? null : 'Must be a valid number';
  },

  // Number range
  numberRange: (min, max) => (value) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num)) return 'Must be a valid number';
    if (num < min || num > max) return `Must be between ${min} and ${max}`;
    return null;
  },

  // Pattern matching
  pattern: (regex, message) => (value) => {
    if (!value) return null;
    return regex.test(value) ? null : message;
  },

  // No special characters except allowed
  alphanumeric: (value) => {
    if (!value) return null;
    const alphanumericRegex = /^[a-zA-Z0-9\s-_]+$/;
    return alphanumericRegex.test(value) ? null : 'Only letters, numbers, spaces, hyphens and underscores allowed';
  },

  // No whitespace only
  noWhitespaceOnly: (value) => {
    if (!value) return null;
    return value.trim().length > 0 ? null : 'Cannot contain only whitespace';
  },

  // Time format (HH:MM)
  timeFormat: (value) => {
    if (!value) return null;
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(value) ? null : 'Must be in HH:MM format (e.g., 14:30)';
  },

  // Unit validation (no commas, special chars except common units)
  unit: (value) => {
    if (!value) return null;
    const trimmed = value.trim();
    if (trimmed.length === 0) return 'Unit cannot be empty';
    if (trimmed.includes(',')) return 'Commas are not allowed in units';
    if (trimmed.length > 20) return 'Unit name too long (max 20 characters)';
    const unitRegex = /^[a-zA-Z0-9\s\/%°µ-]+$/;
    return unitRegex.test(trimmed) ? null : 'Invalid unit format';
  },

  // Field name validation (for template fields)
  fieldName: (value) => {
    if (!value) return null;
    const trimmed = value.trim();
    if (trimmed.length === 0) return 'Field name cannot be empty';
    if (trimmed.includes(' ')) return 'Field name cannot contain spaces (use underscores)';
    // Allow letters, numbers, and underscores
    const fieldNameRegex = /^[a-zA-Z0-9_]+$/;
    return fieldNameRegex.test(trimmed) ? null : 'Only letters, numbers, and underscores allowed';
  },
};

// Combine multiple validators
export const combineValidators = (...validators) => (value) => {
  for (const validator of validators) {
    const error = validator(value);
    if (error) return error;
  }
  return null;
};

// Validate entire form
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationRules).forEach((fieldName) => {
    const rules = validationRules[fieldName];
    const value = formData[fieldName];
    
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        errors[fieldName] = error;
        isValid = false;
        break; // Stop at first error for this field
      }
    }
  });

  return { errors, isValid };
};

// Sanitize input (trim whitespace, remove multiple spaces)
export const sanitizeInput = (value) => {
  if (typeof value !== 'string') return value;
  return value.trim().replace(/\s+/g, ' ');
};

// Sanitize all form fields
export const sanitizeForm = (formData) => {
  const sanitized = {};
  Object.keys(formData).forEach((key) => {
    sanitized[key] = sanitizeInput(formData[key]);
  });
  return sanitized;
};

export default {
  validators,
  combineValidators,
  validateForm,
  sanitizeInput,
  sanitizeForm,
};
