import { KGDatabaseSimple } from './database-simple.js';
import { nanoid } from 'nanoid';
export class AppStateKGSimple {
    db;
    config;
    constructor(config) {
        this.config = {
            databasePath: config.databasePath,
            enableMCP: config.enableMCP ?? true
        };
        this.db = new KGDatabaseSimple(this.config.databasePath);
    }
    // Basic Entity Management
    createEntity(type, name, data) {
        const id = `${type.toLowerCase()}_${nanoid(10)}`;
        return this.db.transaction(() => {
            this.db.getStatement('createEntity').run(id, type, name, JSON.stringify(data));
            return {
                id,
                type,
                name,
                data,
                created_at: Date.now(),
                updated_at: Date.now(),
                version: 1
            };
        });
    }
    // Basic Relation Management
    createRelation(fromId, toId, type, properties) {
        const id = `rel_${nanoid(10)}`;
        return this.db.transaction(() => {
            this.db.getStatement('createRelation').run(id, fromId, toId, type, JSON.stringify(properties || {}));
            return {
                id,
                from_id: fromId,
                to_id: toId,
                type,
                properties: properties || {},
                created_at: Date.now()
            };
        });
    }
    // Basic Search
    searchEntities(query, limit = 50) {
        const results = this.db.getStatement('searchEntities').all(query, limit);
        return results.map(row => ({
            id: row.id,
            type: row.type,
            name: row.name,
            data: JSON.parse(row.data || '{}'),
            match: row.match || query,
            rank: row.score || 0
        }));
    }
    // Get Statistics
    getStats() {
        return this.db.getStats();
    }
    // Additional methods needed by analyzers
    getEntityByName(type, name) {
        const stmt = this.db.prepare('SELECT * FROM entities WHERE type = ? AND name = ?');
        const result = stmt.get(type, name);
        if (!result)
            return null;
        return {
            id: result.id,
            type: result.type,
            name: result.name,
            data: JSON.parse(result.data),
            created_at: result.created_at,
            updated_at: result.updated_at,
            version: result.version
        };
    }
    query(sql, params = []) {
        const stmt = this.db.prepare(sql);
        return stmt.all(...params);
    }
    run(sql, params = []) {
        const stmt = this.db.prepare(sql);
        return stmt.run(...params);
    }
    // Placeholder methods for analyzer compatibility
    findUnusedEntities(entityType) {
        // TODO: Implement actual unused entity detection
        return [];
    }
    // Additional MCP server methods (placeholders)
    findStateMutations(storeName) {
        return [];
    }
    traceWorkflow(workflowName) {
        return { workflow: null, phases: [] };
    }
    traceUserFlow(interaction) {
        return { flow: [], interactions: [] };
    }
    analyzeImpact(entityName, changeType) {
        return { entity: entityName, direct: [], indirect: [] };
    }
    analyzeImpactWithPaths(entityName, maxDepth) {
        return { entity: entityName, impacts: [], paths: [] };
    }
    findSimilarPatterns(componentName) {
        return [];
    }
    generateFromPattern(spec) {
        return { code: '', examples: [], rules: [] };
    }
    validateWorkflow(workflowName) {
        return { valid: true, errors: [] };
    }
    search(query) {
        return this.searchEntities(query);
    }
    // HTTP API methods
    getAllEntities() {
        const stmt = this.db.prepare('SELECT * FROM entities ORDER BY created_at DESC');
        const results = stmt.all();
        return results.map(row => ({
            id: row.id,
            type: row.type,
            name: row.name,
            data: JSON.parse(row.data || '{}'),
            created_at: row.created_at,
            updated_at: row.updated_at,
            version: row.version
        }));
    }
    getAllRelations() {
        const stmt = this.db.prepare('SELECT * FROM relations ORDER BY created_at DESC');
        const results = stmt.all();
        return results.map(row => ({
            id: row.id,
            from_id: row.from_id,
            to_id: row.to_id,
            type: row.type,
            properties: JSON.parse(row.properties || '{}'),
            created_at: row.created_at
        }));
    }
    getComponentDependencies(componentName) {
        return { component: componentName, dependencies: [], dependents: [] };
    }
    analyzeStatePatterns() {
        return [];
    }
    generateTestScenarios(componentName) {
        return [];
    }
    // Close database connection
    close() {
        this.db.close();
    }
}
//# sourceMappingURL=knowledge-graph-simple.js.map