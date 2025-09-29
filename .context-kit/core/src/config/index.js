/**
 * Configuration System Index
 * Unified exports for the service configuration system
 */

const configLoader = require('./config-loader');
const mappingValidator = require('./mapping-validator');
const defaultMappings = require('./default-mappings');

// Re-export classes and instances
module.exports = {
  // Configuration Loading
  ConfigLoader: configLoader.ConfigLoader,
  defaultLoader: configLoader.defaultLoader,

  // Validation
  MappingValidator: mappingValidator.MappingValidator,
  ValidationResult: mappingValidator.ValidationResult,
  defaultValidator: mappingValidator.defaultValidator,

  // Default Mappings
  DefaultMappings: defaultMappings.DefaultMappings,
  defaultMappings: defaultMappings.defaultMappings,
  BUILT_IN_MAPPINGS: defaultMappings.BUILT_IN_MAPPINGS,
  CATEGORY_FALLBACKS: defaultMappings.CATEGORY_FALLBACKS,
  PROCESS_TYPE_PATTERNS: defaultMappings.PROCESS_TYPE_PATTERNS,
  ENVIRONMENT_MAPPINGS: defaultMappings.ENVIRONMENT_MAPPINGS,

  // Convenience functions
  async loadConfig(configPath) {
    return configLoader.load(configPath);
  },

  enableHotReload() {
    return configLoader.enableHotReload();
  },

  getServiceMapping(key) {
    return configLoader.getServiceMapping(key);
  },

  findMappingByPattern(pattern) {
    return configLoader.findMappingByPattern(pattern);
  },

  validateConfig(config) {
    return mappingValidator.validateConfig(config);
  },

  validateServiceName(name) {
    return mappingValidator.validateServiceName(name);
  },

  sanitizeServiceName(name) {
    return mappingValidator.sanitizeServiceName(name);
  },

  detectServiceCategory(processInfo) {
    return defaultMappings.detectServiceCategory(processInfo);
  },

  getFallbackForCategory(category, processInfo) {
    return defaultMappings.getFallbackForCategory(category, processInfo);
  },

  getFallbackFromPackage(packageInfo) {
    return defaultMappings.getFallbackFromPackage(packageInfo);
  },

  findBuiltInMappingByPattern(pattern) {
    return defaultMappings.findBuiltInMappingByPattern(pattern);
  },

  // System information
  getSystemStats() {
    return {
      loader: configLoader.getStats(),
      validator: mappingValidator.getStats(),
      defaultMappings: defaultMappings.getStats()
    };
  }
};