/**
 * Utilities Exports
 * Central export point for all utility functions
 */
// Configuration utilities
export { ConfigManager, config } from './config.js';
// ID generation utilities
export { IdGenerator, generateEntityId, generateRelationId, generateLogId, generateId, isValidId } from './id-generator.js';
// Validation utilities
export { ValidationUtils, validateEntity, validateRelation, validateSearchOptions, validateSearchQuery, validateLogEntry, validateLogFilters, throwIfInvalid } from './validation.js';
// Logging utilities
export { CoreLogger, createLogger, logger, databaseLogger, searchLogger, knowledgeGraphLogger, loggingLogger, PerformanceTimer, timeOperation, timeAsync } from './logger.js';
// Common utility functions
export class Utils {
    /**
     * Deep merge two objects
     */
    static deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                const sourceValue = source[key];
                const targetValue = result[key];
                if (this.isObject(sourceValue) && this.isObject(targetValue)) {
                    result[key] = this.deepMerge(targetValue, sourceValue);
                }
                else {
                    result[key] = sourceValue;
                }
            }
        }
        return result;
    }
    /**
     * Deep clone an object
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        if (Array.isArray(obj)) {
            return obj.map(item => this.deepClone(item));
        }
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    }
    /**
     * Check if value is a plain object
     */
    static isObject(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }
    /**
     * Debounce function execution
     */
    static debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    }
    /**
     * Throttle function execution
     */
    static throttle(func, delay) {
        let lastCall = 0;
        return (...args) => {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                func(...args);
            }
        };
    }
    /**
     * Sleep for specified milliseconds
     */
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Retry async operation with exponential backoff
     */
    static async retry(operation, maxAttempts = 3, baseDelay = 1000) {
        let lastError;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                if (attempt === maxAttempts) {
                    throw lastError;
                }
                const delay = baseDelay * Math.pow(2, attempt - 1);
                await this.sleep(delay);
            }
        }
        throw lastError;
    }
    /**
     * Safe JSON parse with default value
     */
    static safeJsonParse(json, defaultValue) {
        try {
            return JSON.parse(json);
        }
        catch {
            return defaultValue;
        }
    }
    /**
     * Safe JSON stringify
     */
    static safeJsonStringify(obj, defaultValue = '{}') {
        try {
            return JSON.stringify(obj);
        }
        catch {
            return defaultValue;
        }
    }
    /**
     * Generate trigrams for fuzzy search
     */
    static generateTrigrams(text) {
        if (!text || text.length < 3) {
            return [];
        }
        const normalized = text.toLowerCase();
        const padded = `__${normalized}__`;
        const trigrams = new Set();
        for (let i = 0; i < padded.length - 2; i++) {
            trigrams.add(padded.substring(i, i + 3));
        }
        return Array.from(trigrams);
    }
    /**
     * Calculate trigram similarity between two strings
     */
    static trigramSimilarity(str1, str2) {
        const trigrams1 = new Set(this.generateTrigrams(str1));
        const trigrams2 = new Set(this.generateTrigrams(str2));
        const intersection = new Set([...trigrams1].filter(x => trigrams2.has(x)));
        const union = new Set([...trigrams1, ...trigrams2]);
        return union.size === 0 ? 0 : intersection.size / union.size;
    }
    /**
     * Normalize string for search indexing
     */
    static normalizeForSearch(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/[^a-z0-9\s]/g, ' ') // Replace special chars with spaces
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }
    /**
     * Extract file extension from path
     */
    static getFileExtension(filePath) {
        if (!filePath || !filePath.includes('.')) {
            return '';
        }
        const lastDot = filePath.lastIndexOf('.');
        const lastSlash = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'));
        // Make sure the dot is after the last path separator
        if (lastDot > lastSlash) {
            return filePath.substring(lastDot + 1).toLowerCase();
        }
        return '';
    }
    /**
     * Format bytes to human readable string
     */
    static formatBytes(bytes, decimals = 2) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    /**
     * Format duration in milliseconds to human readable string
     */
    static formatDuration(ms) {
        if (ms < 1000) {
            return `${ms}ms`;
        }
        const seconds = Math.floor(ms / 1000);
        if (seconds < 60) {
            return `${seconds}s`;
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes < 60) {
            return `${minutes}m ${remainingSeconds}s`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
    }
}
//# sourceMappingURL=index.js.map