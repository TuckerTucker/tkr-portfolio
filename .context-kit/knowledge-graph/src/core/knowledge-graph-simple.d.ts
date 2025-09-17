import { Entity, Relation, SearchResult } from './types.js';
export interface AppStateKGConfig {
    databasePath: string;
    enableMCP?: boolean;
    projectRoot?: string;
}
export declare class AppStateKGSimple {
    private db;
    config: AppStateKGConfig;
    constructor(config: AppStateKGConfig);
    createEntity(type: string, name: string, data: Record<string, any>): Entity;
    createRelation(fromId: string, toId: string, type: string, properties?: Record<string, any>): Relation;
    searchEntities(query: string, limit?: number): SearchResult[];
    getStats(): {
        entities: number;
        relations: number;
        observations: number;
        logEntries: number;
        logSources: number;
    };
    getEntityByName(type: string, name: string): Entity | null;
    query(sql: string, params?: any[]): any[];
    run(sql: string, params?: any[]): any;
    findUnusedEntities(entityType: string): Array<{
        name: string;
        location?: string;
    }>;
    findStateMutations(storeName: string): any[];
    traceWorkflow(workflowName: string): any;
    traceUserFlow(interaction: string): any;
    analyzeImpact(entityName: string, changeType?: string): any;
    analyzeImpactWithPaths(entityName: string, maxDepth?: number): any;
    findSimilarPatterns(componentName: string): any[];
    generateFromPattern(spec: any): any;
    validateWorkflow(workflowName: string): any;
    search(query: string): any[];
    getAllEntities(): Entity[];
    getAllRelations(): Relation[];
    getComponentDependencies(componentName: string): any;
    analyzeStatePatterns(): any[];
    generateTestScenarios(componentName: string): any[];
    close(): void;
}
//# sourceMappingURL=knowledge-graph-simple.d.ts.map