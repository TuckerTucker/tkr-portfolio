/**
 * ID Generation Utilities
 * Nanoid-based unique ID generation for entities and relations
 */
export declare class IdGenerator {
    /**
     * Generate a standard nanoid
     */
    static generate(length?: number): string;
    /**
     * Generate an entity ID
     */
    static generateEntityId(): string;
    /**
     * Generate a relation ID
     */
    static generateRelationId(): string;
    /**
     * Generate a log entry ID
     */
    static generateLogId(): string;
    /**
     * Generate an ID with a specific prefix
     */
    static generateWithPrefix(prefix: string, length?: number): string;
    /**
     * Generate an entity ID with type prefix
     */
    static generateEntityIdWithType(entityType: string): string;
    /**
     * Generate a relation ID with type prefix
     */
    static generateRelationIdWithType(relationType: string): string;
    /**
     * Generate a search query ID for tracking
     */
    static generateQueryId(): string;
    /**
     * Generate a session ID
     */
    static generateSessionId(): string;
    /**
     * Generate a request ID for logging correlation
     */
    static generateRequestId(): string;
    /**
     * Validate if a string looks like a nanoid
     */
    static isValidId(id: string): boolean;
    /**
     * Validate if a string is a valid nanoid format
     */
    private static isValidNanoid;
    /**
     * Extract type prefix from a prefixed ID
     */
    static extractPrefix(id: string): string | null;
    /**
     * Extract the actual ID part from a prefixed ID
     */
    static extractId(id: string): string;
    /**
     * Generate a batch of IDs
     */
    static generateBatch(count: number, generator?: () => string): string[];
    /**
     * Generate unique entity IDs in batch
     */
    static generateEntityBatch(count: number, entityType?: string): string[];
    /**
     * Generate unique relation IDs in batch
     */
    static generateRelationBatch(count: number, relationType?: string): string[];
}
export declare const generateEntityId: typeof IdGenerator.generateEntityId;
export declare const generateRelationId: typeof IdGenerator.generateRelationId;
export declare const generateLogId: typeof IdGenerator.generateLogId;
export declare const generateId: typeof IdGenerator.generate;
export declare const isValidId: typeof IdGenerator.isValidId;
//# sourceMappingURL=id-generator.d.ts.map