/**
 * Input Validation Utilities
 * Comprehensive validation for entities, relations, and search queries
 */
import type { Entity, Relation, SearchOptions, LogEntry, LogFilters, ValidationError } from '../types/index.js';
export declare class ValidationUtils {
    /**
     * Validate entity data
     */
    static validateEntity(entity: Partial<Entity>): ValidationError[];
    /**
     * Validate relation data
     */
    static validateRelation(relation: Partial<Relation>): ValidationError[];
    /**
     * Validate search options
     */
    static validateSearchOptions(options: SearchOptions): ValidationError[];
    /**
     * Validate search query string
     */
    static validateSearchQuery(query: string): ValidationError[];
    /**
     * Validate log entry
     */
    static validateLogEntry(entry: Partial<LogEntry>): ValidationError[];
    /**
     * Validate log filters
     */
    static validateLogFilters(filters: LogFilters): ValidationError[];
    /**
     * Create a validation error
     */
    private static createValidationError;
    /**
     * Throw validation errors if any exist
     */
    static throwIfInvalid(errors: ValidationError[], context?: string): void;
    /**
     * Sanitize string input
     */
    static sanitizeString(input: string, maxLength?: number): string;
    /**
     * Sanitize object for JSON serialization
     */
    static sanitizeObject(obj: any, maxDepth?: number): any;
}
export declare const validateEntity: typeof ValidationUtils.validateEntity;
export declare const validateRelation: typeof ValidationUtils.validateRelation;
export declare const validateSearchOptions: typeof ValidationUtils.validateSearchOptions;
export declare const validateSearchQuery: typeof ValidationUtils.validateSearchQuery;
export declare const validateLogEntry: typeof ValidationUtils.validateLogEntry;
export declare const validateLogFilters: typeof ValidationUtils.validateLogFilters;
export declare const throwIfInvalid: typeof ValidationUtils.throwIfInvalid;
//# sourceMappingURL=validation.d.ts.map