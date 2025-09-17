import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

export class KGDatabase {
  private db: Database.Database;
  private statements: Map<string, Database.Statement>;

  constructor(dbPath: string = 'appstate.db') {
    this.db = new Database(dbPath);
    this.statements = new Map();
    this.initialize();
  }

  private initialize() {
    // Enable WAL mode for better concurrent access
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    
    // Load and execute schema
    const schemaPath = join(__dirname, '../../schemas/appstate-schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    this.db.exec(schema);
    
    // Prepare common statements
    this.prepareStatements();
  }

  private prepareStatements() {
    this.statements.set('createEntity', this.db.prepare(`
      INSERT INTO entities (id, type, name, data) 
      VALUES (?, ?, ?, json(?))
    `));

    this.statements.set('updateEntity', this.db.prepare(`
      UPDATE entities 
      SET name = ?, data = json(?), updated_at = unixepoch(), version = version + 1
      WHERE id = ?
    `));

    this.statements.set('getEntity', this.db.prepare(`
      SELECT * FROM entities WHERE id = ?
    `));

    this.statements.set('getEntityByName', this.db.prepare(`
      SELECT * FROM entities WHERE type = ? AND name = ?
    `));

    this.statements.set('deleteEntity', this.db.prepare(`
      DELETE FROM entities WHERE id = ?
    `));

    this.statements.set('createRelation', this.db.prepare(`
      INSERT INTO relations (id, from_id, to_id, type, properties)
      VALUES (?, ?, ?, ?, json(?))
    `));

    this.statements.set('deleteRelation', this.db.prepare(`
      DELETE FROM relations WHERE id = ?
    `));

    this.statements.set('getRelationsByEntity', this.db.prepare(`
      SELECT * FROM relations 
      WHERE from_id = ? OR to_id = ?
    `));

    this.statements.set('addObservation', this.db.prepare(`
      INSERT INTO observations (entity_id, key, value) 
      VALUES (?, ?, ?)
    `));

    this.statements.set('getObservations', this.db.prepare(`
      SELECT * FROM observations WHERE entity_id = ?
    `));

    this.statements.set('deleteObservations', this.db.prepare(`
      DELETE FROM observations WHERE entity_id = ?
    `));

    this.statements.set('searchEntities', this.db.prepare(`
      SELECT 
        e.id, e.type, e.name, e.data,
        snippet(observations_fts, 2, '[', ']', '...', 30) as match
      FROM entities e
      JOIN observations_fts fts ON e.id = fts.entity_id
      WHERE observations_fts MATCH ?
      ORDER BY rank
      LIMIT ?
    `));

    this.statements.set('findMutations', this.db.prepare(`
      SELECT * FROM state_mutations WHERE store = ?
    `));

    this.statements.set('traceWorkflow', this.db.prepare(`
      WITH RECURSIVE workflow_trace AS (
        SELECT 
          e.id, e.name, e.type, e.data,
          0 as depth, 
          e.id as path
        FROM entities e
        WHERE e.type = 'Workflow' AND e.name = ?
        
        UNION ALL
        
        SELECT 
          e2.id, e2.name, e2.type, e2.data,
          wt.depth + 1,
          wt.path || ' -> ' || e2.id
        FROM workflow_trace wt
        JOIN relations r ON wt.id = r.from_id
        JOIN entities e2 ON r.to_id = e2.id
        WHERE wt.depth < 10
          AND r.type IN ('HAS_PHASE', 'TRIGGERS', 'MUTATES')
      )
      SELECT * FROM workflow_trace ORDER BY depth, path
    `));

    this.statements.set('analyzeImpact', this.db.prepare(`
      SELECT 
        e2.name as impacted_entity,
        e2.type as entity_type,
        r.type as relation_type
      FROM entities e1
      JOIN relations r ON e1.id = r.from_id
      JOIN entities e2 ON r.to_id = e2.id
      WHERE e1.name = ?
    `));

    this.statements.set('analyzeIndirectImpact', this.db.prepare(`
      WITH RECURSIVE impact_tree AS (
        SELECT e.id, e.name, e.type, 0 as level
        FROM entities e WHERE e.name = ?
        
        UNION ALL
        
        SELECT e2.id, e2.name, e2.type, it.level + 1
        FROM impact_tree it
        JOIN relations r ON it.id = r.from_id
        JOIN entities e2 ON r.to_id = e2.id
        WHERE it.level < 3
      )
      SELECT DISTINCT name, type, level 
      FROM impact_tree 
      WHERE level > 0
      ORDER BY level
    `));
  }

  getStatement(name: string): Database.Statement {
    const statement = this.statements.get(name);
    if (!statement) {
      throw new Error(`Statement '${name}' not found`);
    }
    return statement;
  }

  query(sql: string, params: any[] = []): any[] {
    return this.db.prepare(sql).all(...params);
  }

  execute(sql: string, params: any[] = []): Database.RunResult {
    return this.db.prepare(sql).run(...params);
  }

  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)();
  }

  close() {
    this.db.close();
  }

  backup(backupPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.backup(backupPath)
        .then(() => resolve())
        .catch(reject);
    });
  }

  getStats() {
    const entityCount = this.db.prepare('SELECT COUNT(*) as count FROM entities').get() as { count: number };
    const relationCount = this.db.prepare('SELECT COUNT(*) as count FROM relations').get() as { count: number };
    const observationCount = this.db.prepare('SELECT COUNT(*) as count FROM observations').get() as { count: number };
    
    return {
      entities: entityCount.count,
      relations: relationCount.count,
      observations: observationCount.count
    };
  }
}