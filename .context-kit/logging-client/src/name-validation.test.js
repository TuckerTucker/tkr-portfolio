/**
 * Unit tests for NameValidator
 * Testing validation rules, sanitization, and edge cases
 */

const {
  NameValidator,
  validateServiceName,
  validateDisplayName,
  sanitizeServiceName,
  sanitizeDisplayName,
  isReservedName,
  generateUniqueServiceName,
  VALIDATION_RULES,
  RESERVED_NAMES
} = require('./name-validation');

describe('NameValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new NameValidator();
  });

  describe('validateServiceName', () => {
    test('should accept valid service names', () => {
      const validNames = [
        'valid-service',
        'my-app',
        'service_name',
        'service123',
        'a',
        'test-service-with-many-parts'
      ];

      validNames.forEach(name => {
        const result = validator.validateServiceName(name);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should reject empty or null names', () => {
      const invalidNames = ['', null, undefined];

      invalidNames.forEach(name => {
        const result = validator.validateServiceName(name);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('non-empty string');
      });
    });

    test('should reject names with invalid characters', () => {
      const invalidNames = [
        'service@name',
        'service.name',
        'service name',
        'service/name',
        'service\\name',
        'service#name'
      ];

      invalidNames.forEach(name => {
        const result = validator.validateServiceName(name);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('alphanumeric characters, dashes, and underscores');
      });
    });

    test('should reject names starting/ending with special characters', () => {
      const invalidNames = [
        '-service',
        'service-',
        '_service',
        'service_',
        '--service',
        'service--'
      ];

      invalidNames.forEach(name => {
        const result = validator.validateServiceName(name);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('cannot start or end with dash or underscore');
      });
    });

    test('should reject names with consecutive special characters', () => {
      const invalidNames = [
        'service--name',
        'service__name',
        'service---name',
        'service___name'
      ];

      invalidNames.forEach(name => {
        const result = validator.validateServiceName(name);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('consecutive dashes or underscores');
      });
    });

    test('should reject names that are too long', () => {
      const longName = 'a'.repeat(51);
      const result = validator.validateServiceName(longName);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('50 characters');
    });

    test('should warn about reserved names', () => {
      const result = validator.validateServiceName('unknown');

      expect(result.isValid).toBe(true);
      expect(result.warnings[0]).toContain('reserved name');
    });

    test('should provide suggestions for valid names', () => {
      const result = validator.validateServiceName('terminalapp');

      expect(result.isValid).toBe(true);
      if (result.warnings.length > 0) {
        expect(result.warnings[0]).toContain('alternatives');
      }
    });
  });

  describe('validateDisplayName', () => {
    test('should accept valid display names', () => {
      const validNames = [
        'Valid Service',
        'My Awesome App',
        'Service 123',
        'Terminal.app',
        'Service (Development)',
        'A'
      ];

      validNames.forEach(name => {
        const result = validator.validateDisplayName(name);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should reject names with control characters', () => {
      const invalidNames = [
        'Service\nName',
        'Service\tName',
        'Service\rName'
      ];

      invalidNames.forEach(name => {
        const result = validator.validateDisplayName(name);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('control characters');
      });
    });

    test('should warn about whitespace issues', () => {
      const result = validator.validateDisplayName(' Service Name ');

      expect(result.isValid).toBe(true);
      expect(result.warnings[0]).toContain('whitespace');
    });

    test('should warn about multiple spaces', () => {
      const result = validator.validateDisplayName('Service  Name');

      expect(result.isValid).toBe(true);
      expect(result.warnings[0]).toContain('consecutive spaces');
    });

    test('should reject names that are too long', () => {
      const longName = 'A'.repeat(101);
      const result = validator.validateDisplayName(longName);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('100 characters');
    });
  });

  describe('sanitizeServiceName', () => {
    test('should convert to lowercase and replace invalid characters', () => {
      expect(sanitizeServiceName('My@Service!Name')).toBe('my-service-name');
      expect(sanitizeServiceName('Service.Name')).toBe('service-name');
      expect(sanitizeServiceName('Service Name')).toBe('service-name');
    });

    test('should remove leading/trailing special characters', () => {
      expect(sanitizeServiceName('_-service-name-_')).toBe('service-name');
      expect(sanitizeServiceName('--service--')).toBe('service');
      expect(sanitizeServiceName('__service__')).toBe('service');
    });

    test('should replace consecutive special characters', () => {
      expect(sanitizeServiceName('service---name')).toBe('service-name');
      expect(sanitizeServiceName('service___name')).toBe('service-name');
      expect(sanitizeServiceName('service--_--name')).toBe('service-name');
    });

    test('should truncate long names', () => {
      const longName = 'a'.repeat(60);
      const result = sanitizeServiceName(longName);
      expect(result.length).toBeLessThanOrEqual(50);
    });

    test('should provide fallback for invalid input', () => {
      expect(sanitizeServiceName('')).toBe('unknown-service');
      expect(sanitizeServiceName(null)).toBe('unknown-service');
      expect(sanitizeServiceName(undefined)).toBe('unknown-service');
      expect(sanitizeServiceName('---')).toBe('unknown-service');
    });

    test('should handle reserved names', () => {
      expect(sanitizeServiceName('unknown')).toBe('unknown-service');
      expect(sanitizeServiceName('null')).toBe('unknown-service');
    });
  });

  describe('sanitizeDisplayName', () => {
    test('should remove control characters', () => {
      expect(sanitizeDisplayName('Service\nName')).toBe('Service Name');
      expect(sanitizeDisplayName('Service\tName')).toBe('Service Name');
      expect(sanitizeDisplayName('Service\rName')).toBe('Service Name');
    });

    test('should normalize whitespace', () => {
      expect(sanitizeDisplayName('  Service   Name  ')).toBe('Service Name');
      expect(sanitizeDisplayName('Service\t\tName')).toBe('Service Name');
    });

    test('should truncate long names', () => {
      const longName = 'A'.repeat(110);
      const result = sanitizeDisplayName(longName);
      expect(result.length).toBeLessThanOrEqual(100);
    });

    test('should provide fallback for invalid input', () => {
      expect(sanitizeDisplayName('')).toBe('Unknown Service');
      expect(sanitizeDisplayName(null)).toBe('Unknown Service');
      expect(sanitizeDisplayName(undefined)).toBe('Unknown Service');
    });
  });

  describe('isReservedName', () => {
    test('should identify reserved names', () => {
      expect(isReservedName('unknown')).toBe(true);
      expect(isReservedName('system')).toBe(true);
      expect(isReservedName('ADMIN')).toBe(true); // Case insensitive
      expect(isReservedName('test')).toBe(true);
    });

    test('should not flag valid names', () => {
      expect(isReservedName('my-service')).toBe(false);
      expect(isReservedName('app')).toBe(false);
      expect(isReservedName('service')).toBe(false);
    });
  });

  describe('generateUniqueServiceName', () => {
    test('should return base name if unique', () => {
      const result = generateUniqueServiceName('unique-service', []);
      expect(result).toBe('unique-service');
    });

    test('should add suffix for duplicate names', () => {
      const existing = ['my-service', 'my-service-2'];
      const result = generateUniqueServiceName('my-service', existing);
      expect(result).toBe('my-service-3');
    });

    test('should handle many duplicates', () => {
      const existing = Array.from({ length: 10 }, (_, i) =>
        i === 0 ? 'service' : `service-${i + 1}`
      );
      const result = generateUniqueServiceName('service', existing);
      expect(result).toBe('service-11');
    });

    test('should fallback to timestamp for extreme cases', () => {
      const longBase = 'a'.repeat(45);
      const existing = Array.from({ length: 1000 }, (_, i) =>
        i === 0 ? longBase : `${longBase}-${i + 1}`
      );
      const result = generateUniqueServiceName(longBase, existing);

      expect(result).toMatch(/^a+-.+$/);
      expect(result.length).toBeLessThanOrEqual(50);
    });
  });

  describe('getSuggestions', () => {
    test('should suggest common patterns', () => {
      const suggestions = validator.getSuggestions('terminalapp');
      expect(suggestions).toContain('terminal');
    });

    test('should limit number of suggestions', () => {
      const suggestions = validator.getSuggestions('testapp');
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    test('should return empty array for unrecognized patterns', () => {
      const suggestions = validator.getSuggestions('xyz123random');
      expect(suggestions).toEqual([]);
    });
  });

  describe('validateConfiguration', () => {
    test('should validate valid configuration', () => {
      const config = {
        'service-1': 'Service One',
        'service-2': 'Service Two'
      };

      const result = validator.validateConfiguration(config);
      expect(result.isValid).toBe(true);
      expect(result.globalErrors).toHaveLength(0);
    });

    test('should detect invalid service names in configuration', () => {
      const config = {
        'invalid@service': 'Valid Display Name',
        'valid-service': 'Valid Display Name'
      };

      const result = validator.validateConfiguration(config);
      expect(result.isValid).toBe(false);
      expect(result.serviceNameResults['invalid@service'].isValid).toBe(false);
      expect(result.serviceNameResults['valid-service'].isValid).toBe(true);
    });

    test('should detect invalid display names in configuration', () => {
      const config = {
        'valid-service': 'Invalid\nDisplay\nName'
      };

      const result = validator.validateConfiguration(config);
      expect(result.isValid).toBe(false);
      expect(result.displayNameResults['valid-service'].isValid).toBe(false);
    });

    test('should reject non-object configurations', () => {
      const result = validator.validateConfiguration('not an object');
      expect(result.isValid).toBe(false);
      expect(result.globalErrors[0]).toContain('must be an object');
    });
  });

  describe('caching and performance', () => {
    test('should cache validation results', () => {
      const name = 'test-service';

      const result1 = validator.validateServiceName(name);
      const result2 = validator.validateServiceName(name);

      expect(result1).toEqual(result2);
    });

    test('should clear cache when requested', () => {
      validator.validateServiceName('test-service');
      expect(validator.getStats().cacheSize).toBeGreaterThan(0);

      validator.clearCache();
      expect(validator.getStats().cacheSize).toBe(0);
    });

    test('should provide statistics', () => {
      const stats = validator.getStats();

      expect(stats).toHaveProperty('cacheSize');
      expect(stats).toHaveProperty('reservedNames');
      expect(stats).toHaveProperty('validationRules');
      expect(stats.reservedNames).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    test('should handle Unicode characters', () => {
      const name = 'service-名前';
      const result = validator.validateServiceName(name);

      expect(result.isValid).toBe(false);

      const sanitized = validator.sanitizeServiceName(name);
      expect(sanitized).toMatch(/^[a-z0-9_-]+$/);
    });

    test('should handle very long names gracefully', () => {
      const veryLongName = 'a'.repeat(1000);

      const result = validator.validateServiceName(veryLongName);
      expect(result.isValid).toBe(false);

      const sanitized = validator.sanitizeServiceName(veryLongName);
      expect(sanitized.length).toBeLessThanOrEqual(50);
    });

    test('should handle special character combinations', () => {
      const specialNames = [
        '---___---',
        '...',
        '   ',
        '\t\n\r',
        '@@@@',
        '####'
      ];

      specialNames.forEach(name => {
        const sanitized = validator.sanitizeServiceName(name);
        expect(sanitized).toBe('unknown-service');
      });
    });
  });

  describe('constants and rules', () => {
    test('should export validation rules', () => {
      expect(VALIDATION_RULES).toHaveProperty('serviceName');
      expect(VALIDATION_RULES).toHaveProperty('displayName');
      expect(VALIDATION_RULES.serviceName.maxLength).toBe(50);
      expect(VALIDATION_RULES.displayName.maxLength).toBe(100);
    });

    test('should export reserved names', () => {
      expect(RESERVED_NAMES.has('unknown')).toBe(true);
      expect(RESERVED_NAMES.has('system')).toBe(true);
      expect(RESERVED_NAMES.has('admin')).toBe(true);
    });

    test('should maintain consistent validation rules', () => {
      const serviceName = VALIDATION_RULES.serviceName;
      expect(serviceName.pattern.test('valid-name')).toBe(true);
      expect(serviceName.pattern.test('invalid@name')).toBe(false);
    });
  });
});

module.exports = {
  // Export test utilities if needed
};