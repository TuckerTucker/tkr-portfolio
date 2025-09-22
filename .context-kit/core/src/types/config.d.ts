/**
 * Configuration Types
 * Shared configuration interfaces for all modules
 */
export interface DatabaseConfig {
    path: string;
    readonly?: boolean;
    timeout?: number;
    maxConnections?: number;
    enableWal?: boolean;
    enableForeignKeys?: boolean;
    busyTimeout?: number;
    cacheSize?: number;
    journalMode?: 'DELETE' | 'TRUNCATE' | 'PERSIST' | 'MEMORY' | 'WAL' | 'OFF';
}
export interface ServerConfig {
    host?: string;
    port?: number;
    cors?: {
        origin?: string | string[];
        methods?: string[];
        allowedHeaders?: string[];
        credentials?: boolean;
    };
    rateLimit?: {
        windowMs?: number;
        maxRequests?: number;
    };
    security?: {
        enableHelmet?: boolean;
        requireAuth?: boolean;
        apiKeys?: string[];
    };
    logging?: {
        enabled?: boolean;
        level?: string;
        format?: 'json' | 'pretty';
    };
}
export interface MCPServerConfig {
    databasePath?: string;
    logLevel?: string;
    enableLogging?: boolean;
    tools?: {
        knowledgeGraph?: boolean;
        logging?: boolean;
        search?: boolean;
    };
    limits?: {
        maxResults?: number;
        queryTimeout?: number;
    };
}
export interface CoreModuleConfig {
    database: DatabaseConfig;
    knowledgeGraph?: {
        enableSearchIndex?: boolean;
        autoPopulateIndex?: boolean;
        indexUpdateBatchSize?: number;
    };
    search?: {
        enableFuzzySearch?: boolean;
        fuzzyThreshold?: number;
        enableRegexSearch?: boolean;
        regexTimeout?: number;
        maxResults?: number;
    };
    logging?: LogServiceConfig;
}
export interface EnvironmentConfig {
    NODE_ENV?: 'development' | 'production' | 'test';
    LOG_LEVEL?: string;
    DATABASE_PATH?: string;
    SERVER_PORT?: string;
    SERVER_HOST?: string;
    ENABLE_CORS?: string;
    API_KEYS?: string;
}
export interface ValidationRule {
    field: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
    custom?: (value: any) => boolean | string;
}
export interface ConfigSchema {
    rules: ValidationRule[];
    defaults?: Record<string, any>;
    transform?: (config: any) => any;
}
import type { LogServiceConfig } from './logging.js';
//# sourceMappingURL=config.d.ts.map