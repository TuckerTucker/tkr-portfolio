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
const generateWithPrefix = (prefix: string, length: number = 8) => {
  return `${prefix}_${customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', length)()}`;
};

export class IdGenerator {
  /**
   * Generate a standard nanoid
   */
  static generate(length: number = 21): string {
    return generateStandardId(length);
  }

  /**
   * Generate an entity ID
   */
  static generateEntityId(): string {
    return entityAlphabet();
  }

  /**
   * Generate a relation ID
   */
  static generateRelationId(): string {
    return relationAlphabet();
  }

  /**
   * Generate a log entry ID
   */
  static generateLogId(): string {
    return logAlphabet();
  }

  /**
   * Generate an ID with a specific prefix
   */
  static generateWithPrefix(prefix: string, length: number = 8): string {
    return generateWithPrefix(prefix, length);
  }

  /**
   * Generate an entity ID with type prefix
   */
  static generateEntityIdWithType(entityType: string): string {
    const typePrefix = entityType.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 4);
    return this.generateWithPrefix(typePrefix, 8);
  }

  /**
   * Generate a relation ID with type prefix
   */
  static generateRelationIdWithType(relationType: string): string {
    const typePrefix = relationType.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 3);
    return this.generateWithPrefix(`r_${typePrefix}`, 6);
  }

  /**
   * Generate a search query ID for tracking
   */
  static generateQueryId(): string {
    return this.generateWithPrefix('q', 6);
  }

  /**
   * Generate a session ID
   */
  static generateSessionId(): string {
    return this.generateWithPrefix('sess', 12);
  }

  /**
   * Generate a request ID for logging correlation
   */
  static generateRequestId(): string {
    return this.generateWithPrefix('req', 8);
  }

  /**
   * Validate if a string looks like a nanoid
   */
  static isValidId(id: string): boolean {
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
  private static isValidNanoid(id: string): boolean {
    // Nanoid uses URL-safe characters: A-Za-z0-9_-
    const nanoidPattern = /^[A-Za-z0-9_-]+$/;
    return nanoidPattern.test(id) && id.length >= 6 && id.length <= 21;
  }

  /**
   * Extract type prefix from a prefixed ID
   */
  static extractPrefix(id: string): string | null {
    if (!id.includes('_')) {
      return null;
    }
    return id.split('_')[0];
  }

  /**
   * Extract the actual ID part from a prefixed ID
   */
  static extractId(id: string): string {
    if (!id.includes('_')) {
      return id;
    }
    return id.split('_')[1];
  }

  /**
   * Generate a batch of IDs
   */
  static generateBatch(count: number, generator: () => string = this.generate): string[] {
    const ids = new Set<string>();

    while (ids.size < count) {
      ids.add(generator());
    }

    return Array.from(ids);
  }

  /**
   * Generate unique entity IDs in batch
   */
  static generateEntityBatch(count: number, entityType?: string): string[] {
    if (entityType) {
      return this.generateBatch(count, () => this.generateEntityIdWithType(entityType));
    }
    return this.generateBatch(count, this.generateEntityId);
  }

  /**
   * Generate unique relation IDs in batch
   */
  static generateRelationBatch(count: number, relationType?: string): string[] {
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