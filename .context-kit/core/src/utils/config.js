/**
 * Configuration Management Utilities
 * Centralized configuration loading, validation, and management
 */
import { readFileSync } from 'fs';
export class ConfigManager {
    config;
    envConfig;
    constructor(configPath) {
        this.envConfig = this.loadEnvironmentConfig();
        this.config = this.loadConfiguration(configPath);
        this.validateConfiguration();
    }
    loadEnvironmentConfig() {
        return {
            NODE_ENV: process.env.NODE_ENV || 'development',
            LOG_LEVEL: process.env.LOG_LEVEL,
            DATABASE_PATH: process.env.DATABASE_PATH,
            SERVER_PORT: process.env.SERVER_PORT,
            SERVER_HOST: process.env.SERVER_HOST,
            ENABLE_CORS: process.env.ENABLE_CORS,
            API_KEYS: process.env.API_KEYS
        };
    }
    loadConfiguration(configPath) {
        // Default configuration
        const defaultConfig = {
            database: {
                path: this.envConfig.DATABASE_PATH || './knowledge-graph.db',
                readonly: false,
                timeout: 5000,
                maxConnections: 10,
                enableWal: true,
                enableForeignKeys: true,
                busyTimeout: 3000,
                cacheSize: 2000,
                journalMode: 'WAL'
            },
            knowledgeGraph: {
                enableSearchIndex: true,
                autoPopulateIndex: true,
                indexUpdateBatchSize: 100
            },
            search: {
                enableFuzzySearch: true,
                fuzzyThreshold: 0.3,
                enableRegexSearch: true,
                regexTimeout: 1000,
                maxResults: 1000
            },
            logging: {
                databasePath: this.envConfig.DATABASE_PATH,
                retentionDays: 30,
                batchSize: 100,
                flushInterval: 5000,
                enableHttpTransport: false,
                enableConsoleTransport: this.envConfig.NODE_ENV === 'development',
                logLevel: this.envConfig.LOG_LEVEL || 'info',
                services: []
            }
        };
        if (!configPath) {
            return this.mergeWithEnvironment(defaultConfig);
        }
        try {
            const fileContent = readFileSync(configPath, 'utf-8');
            const fileConfig = JSON.parse(fileContent);
            return this.mergeConfigurations(defaultConfig, fileConfig);
        }
        catch (error) {
            throw this.createConfigError('CONFIGURATION_ERROR', `Failed to load configuration from ${configPath}: ${error instanceof Error ? error.message : 'Unknown error'}`, { configPath });
        }
    }
    mergeWithEnvironment(config) {
        const merged = { ...config };
        // Apply environment overrides
        if (this.envConfig.DATABASE_PATH) {
            merged.database.path = this.envConfig.DATABASE_PATH;
        }
        if (this.envConfig.LOG_LEVEL) {
            merged.logging.logLevel = this.envConfig.LOG_LEVEL;
        }
        if (this.envConfig.SERVER_PORT) {
            const port = parseInt(this.envConfig.SERVER_PORT, 10);
            if (!isNaN(port)) {
                // Server config would be added here if needed
            }
        }
        return merged;
    }
    mergeConfigurations(defaultConfig, userConfig) {
        return {
            database: { ...defaultConfig.database, ...userConfig.database },
            knowledgeGraph: { ...defaultConfig.knowledgeGraph, ...userConfig.knowledgeGraph },
            search: { ...defaultConfig.search, ...userConfig.search },
            logging: { ...defaultConfig.logging, ...userConfig.logging }
        };
    }
    validateConfiguration() {
        const schema = {
            rules: [
                { field: 'database.path', type: 'string', required: true },
                { field: 'database.timeout', type: 'number', min: 1000, max: 30000 },
                { field: 'database.maxConnections', type: 'number', min: 1, max: 100 },
                { field: 'search.fuzzyThreshold', type: 'number', min: 0, max: 1 },
                { field: 'search.regexTimeout', type: 'number', min: 100, max: 10000 },
                { field: 'search.maxResults', type: 'number', min: 1, max: 10000 },
                { field: 'logging.retentionDays', type: 'number', min: 1, max: 365 },
                { field: 'logging.batchSize', type: 'number', min: 1, max: 1000 },
                { field: 'logging.flushInterval', type: 'number', min: 1000, max: 60000 }
            ]
        };
        this.validateObject(this.config, schema);
    }
    validateObject(obj, schema) {
        for (const rule of schema.rules) {
            const value = this.getNestedValue(obj, rule.field);
            this.validateField(rule.field, value, rule);
        }
    }
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    validateField(field, value, rule) {
        if (rule.required && (value === undefined || value === null)) {
            throw this.createConfigError('VALIDATION_ERROR', `Required field '${field}' is missing`, { field, rule });
        }
        if (value === undefined || value === null) {
            return; // Optional field not provided
        }
        if (typeof value !== rule.type) {
            throw this.createConfigError('VALIDATION_ERROR', `Field '${field}' must be of type ${rule.type}, got ${typeof value}`, { field, value, expected: rule.type });
        }
        if (rule.type === 'number') {
            if (rule.min !== undefined && value < rule.min) {
                throw this.createConfigError('VALIDATION_ERROR', `Field '${field}' must be >= ${rule.min}, got ${value}`, { field, value, min: rule.min });
            }
            if (rule.max !== undefined && value > rule.max) {
                throw this.createConfigError('VALIDATION_ERROR', `Field '${field}' must be <= ${rule.max}, got ${value}`, { field, value, max: rule.max });
            }
        }
        if (rule.type === 'string' && rule.pattern) {
            const regex = new RegExp(rule.pattern);
            if (!regex.test(value)) {
                throw this.createConfigError('VALIDATION_ERROR', `Field '${field}' does not match pattern ${rule.pattern}`, { field, value, pattern: rule.pattern });
            }
        }
        if (rule.enum && !rule.enum.includes(value)) {
            throw this.createConfigError('VALIDATION_ERROR', `Field '${field}' must be one of: ${rule.enum.join(', ')}`, { field, value, allowedValues: rule.enum });
        }
        if (rule.custom) {
            const result = rule.custom(value);
            if (typeof result === 'string') {
                throw this.createConfigError('VALIDATION_ERROR', `Field '${field}' validation failed: ${result}`, { field, value });
            }
            else if (!result) {
                throw this.createConfigError('VALIDATION_ERROR', `Field '${field}' failed custom validation`, { field, value });
            }
        }
    }
    createConfigError(code, message, metadata) {
        const error = new Error(message);
        error.code = code;
        error.metadata = metadata;
        return error;
    }
    // Public API
    getConfig() {
        return { ...this.config };
    }
    getDatabaseConfig() {
        return { ...this.config.database };
    }
    getSearchConfig() {
        return { ...this.config.search };
    }
    getLoggingConfig() {
        return { ...this.config.logging };
    }
    getKnowledgeGraphConfig() {
        return { ...this.config.knowledgeGraph };
    }
    isProduction() {
        return this.envConfig.NODE_ENV === 'production';
    }
    isDevelopment() {
        return this.envConfig.NODE_ENV === 'development';
    }
    isTest() {
        return this.envConfig.NODE_ENV === 'test';
    }
    updateConfig(updates) {
        this.config = this.mergeConfigurations(this.config, updates);
        this.validateConfiguration();
    }
}
// Default instance
export const config = new ConfigManager();
//# sourceMappingURL=config.js.map