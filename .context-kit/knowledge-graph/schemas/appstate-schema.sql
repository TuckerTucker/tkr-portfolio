-- Knowledge Graph Database Schema
-- Optimized for app state management and AI agent queries

-- Core entity storage with JSONB for flexibility
CREATE TABLE entities (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  version INTEGER DEFAULT 1
);

-- Relations with properties
CREATE TABLE relations (
  id TEXT PRIMARY KEY,
  from_id TEXT NOT NULL,
  to_id TEXT NOT NULL,
  type TEXT NOT NULL,
  properties JSONB,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (from_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY (to_id) REFERENCES entities(id) ON DELETE CASCADE
);

-- Observations as separate table for better querying
CREATE TABLE observations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
);

-- Optimized indexes for our use cases
CREATE INDEX idx_entities_type ON entities(type);
CREATE INDEX idx_entities_name ON entities(name);
CREATE INDEX idx_entities_type_name ON entities(type, name);
CREATE INDEX idx_relations_from ON relations(from_id);
CREATE INDEX idx_relations_to ON relations(to_id);
CREATE INDEX idx_relations_type ON relations(type);
CREATE INDEX idx_relations_from_type ON relations(from_id, type);
CREATE INDEX idx_observations_entity ON observations(entity_id);
CREATE INDEX idx_observations_key ON observations(entity_id, key);

-- Full-text search on observations
CREATE VIRTUAL TABLE observations_fts USING fts5(
  entity_id, 
  key, 
  value, 
  content=observations
);

-- Triggers to keep FTS in sync
CREATE TRIGGER observations_ai AFTER INSERT ON observations BEGIN
  INSERT INTO observations_fts(entity_id, key, value) 
  VALUES (new.entity_id, new.key, new.value);
END;

CREATE TRIGGER observations_au AFTER UPDATE ON observations BEGIN
  UPDATE observations_fts 
  SET key = new.key, value = new.value 
  WHERE entity_id = new.entity_id AND rowid = new.rowid;
END;

CREATE TRIGGER observations_ad AFTER DELETE ON observations BEGIN
  DELETE FROM observations_fts WHERE entity_id = old.entity_id AND rowid = old.rowid;
END;

-- Views for common queries
CREATE VIEW entity_details AS
SELECT 
  e.id,
  e.type,
  e.name,
  e.data,
  GROUP_CONCAT(o.key || ':' || o.value, '; ') as observations
FROM entities e
LEFT JOIN observations o ON e.id = o.entity_id
GROUP BY e.id;

-- State mutations view for app state tracking
CREATE VIEW state_mutations AS
SELECT 
  a.name as action,
  a.data->>'$.trigger' as trigger,
  s.name as store,
  r.properties->>'$.changes' as changes
FROM entities a
JOIN relations r ON a.id = r.from_id AND r.type = 'MUTATES'
JOIN entities s ON r.to_id = s.id
WHERE a.type = 'Action' AND s.type = 'Store';

-- Component relationships view
CREATE VIEW component_relationships AS
SELECT 
  c1.name as component,
  r.type as relationship_type,
  c2.name as related_component,
  r.properties
FROM entities c1
JOIN relations r ON c1.id = r.from_id
JOIN entities c2 ON r.to_id = c2.id
WHERE c1.type = 'Component' AND c2.type = 'Component';

-- Workflow trace view for complex flows
CREATE VIEW workflow_flows AS
SELECT 
  w.name as workflow,
  p.name as phase,
  a.name as action,
  a.data->>'$.trigger' as trigger
FROM entities w
JOIN relations wr ON w.id = wr.from_id AND wr.type = 'HAS_PHASE'
JOIN entities p ON wr.to_id = p.id AND p.type = 'Phase'
JOIN relations pr ON p.id = pr.from_id AND pr.type = 'CONTAINS'
JOIN entities a ON pr.to_id = a.id AND a.type = 'Action'
WHERE w.type = 'Workflow';