/**
 * ID Generation Utilities
 * Nanoid-based unique ID generation for entities and relations
 */
import { nanoid, customAlphabet } from 'nanoid';
// Standard nanoid for general use
const generateStandardId = nanoid;
// Custom alphabets for different ID types
const entityAlphabet = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12);
const relationAlphabet = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);
const logAlphabet = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 16);
// Prefixed ID generators for better identification
const generateWithPrefix = (prefix, length = 8) => {
    return `${prefix}_${customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', length)()}`;
};
export class IdGenerator {
    /**
     * Generate a standard nanoid
     */
    static generate(length = 21) {
        return generateStandardId(length);
    }
    /**
     * Generate an entity ID
     */
    static generateEntityId() {
        return entityAlphabet();
    }
    /**
     * Generate a relation ID
     */
    static generateRelationId() {
        return relationAlphabet();
    }
    /**
     * Generate a log entry ID
     */
    static generateLogId() {
        return logAlphabet();
    }
    /**
     * Generate an ID with a specific prefix
     */
    static generateWithPrefix(prefix, length = 8) {
        return generateWithPrefix(prefix, length);
    }
    /**
     * Generate an entity ID with type prefix
     */
    static generateEntityIdWithType(entityType) {
        const typePrefix = entityType.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 4);
        return this.generateWithPrefix(typePrefix, 8);
    }
    /**
     * Generate a relation ID with type prefix
     */
    static generateRelationIdWithType(relationType) {
        const typePrefix = relationType.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 3);
        return this.generateWithPrefix(`r_${typePrefix}`, 6);
    }
    /**
     * Generate a search query ID for tracking
     */
    static generateQueryId() {
        return this.generateWithPrefix('q', 6);
    }
    /**
     * Generate a session ID
     */
    static generateSessionId() {
        return this.generateWithPrefix('sess', 12);
    }
    /**
     * Generate a request ID for logging correlation
     */
    static generateRequestId() {
        return this.generateWithPrefix('req', 8);
    }
    /**
     * Validate if a string looks like a nanoid
     */
    static isValidId(id) {
        if (!id || typeof id !== 'string') {
            return false;
        }
        // Check for prefixed IDs
        if (id.includes('_')) {
            const parts = id.split('_');
            if (parts.length !== 2) {
                return false;
            }
            // Validate the actual ID part
            return this.isValidNanoid(parts[1]);
        }
        // Validate regular nanoid
        return this.isValidNanoid(id);
    }
    /**
     * Validate if a string is a valid nanoid format
     */
    static isValidNanoid(id) {
        // Nanoid uses URL-safe characters: A-Za-z0-9_-
        const nanoidPattern = /^[A-Za-z0-9_-]+$/;
        return nanoidPattern.test(id) && id.length >= 6 && id.length <= 21;
    }
    /**
     * Extract type prefix from a prefixed ID
     */
    static extractPrefix(id) {
        if (!id.includes('_')) {
            return null;
        }
        return id.split('_')[0];
    }
    /**
     * Extract the actual ID part from a prefixed ID
     */
    static extractId(id) {
        if (!id.includes('_')) {
            return id;
        }
        return id.split('_')[1];
    }
    /**
     * Generate a batch of IDs
     */
    static generateBatch(count, generator = this.generate) {
        const ids = new Set();
        while (ids.size < count) {
            ids.add(generator());
        }
        return Array.from(ids);
    }
    /**
     * Generate unique entity IDs in batch
     */
    static generateEntityBatch(count, entityType) {
        if (entityType) {
            return this.generateBatch(count, () => this.generateEntityIdWithType(entityType));
        }
        return this.generateBatch(count, this.generateEntityId);
    }
    /**
     * Generate unique relation IDs in batch
     */
    static generateRelationBatch(count, relationType) {
        if (relationType) {
            return this.generateBatch(count, () => this.generateRelationIdWithType(relationType));
        }
        return this.generateBatch(count, this.generateRelationId);
    }
}
// Export convenience functions
export const generateEntityId = IdGenerator.generateEntityId;
export const generateRelationId = IdGenerator.generateRelationId;
export const generateLogId = IdGenerator.generateLogId;
export const generateId = IdGenerator.generate;
export const isValidId = IdGenerator.isValidId;
//# sourceMappingURL=id-generator.js.map