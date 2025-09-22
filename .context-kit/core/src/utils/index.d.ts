/**
 * Utilities Exports
 * Central export point for all utility functions
 */
export { ConfigManager, config } from './config.js';
export type { ConfigManager as ConfigManagerType } from './config.js';
export { IdGenerator, generateEntityId, generateRelationId, generateLogId, generateId, isValidId } from './id-generator.js';
export { ValidationUtils, validateEntity, validateRelation, validateSearchOptions, validateSearchQuery, validateLogEntry, validateLogFilters, throwIfInvalid } from './validation.js';
export { CoreLogger, createLogger, logger, databaseLogger, searchLogger, knowledgeGraphLogger, loggingLogger, PerformanceTimer, timeOperation, timeAsync } from './logger.js';
export type { LoggerConfig } from './logger.js';
export declare class Utils {
    /**
     * Deep merge two objects
     */
    static deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T;
    /**
     * Deep clone an object
     */
    static deepClone<T>(obj: T): T;
    /**
     * Check if value is a plain object
     */
    static isObject(value: any): value is Record<string, any>;
    /**
     * Debounce function execution
     */
    static debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void;
    /**
     * Throttle function execution
     */
    static throttle<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void;
    /**
     * Sleep for specified milliseconds
     */
    static sleep(ms: number): Promise<void>;
    /**
     * Retry async operation with exponential backoff
     */
    static retry<T>(operation: () => Promise<T>, maxAttempts?: number, baseDelay?: number): Promise<T>;
    /**
     * Safe JSON parse with default value
     */
    static safeJsonParse<T>(json: string, defaultValue: T): T;
    /**
     * Safe JSON stringify
     */
    static safeJsonStringify(obj: any, defaultValue?: string): string;
    /**
     * Generate trigrams for fuzzy search
     */
    static generateTrigrams(text: string): string[];
    /**
     * Calculate trigram similarity between two strings
     */
    static trigramSimilarity(str1: string, str2: string): number;
    /**
     * Normalize string for search indexing
     */
    static normalizeForSearch(text: string): string;
    /**
     * Extract file extension from path
     */
    static getFileExtension(filePath: string): string;
    /**
     * Format bytes to human readable string
     */
    static formatBytes(bytes: number, decimals?: number): string;
    /**
     * Format duration in milliseconds to human readable string
     */
    static formatDuration(ms: number): string;
}
//# sourceMappingURL=index.d.ts.map