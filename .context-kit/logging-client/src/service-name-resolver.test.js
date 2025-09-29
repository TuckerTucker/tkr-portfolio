/**
 * Unit tests for ServiceNameResolver
 * Testing the complete interface contract and edge cases
 */

const { ServiceNameResolver, ServiceCategory, ResolutionSource } = require('./service-name-resolver');

describe('ServiceNameResolver', () => {
  let resolver;

  beforeEach(() => {
    resolver = new ServiceNameResolver();
    // Clear any environment variables that might interfere
    delete process.env.TKR_SERVICE_NAME;
  });

  describe('resolveServiceName', () => {
    test('should prioritize TKR_SERVICE_NAME environment variable', () => {
      process.env.TKR_SERVICE_NAME = 'custom-service';

      const context = {
        processInfo: { type: 'node', subtype: 'javascript' }
      };

      const result = resolver.resolveServiceName(context);

      expect(result.serviceName).toBe('custom-service');
      expect(result.source).toBe(ResolutionSource.EXPLICIT_CONFIG);
      expect(result.confidence).toBe(1.0);
    });

    test('should prioritize explicit context name over environment', () => {
      process.env.TKR_SERVICE_NAME = 'env-service';

      const context = {
        explicitName: 'explicit-service',
        processInfo: { type: 'node', subtype: 'javascript' }
      };

      const result = resolver.resolveServiceName(context);

      expect(result.serviceName).toBe('explicit-service');
      expect(result.source).toBe(ResolutionSource.EXPLICIT_CONFIG);
    });

    test('should detect terminal processes with high confidence', () => {
      const context = {
        processInfo: { type: 'terminal', subtype: 'zsh', command: 'zsh' },
        environmentVars: {
          TERM_PROGRAM: 'iTerm.app',
          TERM: 'xterm-256color'
        }
      };

      const result = resolver.resolveServiceName(context);

      expect(result.serviceName).toBe('terminal');
      expect(result.displayName).toBe('Terminal');
      expect(result.category).toBe(ServiceCategory.TERMINAL);
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.source).toBe(ResolutionSource.PROCESS_DETECTION);
    });

    test('should detect development servers correctly', () => {
      const context = {
        processInfo: { type: 'dev-server', subtype: 'vite', command: 'vite' }
      };

      const result = resolver.resolveServiceName(context);

      expect(result.serviceName).toBe('vite-dev');
      expect(result.category).toBe(ServiceCategory.DEV_SERVER);
      expect(result.confidence).toBe(0.9);
    });

    test('should use package info when process detection fails', () => {
      const context = {
        processInfo: { type: 'unknown', subtype: 'unknown' },
        packageInfo: { name: 'my-awesome-app' }
      };

      const result = resolver.resolveServiceName(context);

      expect(result.serviceName).toBe('my-awesome-app');
      expect(result.source).toBe(ResolutionSource.PACKAGE_NAME);
      expect(result.confidence).toBe(0.6);
    });

    test('should provide fallback when all detection methods fail', () => {
      const context = {
        processInfo: null,
        packageInfo: null
      };

      const result = resolver.resolveServiceName(context);

      expect(result.serviceName).toBe('unknown-service');
      expect(result.displayName).toBe('Unknown Service');
      expect(result.category).toBe(ServiceCategory.UNKNOWN);
      expect(result.source).toBe(ResolutionSource.FALLBACK);
    });

    test('should handle errors gracefully', () => {
      // Force an error by passing invalid context
      const result = resolver.resolveServiceName({ processInfo: 'invalid' });

      expect(result.serviceName).toBe('unknown-service');
      expect(result.confidence).toBe(0.1);
    });

    test('should cache results for performance', () => {
      const context = {
        processInfo: { type: 'node', subtype: 'javascript' }
      };

      const result1 = resolver.resolveServiceName(context);
      const result2 = resolver.resolveServiceName(context);

      expect(result1).toEqual(result2);
    });
  });

  describe('isTerminalProcess', () => {
    test('should detect terminal based on TERM_PROGRAM', () => {
      const processInfo = { type: 'unknown' };
      const context = {
        environmentVars: { TERM_PROGRAM: 'iTerm.app' }
      };

      const isTerminal = resolver.isTerminalProcess(processInfo, context);
      expect(isTerminal).toBe(true);
    });

    test('should detect shell processes', () => {
      const processInfo = { command: 'zsh', title: 'zsh' };
      const context = {
        environmentVars: { TERM: 'xterm-256color' }
      };

      const isTerminal = resolver.isTerminalProcess(processInfo, context);
      expect(isTerminal).toBe(true);
    });

    test('should not detect non-terminal processes', () => {
      const processInfo = { type: 'node', command: 'node' };
      const context = {
        environmentVars: { NODE_ENV: 'production' }
      };

      const isTerminal = resolver.isTerminalProcess(processInfo, context);
      expect(isTerminal).toBe(false);
    });
  });

  describe('setNameMapping and getNameMapping', () => {
    test('should store and retrieve custom mappings', () => {
      resolver.setNameMapping('custom-process', 'Custom Process');

      const mapping = resolver.getNameMapping('custom-process');
      expect(mapping).toBe('Custom Process');
    });

    test('should return null for non-existent mappings', () => {
      const mapping = resolver.getNameMapping('non-existent');
      expect(mapping).toBeNull();
    });

    test('should clear cache when mappings change', () => {
      const context = { processInfo: { type: 'test-type' } };

      // Get initial result
      const result1 = resolver.resolveServiceName(context);

      // Add mapping and get new result
      resolver.setNameMapping('test-type', 'Test Service');
      const result2 = resolver.resolveServiceName(context);

      expect(result1.displayName).not.toBe(result2.displayName);
    });
  });

  describe('validateServiceName', () => {
    test('should validate correct service names', () => {
      const result = resolver.validateServiceName('valid-service-name');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject empty names', () => {
      const result = resolver.validateServiceName('');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Service name must be a non-empty string');
    });

    test('should reject names with invalid characters', () => {
      const result = resolver.validateServiceName('invalid@name!');

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('alphanumeric characters, dashes, and underscores');
    });

    test('should reject names that start/end with special characters', () => {
      const result = resolver.validateServiceName('-invalid-');

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('cannot start or end with dash or underscore');
    });

    test('should reject names that are too long', () => {
      const longName = 'a'.repeat(51);
      const result = resolver.validateServiceName(longName);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('1-50 characters');
    });
  });

  describe('sanitizeServiceName', () => {
    test('should sanitize invalid characters', () => {
      const result = resolver.sanitizeServiceName('Invalid@Name!123');
      expect(result).toBe('invalid-name-123');
    });

    test('should remove leading/trailing special characters', () => {
      const result = resolver.sanitizeServiceName('_-invalid-name-_');
      expect(result).toBe('invalid-name');
    });

    test('should handle consecutive special characters', () => {
      const result = resolver.sanitizeServiceName('invalid---name___test');
      expect(result).toBe('invalid-name-test');
    });

    test('should truncate long names', () => {
      const longName = 'a'.repeat(60);
      const result = resolver.sanitizeServiceName(longName);
      expect(result.length).toBeLessThanOrEqual(50);
    });

    test('should provide fallback for empty input', () => {
      expect(resolver.sanitizeServiceName('')).toBe('unknown-service');
      expect(resolver.sanitizeServiceName(null)).toBe('unknown-service');
      expect(resolver.sanitizeServiceName(undefined)).toBe('unknown-service');
    });
  });

  describe('performance requirements', () => {
    test('should resolve service names in under 1ms', () => {
      const context = {
        processInfo: { type: 'dev-server', subtype: 'vite' }
      };

      const start = performance.now();
      resolver.resolveServiceName(context);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(1);
    });

    test('should benefit from caching on repeated calls', () => {
      const context = {
        processInfo: { type: 'dev-server', subtype: 'vite' }
      };

      // First call (uncached)
      const start1 = performance.now();
      resolver.resolveServiceName(context);
      const duration1 = performance.now() - start1;

      // Second call (cached)
      const start2 = performance.now();
      resolver.resolveServiceName(context);
      const duration2 = performance.now() - start2;

      expect(duration2).toBeLessThan(duration1);
    });
  });

  describe('edge cases', () => {
    test('should handle undefined context', () => {
      const result = resolver.resolveServiceName();

      expect(result.serviceName).toBe('unknown-service');
      expect(result.source).toBe(ResolutionSource.FALLBACK);
    });

    test('should handle malformed process info', () => {
      const context = {
        processInfo: { type: null, subtype: undefined, command: '' }
      };

      const result = resolver.resolveServiceName(context);

      expect(result.serviceName).toBe('unknown-service');
      expect(result.confidence).toBeLessThan(0.5);
    });

    test('should handle very long explicit names', () => {
      const longName = 'a'.repeat(100);
      const context = {
        explicitName: longName
      };

      const result = resolver.resolveServiceName(context);

      expect(result.serviceName.length).toBeLessThanOrEqual(50);
    });
  });

  describe('category inference', () => {
    test('should infer correct categories from names', () => {
      expect(resolver.inferCategoryFromName('terminal-app')).toBe(ServiceCategory.TERMINAL);
      expect(resolver.inferCategoryFromName('dev-server')).toBe(ServiceCategory.DEV_SERVER);
      expect(resolver.inferCategoryFromName('build-tool')).toBe(ServiceCategory.BUILD_TOOL);
      expect(resolver.inferCategoryFromName('test-runner')).toBe(ServiceCategory.TEST_RUNNER);
      expect(resolver.inferCategoryFromName('api-service')).toBe(ServiceCategory.API_SERVICE);
      expect(resolver.inferCategoryFromName('unknown-thing')).toBe(ServiceCategory.UNKNOWN);
    });

    test('should infer categories from subtypes', () => {
      expect(resolver.inferCategoryFromSubtype('dev')).toBe(ServiceCategory.DEV_SERVER);
      expect(resolver.inferCategoryFromSubtype('build')).toBe(ServiceCategory.BUILD_TOOL);
      expect(resolver.inferCategoryFromSubtype('test')).toBe(ServiceCategory.TEST_RUNNER);
      expect(resolver.inferCategoryFromSubtype('unknown')).toBe(ServiceCategory.UNKNOWN);
    });
  });

  describe('helper methods', () => {
    test('should format display names correctly', () => {
      expect(resolver.formatDisplayName('my-service-name')).toBe('My Service Name');
      expect(resolver.formatDisplayName('my_service_name')).toBe('My Service Name');
    });

    test('should capitalize words correctly', () => {
      expect(resolver.capitalize('hello')).toBe('Hello');
      expect(resolver.capitalize('WORLD')).toBe('World');
      expect(resolver.capitalize('')).toBe('');
    });

    test('should generate cache keys consistently', () => {
      const context1 = { processInfo: { type: 'test' } };
      const context2 = { processInfo: { type: 'test' } };

      const key1 = resolver.generateCacheKey(context1);
      const key2 = resolver.generateCacheKey(context2);

      expect(key1).toBe(key2);
    });
  });
});

// Mock performance.now if not available
if (typeof performance === 'undefined') {
  global.performance = { now: () => Date.now() };
}

module.exports = {
  // Export test utilities if needed
};