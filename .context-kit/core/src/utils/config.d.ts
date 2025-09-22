/**
 * Configuration Management Utilities
 * Centralized configuration loading, validation, and management
 */
import type { CoreModuleConfig, DatabaseConfig } from '../types/config.js';
export declare class ConfigManager {
    private config;
    private envConfig;
    constructor(configPath?: string);
    private loadEnvironmentConfig;
    private loadConfiguration;
    private mergeWithEnvironment;
    private mergeConfigurations;
    private validateConfiguration;
    private validateObject;
    private getNestedValue;
    private validateField;
    private createConfigError;
    getConfig(): CoreModuleConfig;
    getDatabaseConfig(): DatabaseConfig;
    getSearchConfig(): {
        enableFuzzySearch?: boolean;
        fuzzyThreshold?: number;
        enableRegexSearch?: boolean;
        regexTimeout?: number;
        maxResults?: number;
    };
    getLoggingConfig(): {
        databasePath?: string;
        retentionDays?: number;
        batchSize?: number;
        batchInterval?: number;
        flushInterval?: number;
        maxLogAge?: number;
        enableAnalytics?: boolean;
        retentionPolicy?: "time_based" | "count_based";
        maxLogEntries?: number;
        enableHttpTransport?: boolean;
        httpEndpoint?: string;
        enableConsoleTransport?: boolean;
        logLevel?: import("../index.js").LogLevel;
        services?: string[];
    };
    getKnowledgeGraphConfig(): {
        enableSearchIndex?: boolean;
        autoPopulateIndex?: boolean;
        indexUpdateBatchSize?: number;
    };
    isProduction(): boolean;
    isDevelopment(): boolean;
    isTest(): boolean;
    updateConfig(updates: Partial<CoreModuleConfig>): void;
}
export declare const config: ConfigManager;
//# sourceMappingURL=config.d.ts.map