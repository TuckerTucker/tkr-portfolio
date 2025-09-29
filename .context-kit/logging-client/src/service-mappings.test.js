/**
 * Unit tests for ServiceMappings
 * Testing mapping logic, configuration management, and suggestions
 */

const {
  ServiceMappings,
  getServiceMappings,
  getDisplayName,
  setMapping,
  suggestServiceName,
  DEFAULT_MAPPINGS,
  CATEGORY_MAPPINGS
} = require('./service-mappings');

describe('ServiceMappings', () => {
  let mappings;

  beforeEach(() => {
    mappings = new ServiceMappings();
  });

  describe('getDisplayName', () => {
    test('should return direct mappings', () => {
      expect(mappings.getDisplayName('terminal')).toBe('Terminal');
      expect(mappings.getDisplayName('vite-dev')).toBe('Development Server');
      expect(mappings.getDisplayName('jest-tests')).toBe('Jest Tests');
    });

    test('should return category-based mappings', () => {
      expect(mappings.getDisplayName('unknown', 'vite', 'dev-server')).toBe('Vite Dev Server');
      expect(mappings.getDisplayName('unknown', 'jest', 'test-runner')).toBe('Jest Tests');
      expect(mappings.getDisplayName('unknown', null, 'terminal')).toBe('Terminal');
    });

    test('should use subtype combinations', () => {
      expect(mappings.getDisplayName('npm', 'dev')).toBe('NPM Dev');
      expect(mappings.getDisplayName('yarn', 'build')).toBe('Yarn Build');
    });

    test('should fallback to formatted process type', () => {
      expect(mappings.getDisplayName('unknown-process')).toBe('Unknown Process');
      expect(mappings.getDisplayName('my_custom_service')).toBe('My Custom Service');
      expect(mappings.getDisplayName('process', 'subtype')).toBe('Process (Subtype)');
    });

    test('should handle null/undefined inputs gracefully', () => {
      expect(mappings.getDisplayName(null)).toBe('Unknown Process');
      expect(mappings.getDisplayName('')).toBe('Unknown Process');
      expect(mappings.getDisplayName(undefined)).toBe('Unknown Process');
    });
  });

  describe('custom mappings', () => {
    test('should set and get custom mappings', () => {
      mappings.setMapping('custom-service', 'Custom Service');

      expect(mappings.getMapping('custom-service')).toBe('Custom Service');
      expect(mappings.getDisplayName('custom-service')).toBe('Custom Service');
    });

    test('should override default mappings', () => {
      const originalMapping = mappings.getDisplayName('terminal');
      mappings.setMapping('terminal', 'My Terminal');

      expect(mappings.getDisplayName('terminal')).toBe('My Terminal');
      expect(mappings.getDisplayName('terminal')).not.toBe(originalMapping);
    });

    test('should remove custom mappings', () => {
      mappings.setMapping('temp-service', 'Temporary Service');
      expect(mappings.hasMapping('temp-service')).toBe(true);

      const removed = mappings.removeMapping('temp-service');
      expect(removed).toBe(true);
      expect(mappings.hasMapping('temp-service')).toBe(false);
    });

    test('should return false when removing non-existent mapping', () => {
      const removed = mappings.removeMapping('non-existent');
      expect(removed).toBe(false);
    });

    test('should get all mappings', () => {
      mappings.setMapping('test-1', 'Test One');
      mappings.setMapping('test-2', 'Test Two');

      const allMappings = mappings.getAllMappings();
      expect(allMappings['test-1']).toBe('Test One');
      expect(allMappings['test-2']).toBe('Test Two');
      expect(allMappings['terminal']).toBe('Terminal'); // Default mapping
    });

    test('should clear all mappings and reinitialize defaults', () => {
      mappings.setMapping('custom-service', 'Custom Service');
      expect(mappings.hasMapping('custom-service')).toBe(true);

      mappings.clearMappings();
      expect(mappings.hasMapping('custom-service')).toBe(false);
      expect(mappings.hasMapping('terminal')).toBe(true); // Default restored
    });
  });

  describe('formatProcessType', () => {
    test('should format single words', () => {
      expect(mappings.formatProcessType('terminal')).toBe('Terminal');
      expect(mappings.formatProcessType('node')).toBe('Node');
    });

    test('should format hyphenated names', () => {
      expect(mappings.formatProcessType('dev-server')).toBe('Dev Server');
      expect(mappings.formatProcessType('test-runner')).toBe('Test Runner');
    });

    test('should format underscored names', () => {
      expect(mappings.formatProcessType('my_service')).toBe('My Service');
      expect(mappings.formatProcessType('custom_process_type')).toBe('Custom Process Type');
    });

    test('should format with subtype', () => {
      expect(mappings.formatProcessType('server', 'express')).toBe('Server (Express)');
      expect(mappings.formatProcessType('test', 'unit')).toBe('Test (Unit)');
    });

    test('should handle empty input', () => {
      expect(mappings.formatProcessType('')).toBe('Unknown Process');
      expect(mappings.formatProcessType(null)).toBe('Unknown Process');
    });
  });

  describe('suggestServiceName', () => {
    test('should suggest based on process type', () => {
      const processInfo = { type: 'terminal', subtype: 'zsh', command: 'zsh' };
      const suggestions = mappings.suggestServiceName(processInfo);

      expect(suggestions).toContain('Terminal');
      expect(suggestions.length).toBeGreaterThan(0);
    });

    test('should include command-based suggestions', () => {
      const processInfo = { type: 'node', command: 'my-app.js' };
      const suggestions = mappings.suggestServiceName(processInfo);

      expect(suggestions).toContain('My App.js');
    });

    test('should not duplicate suggestions', () => {
      const processInfo = { type: 'terminal', command: 'terminal' };
      const suggestions = mappings.suggestServiceName(processInfo);

      const uniqueSuggestions = [...new Set(suggestions)];
      expect(suggestions.length).toBe(uniqueSuggestions.length);
    });

    test('should provide fallback for unknown processes', () => {
      const processInfo = { type: 'unknown', command: 'unknown' };
      const suggestions = mappings.suggestServiceName(processInfo);

      expect(suggestions).toContain('Unknown Service');
    });
  });

  describe('configuration management', () => {
    test('should export custom mappings only', () => {
      mappings.setMapping('custom-1', 'Custom One');
      mappings.setMapping('custom-2', 'Custom Two');

      const exported = mappings.exportMappings();
      expect(exported['custom-1']).toBe('Custom One');
      expect(exported['custom-2']).toBe('Custom Two');
      expect(exported['terminal']).toBeUndefined(); // Default not exported
    });

    test('should import mappings from configuration', () => {
      const config = {
        'import-1': 'Imported One',
        'import-2': 'Imported Two'
      };

      mappings.importMappings(config);
      expect(mappings.getMapping('import-1')).toBe('Imported One');
      expect(mappings.getMapping('import-2')).toBe('Imported Two');
    });

    test('should validate mapping configuration', () => {
      const validConfig = {
        'valid-service': 'Valid Service',
        'another-service': 'Another Service'
      };

      const result = mappings.validateMappings(validConfig);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid mapping configuration', () => {
      const invalidConfig = {
        '': 'Empty Key',
        'valid-key': '',
        'very-long-key-that-exceeds-fifty-characters-limit': 'Valid Value',
        'valid-key-2': 'Very long value that exceeds the one hundred character limit and should be rejected by validation'
      };

      const result = mappings.validateMappings(invalidConfig);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should reject non-object configuration', () => {
      const result = mappings.validateMappings('not an object');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('must be an object');
    });

    test('should handle import errors gracefully', () => {
      expect(() => mappings.importMappings(null)).toThrow('Invalid mappings object');
      expect(() => mappings.importMappings('string')).toThrow('Invalid mappings object');
    });
  });

  describe('statistics and utilities', () => {
    test('should provide mapping statistics', () => {
      mappings.setMapping('custom-1', 'Custom One');
      mappings.setMapping('custom-2', 'Custom Two');

      const stats = mappings.getStats();
      expect(stats.totalMappings).toBeGreaterThan(0);
      expect(stats.defaultMappings).toBe(Object.keys(DEFAULT_MAPPINGS).length);
      expect(stats.customMappings).toBe(2);
      expect(stats.categories).toEqual(Object.keys(CATEGORY_MAPPINGS));
    });

    test('should check mapping existence', () => {
      expect(mappings.hasMapping('terminal')).toBe(true);
      expect(mappings.hasMapping('non-existent')).toBe(false);

      mappings.setMapping('new-mapping', 'New Mapping');
      expect(mappings.hasMapping('new-mapping')).toBe(true);
    });

    test('should capitalize words correctly', () => {
      expect(mappings.capitalize('hello')).toBe('Hello');
      expect(mappings.capitalize('WORLD')).toBe('World');
      expect(mappings.capitalize('')).toBe('');
      expect(mappings.capitalize('a')).toBe('A');
    });
  });

  describe('singleton and utility functions', () => {
    test('should use singleton instance', () => {
      const instance1 = getServiceMappings();
      const instance2 = getServiceMappings();

      expect(instance1).toBe(instance2);
    });

    test('should provide utility functions', () => {
      expect(getDisplayName('terminal')).toBe('Terminal');

      setMapping('test-utility', 'Test Utility');
      expect(getDisplayName('test-utility')).toBe('Test Utility');

      const suggestions = suggestServiceName({ type: 'terminal' });
      expect(suggestions).toContain('Terminal');
    });
  });

  describe('constants and defaults', () => {
    test('should export default mappings', () => {
      expect(DEFAULT_MAPPINGS).toHaveProperty('terminal');
      expect(DEFAULT_MAPPINGS).toHaveProperty('vite-dev');
      expect(DEFAULT_MAPPINGS).toHaveProperty('jest-tests');
    });

    test('should export category mappings', () => {
      expect(CATEGORY_MAPPINGS).toHaveProperty('terminal');
      expect(CATEGORY_MAPPINGS).toHaveProperty('dev-server');
      expect(CATEGORY_MAPPINGS).toHaveProperty('build-tool');

      expect(CATEGORY_MAPPINGS.terminal.default).toBe('Terminal');
      expect(CATEGORY_MAPPINGS['dev-server'].patterns.vite).toBe('Vite Dev Server');
    });

    test('should maintain consistent mapping structure', () => {
      Object.values(CATEGORY_MAPPINGS).forEach(category => {
        expect(category).toHaveProperty('default');
        expect(category).toHaveProperty('patterns');
        expect(typeof category.default).toBe('string');
        expect(typeof category.patterns).toBe('object');
      });
    });
  });

  describe('edge cases', () => {
    test('should handle very long process types', () => {
      const longType = 'a'.repeat(100);
      const result = mappings.formatProcessType(longType);

      expect(result).toBe('A'.repeat(100));
    });

    test('should handle special characters in process types', () => {
      const specialType = 'my@service#name';
      const result = mappings.formatProcessType(specialType);

      expect(result).toContain('My@service#name');
    });

    test('should handle process info with missing properties', () => {
      const incompleteInfo = { type: 'test' };
      const suggestions = mappings.suggestServiceName(incompleteInfo);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[suggestions.length - 1]).toBe('Unknown Service');
    });

    test('should handle category with missing patterns', () => {
      const result = mappings.getDisplayName('unknown', 'nonexistent', 'terminal');
      expect(result).toBe('Terminal'); // Falls back to category default
    });
  });
});

module.exports = {
  // Export test utilities if needed
};