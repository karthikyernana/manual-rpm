import { describe, test, expect } from 'vitest';
import { validators } from '../../src/utils/validation';

describe('Validation Utilities', () => {
  describe('required validator', () => {
    test('returns error for empty string', () => {
      expect(validators.required('')).toBe('This field is required');
    });

    test('returns error for null', () => {
      expect(validators.required(null)).toBe('This field is required');
    });

    test('returns error for undefined', () => {
      expect(validators.required(undefined)).toBe('This field is required');
    });

    test('returns null for valid value', () => {
      expect(validators.required('test')).toBeNull();
    });

    test('returns null for number zero', () => {
      expect(validators.required(0)).toBeNull();
    });
  });

  describe('email validator', () => {
    test('validates correct email', () => {
      expect(validators.email('test@example.com')).toBeNull();
    });

    test('rejects email without @', () => {
      expect(validators.email('testexample.com')).toBe('Please enter a valid email address');
    });

    test('rejects email without domain', () => {
      expect(validators.email('test@')).toBe('Please enter a valid email address');
    });

    test('rejects email without extension', () => {
      expect(validators.email('test@example')).toBe('Please enter a valid email address');
    });

    test('accepts email with subdomain', () => {
      expect(validators.email('test@mail.example.com')).toBeNull();
    });

    test('returns null for empty value', () => {
      expect(validators.email('')).toBeNull();
    });
  });

  describe('minLength validator', () => {
    test('returns error for short string', () => {
      const validate = validators.minLength(8);
      expect(validate('short')).toContain('at least 8 characters');
    });

    test('returns null for exact length', () => {
      const validate = validators.minLength(5);
      expect(validate('exact')).toBeNull();
    });

    test('returns null for longer string', () => {
      const validate = validators.minLength(5);
      expect(validate('longer string')).toBeNull();
    });

    test('returns null for empty value', () => {
      const validate = validators.minLength(5);
      expect(validate('')).toBeNull();
    });
  });

  describe('maxLength validator', () => {
    test('returns error for long string', () => {
      const validate = validators.maxLength(5);
      expect(validate('too long string')).toContain('no more than 5 characters');
    });

    test('returns null for exact length', () => {
      const validate = validators.maxLength(5);
      expect(validate('exact')).toBeNull();
    });

    test('returns null for shorter string', () => {
      const validate = validators.maxLength(10);
      expect(validate('short')).toBeNull();
    });
  });

  describe('number validator', () => {
    test('validates integer', () => {
      expect(validators.number('42')).toBeNull();
    });

    test('validates decimal', () => {
      expect(validators.number('3.14')).toBeNull();
    });

    test('validates negative number', () => {
      expect(validators.number('-10')).toBeNull();
    });

    test('rejects non-numeric string', () => {
      expect(validators.number('abc')).toBe('Must be a valid number');
    });

    test('rejects mixed alphanumeric', () => {
      expect(validators.number('12abc')).toBe('Must be a valid number');
    });
  });

  describe('numberRange validator', () => {
    test('validates number in range', () => {
      const validate = validators.numberRange(0, 100);
      expect(validate('50')).toBeNull();
    });

    test('validates minimum boundary', () => {
      const validate = validators.numberRange(0, 100);
      expect(validate('0')).toBeNull();
    });

    test('validates maximum boundary', () => {
      const validate = validators.numberRange(0, 100);
      expect(validate('100')).toBeNull();
    });

    test('rejects number below minimum', () => {
      const validate = validators.numberRange(0, 100);
      expect(validate('-1')).toContain('between 0 and 100');
    });

    test('rejects number above maximum', () => {
      const validate = validators.numberRange(0, 100);
      expect(validate('101')).toContain('between 0 and 100');
    });

    test('rejects non-numeric value', () => {
      const validate = validators.numberRange(0, 100);
      expect(validate('abc')).toBe('Must be a valid number');
    });
  });

  describe('alphanumeric validator', () => {
    test('validates alphanumeric string', () => {
      expect(validators.alphanumeric('Test123')).toBeNull();
    });

    test('validates with allowed special characters', () => {
      expect(validators.alphanumeric('Test-Name_123')).toBeNull();
    });

    test('validates with spaces', () => {
      expect(validators.alphanumeric('Test Name 123')).toBeNull();
    });

    test('rejects special characters', () => {
      expect(validators.alphanumeric('Test@Name')).toContain('Only letters, numbers');
    });

    test('rejects punctuation', () => {
      expect(validators.alphanumeric('Test.Name')).toContain('Only letters, numbers');
    });
  });

  describe('noWhitespaceOnly validator', () => {
    test('rejects only spaces', () => {
      expect(validators.noWhitespaceOnly('   ')).toBe('Cannot contain only whitespace');
    });

    test('rejects only tabs', () => {
      expect(validators.noWhitespaceOnly('\t\t')).toBe('Cannot contain only whitespace');
    });

    test('accepts string with content', () => {
      expect(validators.noWhitespaceOnly('  text  ')).toBeNull();
    });

    test('returns null for empty value', () => {
      expect(validators.noWhitespaceOnly('')).toBeNull();
    });
  });

  describe('timeFormat validator', () => {
    test('validates correct time format', () => {
      expect(validators.timeFormat('14:30')).toBeNull();
    });

    test('validates midnight', () => {
      expect(validators.timeFormat('00:00')).toBeNull();
    });

    test('validates noon', () => {
      expect(validators.timeFormat('12:00')).toBeNull();
    });

    test('validates end of day', () => {
      expect(validators.timeFormat('23:59')).toBeNull();
    });

    test('rejects invalid hour', () => {
      expect(validators.timeFormat('25:00')).toContain('HH:MM format');
    });

    test('rejects invalid minute', () => {
      expect(validators.timeFormat('14:60')).toContain('HH:MM format');
    });

    test('rejects missing colon', () => {
      expect(validators.timeFormat('1430')).toContain('HH:MM format');
    });

    test('returns null for empty value', () => {
      expect(validators.timeFormat('')).toBeNull();
    });
  });

  describe('unit validator', () => {
    test('validates common units', () => {
      expect(validators.unit('mmHg')).toBeNull();
      expect(validators.unit('°F')).toBeNull();
      expect(validators.unit('bpm')).toBeNull();
      expect(validators.unit('%')).toBeNull();
    });

    test('rejects commas', () => {
      expect(validators.unit('mm,Hg')).toContain('Commas are not allowed');
    });

    test('rejects too long units', () => {
      expect(validators.unit('a'.repeat(25))).toContain('too long');
    });

    test('rejects only whitespace', () => {
      expect(validators.unit('   ')).toBe('Unit cannot be empty');
    });

    test('returns null for empty value', () => {
      expect(validators.unit('')).toBeNull();
    });
  });
});
