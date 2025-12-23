const Alert = require('../../src/models/Alert');

describe('Alert Model - Severity Calculation', () => {
  describe('calculateSeverity', () => {
    test('should return critical for chest pain boolean', () => {
      const flaggedFields = [
        {
          field: 'chestPain',
          value: true
        }
      ];

      const severity = Alert.calculateSeverity(flaggedFields);
      expect(severity).toBe('critical');
    });

    test('should return critical for breathing difficulty', () => {
      const flaggedFields = [
        {
          field: 'breathingDifficulty',
          value: true
        }
      ];

      const severity = Alert.calculateSeverity(flaggedFields);
      expect(severity).toBe('critical');
    });

    test('should return critical for >50% deviation', () => {
      const flaggedFields = [
        {
          field: 'heartRate',
          value: 150,
          normalRange: { min: 60, max: 100 }
        }
      ];

      const severity = Alert.calculateSeverity(flaggedFields);
      expect(severity).toBe('critical');
    });

    test('should return high for >30% deviation', () => {
      const flaggedFields = [
        {
          field: 'heartRate',
          value: 115,
          normalRange: { min: 60, max: 100 }
        }
      ];

      const severity = Alert.calculateSeverity(flaggedFields);
      expect(severity).toBe('high');
    });

    test('should return medium for >15% deviation', () => {
      const flaggedFields = [
        {
          field: 'heartRate',
          value: 107,
          normalRange: { min: 60, max: 100 }
        }
      ];

      const severity = Alert.calculateSeverity(flaggedFields);
      expect(severity).toBe('medium');
    });

    test('should return low for small deviations', () => {
      const flaggedFields = [
        {
          field: 'heartRate',
          value: 102,
          normalRange: { min: 60, max: 100 }
        }
      ];

      const severity = Alert.calculateSeverity(flaggedFields);
      expect(severity).toBe('low');
    });

    test('should handle multiple flagged fields and return highest severity', () => {
      const flaggedFields = [
        {
          field: 'heartRate',
          value: 102,
          normalRange: { min: 60, max: 100 }
        },
        {
          field: 'bloodPressureSystolic',
          value: 180,
          normalRange: { min: 90, max: 120 }
        }
      ];

      const severity = Alert.calculateSeverity(flaggedFields);
      expect(severity).toBe('critical');
    });

    test('should return low for empty flagged fields', () => {
      const severity = Alert.calculateSeverity([]);
      expect(severity).toBe('low');
    });
  });
});
