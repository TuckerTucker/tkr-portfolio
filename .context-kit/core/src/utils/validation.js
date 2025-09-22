/**
 * Input Validation Utilities
 * Comprehensive validation for entities, relations, and search queries
 */
import { IdGenerator } from './id-generator.js';
export class ValidationUtils {
    /**
     * Validate entity data
     */
    static validateEntity(entity) {
        const errors = [];
        // Validate ID
        if (entity.id && !IdGenerator.isValidId(entity.id)) {
            errors.push(this.createValidationError('id', entity.id, 'Valid nanoid format'));
        }
        // Validate type
        if (!entity.type || typeof entity.type !== 'string') {
            errors.push(this.createValidationError('type', entity.type, 'Non-empty string'));
        }
        else if (entity.type.length > 100) {
            errors.push(this.createValidationError('type', entity.type, 'String <= 100 characters'));
        }
        // Validate name
        if (!entity.name || typeof entity.name !== 'string') {
            errors.push(this.createValidationError('name', entity.name, 'Non-empty string'));
        }
        else if (entity.name.length > 500) {
            errors.push(this.createValidationError('name', entity.name, 'String <= 500 characters'));
        }
        // Validate data
        if (entity.data !== undefined) {
            if (typeof entity.data !== 'object' || entity.data === null || Array.isArray(entity.data)) {
                errors.push(this.createValidationError('data', entity.data, 'Valid object'));
            }
            else {
                try {
                    const serialized = JSON.stringify(entity.data);
                    if (serialized.length > 1000000) { // 1MB limit
                        errors.push(this.createValidationError('data', entity.data, 'Object serializable to <= 1MB'));
                    }
                }
                catch (error) {
                    errors.push(this.createValidationError('data', entity.data, 'JSON serializable object'));
                }
            }
        }
        // Validate timestamps
        if (entity.created_at !== undefined && (!Number.isInteger(entity.created_at) || entity.created_at < 0)) {
            errors.push(this.createValidationError('created_at', entity.created_at, 'Positive integer timestamp'));
        }
        if (entity.updated_at !== undefined && (!Number.isInteger(entity.updated_at) || entity.updated_at < 0)) {
            errors.push(this.createValidationError('updated_at', entity.updated_at, 'Positive integer timestamp'));
        }
        // Validate version
        if (entity.version !== undefined && (!Number.isInteger(entity.version) || entity.version < 1)) {
            errors.push(this.createValidationError('version', entity.version, 'Positive integer >= 1'));
        }
        return errors;
    }
    /**
     * Validate relation data
     */
    static validateRelation(relation) {
        const errors = [];
        // Validate ID
        if (relation.id && !IdGenerator.isValidId(relation.id)) {
            errors.push(this.createValidationError('id', relation.id, 'Valid nanoid format'));
        }
        // Validate from_id
        if (!relation.from_id || !IdGenerator.isValidId(relation.from_id)) {
            errors.push(this.createValidationError('from_id', relation.from_id, 'Valid entity ID'));
        }
        // Validate to_id
        if (!relation.to_id || !IdGenerator.isValidId(relation.to_id)) {
            errors.push(this.createValidationError('to_id', relation.to_id, 'Valid entity ID'));
        }
        // Prevent self-relations
        if (relation.from_id === relation.to_id) {
            errors.push(this.createValidationError('to_id', relation.to_id, 'Different from from_id (no self-relations)'));
        }
        // Validate type
        if (!relation.type || typeof relation.type !== 'string') {
            errors.push(this.createValidationError('type', relation.type, 'Non-empty string'));
        }
        else if (relation.type.length > 100) {
            errors.push(this.createValidationError('type', relation.type, 'String <= 100 characters'));
        }
        // Validate properties
        if (relation.properties !== undefined) {
            if (typeof relation.properties !== 'object' || relation.properties === null || Array.isArray(relation.properties)) {
                errors.push(this.createValidationError('properties', relation.properties, 'Valid object'));
            }
            else {
                try {
                    const serialized = JSON.stringify(relation.properties);
                    if (serialized.length > 100000) { // 100KB limit for relation properties
                        errors.push(this.createValidationError('properties', relation.properties, 'Object serializable to <= 100KB'));
                    }
                }
                catch (error) {
                    errors.push(this.createValidationError('properties', relation.properties, 'JSON serializable object'));
                }
            }
        }
        // Validate timestamp
        if (relation.created_at !== undefined && (!Number.isInteger(relation.created_at) || relation.created_at < 0)) {
            errors.push(this.createValidationError('created_at', relation.created_at, 'Positive integer timestamp'));
        }
        return errors;
    }
    /**
     * Validate search options
     */
    static validateSearchOptions(options) {
        const errors = [];
        if (options.limit !== undefined) {
            if (!Number.isInteger(options.limit) || options.limit < 1 || options.limit > 10000) {
                errors.push(this.createValidationError('limit', options.limit, 'Integer between 1 and 10000'));
            }
        }
        if (options.offset !== undefined) {
            if (!Number.isInteger(options.offset) || options.offset < 0) {
                errors.push(this.createValidationError('offset', options.offset, 'Non-negative integer'));
            }
        }
        if (options.scoreThreshold !== undefined) {
            if (typeof options.scoreThreshold !== 'number' || options.scoreThreshold < 0 || options.scoreThreshold > 1) {
                errors.push(this.createValidationError('scoreThreshold', options.scoreThreshold, 'Number between 0 and 1'));
            }
        }
        if (options.sortBy !== undefined) {
            const validSortOptions = ['relevance', 'name', 'type', 'date'];
            if (!validSortOptions.includes(options.sortBy)) {
                errors.push(this.createValidationError('sortBy', options.sortBy, `One of: ${validSortOptions.join(', ')}`));
            }
        }
        if (options.sortOrder !== undefined) {
            const validSortOrders = ['asc', 'desc'];
            if (!validSortOrders.includes(options.sortOrder)) {
                errors.push(this.createValidationError('sortOrder', options.sortOrder, `One of: ${validSortOrders.join(', ')}`));
            }
        }
        return errors;
    }
    /**
     * Validate search query string
     */
    static validateSearchQuery(query) {
        const errors = [];
        if (typeof query !== 'string') {
            errors.push(this.createValidationError('query', query, 'String'));
            return errors;
        }
        if (query.length === 0) {
            errors.push(this.createValidationError('query', query, 'Non-empty string'));
        }
        if (query.length > 1000) {
            errors.push(this.createValidationError('query', query, 'String <= 1000 characters'));
        }
        // Validate regex patterns
        if (query.startsWith('/') && query.length > 1) {
            const lastSlash = query.lastIndexOf('/');
            if (lastSlash > 0) {
                const pattern = query.substring(1, lastSlash);
                try {
                    new RegExp(pattern);
                }
                catch (error) {
                    errors.push(this.createValidationError('query', query, 'Valid regex pattern'));
                }
            }
        }
        return errors;
    }
    /**
     * Validate log entry
     */
    static validateLogEntry(entry) {
        const errors = [];
        // Validate ID
        if (entry.id && !IdGenerator.isValidId(entry.id)) {
            errors.push(this.createValidationError('id', entry.id, 'Valid nanoid format'));
        }
        // Validate timestamp
        if (!entry.timestamp || !Number.isInteger(entry.timestamp) || entry.timestamp < 0) {
            errors.push(this.createValidationError('timestamp', entry.timestamp, 'Positive integer timestamp'));
        }
        // Validate level
        const validLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];
        if (!entry.level || !validLevels.includes(entry.level)) {
            errors.push(this.createValidationError('level', entry.level, `One of: ${validLevels.join(', ')}`));
        }
        // Validate service
        if (!entry.service || typeof entry.service !== 'string') {
            errors.push(this.createValidationError('service', entry.service, 'Non-empty string'));
        }
        else if (entry.service.length > 100) {
            errors.push(this.createValidationError('service', entry.service, 'String <= 100 characters'));
        }
        // Validate message
        if (!entry.message || typeof entry.message !== 'string') {
            errors.push(this.createValidationError('message', entry.message, 'Non-empty string'));
        }
        else if (entry.message.length > 10000) {
            errors.push(this.createValidationError('message', entry.message, 'String <= 10000 characters'));
        }
        // Validate metadata
        if (entry.metadata !== undefined) {
            if (typeof entry.metadata !== 'object' || entry.metadata === null || Array.isArray(entry.metadata)) {
                errors.push(this.createValidationError('metadata', entry.metadata, 'Valid object'));
            }
        }
        return errors;
    }
    /**
     * Validate log filters
     */
    static validateLogFilters(filters) {
        const errors = [];
        const validLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];
        if (filters.level && !validLevels.includes(filters.level)) {
            errors.push(this.createValidationError('level', filters.level, `One of: ${validLevels.join(', ')}`));
        }
        if (filters.levels) {
            if (!Array.isArray(filters.levels)) {
                errors.push(this.createValidationError('levels', filters.levels, 'Array of log levels'));
            }
            else {
                const invalidLevels = filters.levels.filter(level => !validLevels.includes(level));
                if (invalidLevels.length > 0) {
                    errors.push(this.createValidationError('levels', invalidLevels, `Valid log levels: ${validLevels.join(', ')}`));
                }
            }
        }
        if (filters.services) {
            if (!Array.isArray(filters.services)) {
                errors.push(this.createValidationError('services', filters.services, 'Array of strings'));
            }
            else if (filters.services.some(s => typeof s !== 'string')) {
                errors.push(this.createValidationError('services', filters.services, 'Array of strings'));
            }
        }
        if (filters.timeRange) {
            if (!filters.timeRange.start || !Number.isInteger(filters.timeRange.start)) {
                errors.push(this.createValidationError('timeRange.start', filters.timeRange.start, 'Integer timestamp'));
            }
            if (!filters.timeRange.end || !Number.isInteger(filters.timeRange.end)) {
                errors.push(this.createValidationError('timeRange.end', filters.timeRange.end, 'Integer timestamp'));
            }
            if (filters.timeRange.start && filters.timeRange.end && filters.timeRange.start >= filters.timeRange.end) {
                errors.push(this.createValidationError('timeRange', filters.timeRange, 'start < end'));
            }
        }
        return errors;
    }
    /**
     * Create a validation error
     */
    static createValidationError(field, value, expected) {
        const error = new Error(`Validation failed for field '${field}': expected ${expected}, got ${typeof value === 'object' ? JSON.stringify(value) : value}`);
        error.code = 'VALIDATION_ERROR';
        error.field = field;
        error.value = value;
        error.expected = expected;
        return error;
    }
    /**
     * Throw validation errors if any exist
     */
    static throwIfInvalid(errors, context = 'Validation') {
        if (errors.length > 0) {
            const error = new Error(`${context} failed: ${errors.map(e => e.message).join('; ')}`);
            error.code = 'VALIDATION_ERROR';
            error.field = 'multiple';
            error.value = errors;
            error.expected = 'Valid input';
            throw error;
        }
    }
    /**
     * Sanitize string input
     */
    static sanitizeString(input, maxLength = 1000) {
        if (typeof input !== 'string') {
            return '';
        }
        return input
            .trim()
            .substring(0, maxLength)
            .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
    }
    /**
     * Sanitize object for JSON serialization
     */
    static sanitizeObject(obj, maxDepth = 10) {
        if (maxDepth <= 0) {
            return '[Max depth reached]';
        }
        if (obj === null || obj === undefined) {
            return obj;
        }
        if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.slice(0, 100).map(item => this.sanitizeObject(item, maxDepth - 1));
        }
        if (typeof obj === 'object') {
            const sanitized = {};
            let count = 0;
            for (const [key, value] of Object.entries(obj)) {
                if (count >= 100)
                    break; // Limit object size
                const cleanKey = this.sanitizeString(key, 100);
                sanitized[cleanKey] = this.sanitizeObject(value, maxDepth - 1);
                count++;
            }
            return sanitized;
        }
        return String(obj);
    }
}
// Export convenience functions
export const validateEntity = ValidationUtils.validateEntity;
export const validateRelation = ValidationUtils.validateRelation;
export const validateSearchOptions = ValidationUtils.validateSearchOptions;
export const validateSearchQuery = ValidationUtils.validateSearchQuery;
export const validateLogEntry = ValidationUtils.validateLogEntry;
export const validateLogFilters = ValidationUtils.validateLogFilters;
export const throwIfInvalid = ValidationUtils.throwIfInvalid;
//# sourceMappingURL=validation.js.map