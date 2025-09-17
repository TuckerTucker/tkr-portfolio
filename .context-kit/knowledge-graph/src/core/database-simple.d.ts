import Database from 'better-sqlite3';
export declare class KGDatabaseSimple {
    private db;
    private statements;
    constructor(dbPath?: string);
    private initialize;
    private initializeLoggingTables;
    private prepareStatements;
    getStatement(name: string): Database.Statement;
    transaction<T>(fn: () => T): T;
    getStats(): {
        entities: number;
        relations: number;
        observations: number;
        logEntries: number;
        logSources: number;
    };
    prepare(sql: string): any;
    close(): void;
}
//# sourceMappingURL=database-simple.d.ts.map