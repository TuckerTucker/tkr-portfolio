/**
 * Database types and interfaces for tkr-context-kit v2.0
 * Unified types for entities, relations, logs, and search
 */
// Error types
export class DatabaseError extends Error {
    code;
    originalError;
    constructor(message, code, originalError) {
        super(message);
        this.code = code;
        this.originalError = originalError;
        this.name = 'DatabaseError';
    }
}
export class TransactionError extends DatabaseError {
    constructor(message, originalError) {
        super(message, 'TRANSACTION_ERROR', originalError);
        this.name = 'TransactionError';
    }
}
export class ConnectionError extends DatabaseError {
    constructor(message, originalError) {
        super(message, 'CONNECTION_ERROR', originalError);
        this.name = 'ConnectionError';
    }
}
export class SchemaError extends DatabaseError {
    constructor(message, originalError) {
        super(message, 'SCHEMA_ERROR', originalError);
        this.name = 'SchemaError';
    }
}
//# sourceMappingURL=types.js.map