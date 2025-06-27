#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import minimist from 'minimist';
import { isAbsolute } from 'path';

// Security: Validate and sanitize memory path to prevent path traversal attacks
function validateMemoryPath(inputPath: string | undefined): string {
  if (!inputPath) {
    // Default to safe location within the installation directory
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    return path.join(__dirname, 'memory.jsonl');
  }

  // Resolve the provided path to absolute form
  const resolvedPath = path.resolve(inputPath);
  
  // Define allowed directories for memory storage
  const allowedDirs = [
    path.resolve(process.env.HOME || '/tmp', '.claude-memory'),
    path.resolve(process.cwd(), 'memory'),
    path.dirname(fileURLToPath(import.meta.url)) // Installation directory
  ];

  // Check if the resolved path is within any allowed directory
  const isAllowed = allowedDirs.some(allowedDir => {
    try {
      const relativePath = path.relative(allowedDir, resolvedPath);
      return !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
    } catch {
      return false;
    }
  });

  if (!isAllowed) {
    throw new Error(
      `Memory path must be within allowed directories: ${allowedDirs.join(', ')}. ` +
      `Provided path resolves to: ${resolvedPath}`
    );
  }

  return resolvedPath;
}

// Parse args and validate memory path
const argv = minimist(process.argv.slice(2));
const MEMORY_FILE_PATH = validateMemoryPath(argv['memory-path']);

// We are storing our memory using entities, relations, and observations in a graph structure
interface Entity {
  name: string;
  entityType: string;
  observations: string[];
}

interface Relation {
  from: string;
  to: string;
  relationType: string;
}

interface KnowledgeGraph {
  entities: Entity[];
  relations: Relation[];
}

// Security: JSON validation functions to prevent injection attacks
function isValidEntity(obj: any): obj is Entity {
  return obj && 
         typeof obj === 'object' &&
         typeof obj.name === 'string' &&
         typeof obj.entityType === 'string' &&
         Array.isArray(obj.observations) &&
         obj.observations.every((obs: any) => typeof obs === 'string') &&
         obj.name.length > 0 && obj.name.length <= 200 &&
         obj.entityType.length > 0 && obj.entityType.length <= 100 &&
         obj.observations.length <= 1000 &&
         obj.observations.every((obs: string) => obs.length <= 5000);
}

function isValidRelation(obj: any): obj is Relation {
  return obj &&
         typeof obj === 'object' &&
         typeof obj.from === 'string' &&
         typeof obj.to === 'string' &&
         typeof obj.relationType === 'string' &&
         obj.from.length > 0 && obj.from.length <= 200 &&
         obj.to.length > 0 && obj.to.length <= 200 &&
         obj.relationType.length > 0 && obj.relationType.length <= 100;
}

function isValidKnowledgeGraphItem(obj: any): boolean {
  if (!obj || typeof obj !== 'object' || !obj.type) {
    return false;
  }
  
  if (obj.type === 'entity') {
    const { type, ...entityData } = obj;
    return isValidEntity(entityData);
  }
  
  if (obj.type === 'relation') {
    const { type, ...relationData } = obj;
    return isValidRelation(relationData);
  }
  
  return false;
}

function parseJsonSafely(jsonString: string): any {
  try {
    // Basic length check to prevent extremely large payloads
    if (jsonString.length > 100000) {
      throw new Error('JSON payload too large');
    }
    
    const parsed = JSON.parse(jsonString);
    
    // Prevent deeply nested objects that could cause stack overflow
    const maxDepth = 10;
    function checkDepth(obj: any, depth = 0): boolean {
      if (depth > maxDepth) return false;
      if (obj && typeof obj === 'object') {
        for (const key in obj) {
          if (!checkDepth(obj[key], depth + 1)) return false;
        }
      }
      return true;
    }
    
    if (!checkDepth(parsed)) {
      throw new Error('JSON object too deeply nested');
    }
    
    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format');
    }
    throw error;
  }
}

// The KnowledgeGraphManager class contains all operations to interact with the knowledge graph
class KnowledgeGraphManager {
  private async loadGraph(): Promise<KnowledgeGraph> {
    try {
      const data = await fs.readFile(MEMORY_FILE_PATH, "utf-8");
      const lines = data.split("\n").filter(line => line.trim() !== "");
      
      return lines.reduce((graph: KnowledgeGraph, line, lineNumber) => {
        try {
          const item = parseJsonSafely(line);
          
          if (!isValidKnowledgeGraphItem(item)) {
            console.warn(`Invalid knowledge graph item on line ${lineNumber + 1}, skipping:`, line.substring(0, 100));
            return graph;
          }
          
          if (item.type === "entity") {
            const { type, ...entityData } = item;
            graph.entities.push(entityData as Entity);
          } else if (item.type === "relation") {
            const { type, ...relationData } = item;
            graph.relations.push(relationData as Relation);
          }
          
          return graph;
        } catch (parseError) {
          console.warn(`Malformed JSON on line ${lineNumber + 1}, skipping:`, parseError instanceof Error ? parseError.message : 'Unknown error');
          return graph;
        }
      }, { entities: [], relations: [] });
    } catch (error) {
      if (error instanceof Error && 'code' in error && (error as any).code === "ENOENT") {
        return { entities: [], relations: [] };
      }
      throw error;
    }
  }

  private async saveGraph(graph: KnowledgeGraph): Promise<void> {
    const lines = [
      ...graph.entities.map(e => JSON.stringify({ type: "entity", ...e })),
      ...graph.relations.map(r => JSON.stringify({ type: "relation", ...r })),
    ];
    await fs.writeFile(MEMORY_FILE_PATH, lines.join("\n"));
  }

  async createEntities(entities: Entity[]): Promise<Entity[]> {
    const graph = await this.loadGraph();
    const newEntities = entities.filter(e => !graph.entities.some(existingEntity => existingEntity.name === e.name));
    graph.entities.push(...newEntities);
    await this.saveGraph(graph);
    return newEntities;
  }

  async createRelations(relations: Relation[]): Promise<Relation[]> {
    const graph = await this.loadGraph();
    const newRelations = relations.filter(r => !graph.relations.some(existingRelation =>
      existingRelation.from === r.from &&
      existingRelation.to === r.to &&
      existingRelation.relationType === r.relationType
    ));
    graph.relations.push(...newRelations);
    await this.saveGraph(graph);
    return newRelations;
  }

  async addObservations(observations: { entityName: string; contents: string[] }[]): Promise<{ entityName: string; addedObservations: string[] }[]> {
    const graph = await this.loadGraph();
    const results = observations.map(o => {
      const entity = graph.entities.find(e => e.name === o.entityName);
      if (!entity) {
        throw new Error(`Entity with name ${o.entityName} not found`);
      }
      const newObservations = o.contents.filter(content => !entity.observations.includes(content));
      entity.observations.push(...newObservations);
      return { entityName: o.entityName, addedObservations: newObservations };
    });
    await this.saveGraph(graph);
    return results;
  }

  async deleteEntities(entityNames: string[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.entities = graph.entities.filter(e => !entityNames.includes(e.name));
    graph.relations = graph.relations.filter(r => !entityNames.includes(r.from) && !entityNames.includes(r.to));
    await this.saveGraph(graph);
  }

  async deleteObservations(deletions: { entityName: string; observations: string[] }[]): Promise<void> {
    const graph = await this.loadGraph();
    deletions.forEach(d => {
      const entity = graph.entities.find(e => e.name === d.entityName);
      if (entity) {
        entity.observations = entity.observations.filter(o => !d.observations.includes(o));
      }
    });
    await this.saveGraph(graph);
  }

  async deleteRelations(relations: Relation[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.relations = graph.relations.filter(r => !relations.some(delRelation =>
      r.from === delRelation.from &&
      r.to === delRelation.to &&
      r.relationType === delRelation.relationType
    ));
    await this.saveGraph(graph);
  }

  async readGraph(): Promise<KnowledgeGraph> {
    return this.loadGraph();
  }

  // Very basic search function
  async searchNodes(query: string): Promise<KnowledgeGraph> {
    const graph = await this.loadGraph();

    // Filter entities
    const filteredEntities = graph.entities.filter(e =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.entityType.toLowerCase().includes(query.toLowerCase()) ||
      e.observations.some(o => o.toLowerCase().includes(query.toLowerCase()))
    );

    // Create a Set of filtered entity names for quick lookup
    const filteredEntityNames = new Set(filteredEntities.map(e => e.name));

    // Filter relations to only include those between filtered entities
    const filteredRelations = graph.relations.filter(r =>
      filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
    );

    const filteredGraph: KnowledgeGraph = {
      entities: filteredEntities,
      relations: filteredRelations,
    };

    return filteredGraph;
  }

  async openNodes(names: string[]): Promise<KnowledgeGraph> {
    const graph = await this.loadGraph();

    // Filter entities
    const filteredEntities = graph.entities.filter(e => names.includes(e.name));

    // Create a Set of filtered entity names for quick lookup
    const filteredEntityNames = new Set(filteredEntities.map(e => e.name));

    // Filter relations to only include those between filtered entities
    const filteredRelations = graph.relations.filter(r =>
      filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
    );

    const filteredGraph: KnowledgeGraph = {
      entities: filteredEntities,
      relations: filteredRelations,
    };

    return filteredGraph;
  }

  async generateVisualization(layout: string = 'cose-bilkent', filter: string = ''): Promise<string> {
    const graph = await this.loadGraph();
    
    // Filter graph if filter is provided
    let filteredGraph = graph;
    if (filter) {
      filteredGraph = {
        entities: graph.entities.filter(e => e.entityType === filter),
        relations: graph.relations.filter(r => 
          graph.entities.some(e => e.name === r.from && e.entityType === filter) &&
          graph.entities.some(e => e.name === r.to && e.entityType === filter)
        )
      };
    }

    // Read HTML template
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const templatePath = path.join(__dirname, 'visualization-template.html');
    let htmlTemplate = await fs.readFile(templatePath, 'utf-8');
    
    // Replace placeholder with actual graph data
    htmlTemplate = htmlTemplate.replace('{{GRAPH_DATA}}', JSON.stringify(filteredGraph));
    
    // Generate unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = path.join(__dirname, `visualization-${timestamp}.html`);
    
    // Write visualization file
    await fs.writeFile(outputPath, htmlTemplate);
    
    return outputPath;
  }
}

const knowledgeGraphManager = new KnowledgeGraphManager();


// The server instance and tools exposed to AI models
const server = new Server({
  name: "mcp-knowledge-graph",
  version: "1.0.1",
}, {
  capabilities: {
    tools: {},
  },
});

(server as any).setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_entities",
        description: "Create multiple new entities in the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            entities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "The name of the entity" },
                  entityType: { type: "string", description: "The type of the entity" },
                  observations: {
                    type: "array",
                    items: { type: "string" },
                    description: "An array of observation contents associated with the entity"
                  },
                },
                required: ["name", "entityType", "observations"],
              },
            },
          },
          required: ["entities"],
        },
      },
      {
        name: "create_relations",
        description: "Create multiple new relations between entities in the knowledge graph. Relations should be in active voice",
        inputSchema: {
          type: "object",
          properties: {
            relations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  from: { type: "string", description: "The name of the entity where the relation starts" },
                  to: { type: "string", description: "The name of the entity where the relation ends" },
                  relationType: { type: "string", description: "The type of the relation" },
                },
                required: ["from", "to", "relationType"],
              },
            },
          },
          required: ["relations"],
        },
      },
      {
        name: "add_observations",
        description: "Add new observations to existing entities in the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            observations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  entityName: { type: "string", description: "The name of the entity to add the observations to" },
                  contents: {
                    type: "array",
                    items: { type: "string" },
                    description: "An array of observation contents to add"
                  },
                },
                required: ["entityName", "contents"],
              },
            },
          },
          required: ["observations"],
        },
      },
      {
        name: "delete_entities",
        description: "Delete multiple entities and their associated relations from the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            entityNames: {
              type: "array",
              items: { type: "string" },
              description: "An array of entity names to delete"
            },
          },
          required: ["entityNames"],
        },
      },
      {
        name: "delete_observations",
        description: "Delete specific observations from entities in the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            deletions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  entityName: { type: "string", description: "The name of the entity containing the observations" },
                  observations: {
                    type: "array",
                    items: { type: "string" },
                    description: "An array of observations to delete"
                  },
                },
                required: ["entityName", "observations"],
              },
            },
          },
          required: ["deletions"],
        },
      },
      {
        name: "delete_relations",
        description: "Delete multiple relations from the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            relations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  from: { type: "string", description: "The name of the entity where the relation starts" },
                  to: { type: "string", description: "The name of the entity where the relation ends" },
                  relationType: { type: "string", description: "The type of the relation" },
                },
                required: ["from", "to", "relationType"],
              },
              description: "An array of relations to delete"
            },
          },
          required: ["relations"],
        },
      },
      {
        name: "read_graph",
        description: "Read the entire knowledge graph",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "search_nodes",
        description: "Search for nodes in the knowledge graph based on a query",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "The search query to match against entity names, types, and observation content" },
          },
          required: ["query"],
        },
      },
      {
        name: "open_nodes",
        description: "Open specific nodes in the knowledge graph by their names",
        inputSchema: {
          type: "object",
          properties: {
            names: {
              type: "array",
              items: { type: "string" },
              description: "An array of entity names to retrieve",
            },
          },
          required: ["names"],
        },
      },
      {
        name: "visualize_graph",
        description: "Generate an interactive HTML visualization of the knowledge graph using Cytoscape.js",
        inputSchema: {
          type: "object",
          properties: {
            layout: {
              type: "string",
              enum: ["cose-bilkent", "cose", "circle", "grid", "breadthfirst", "concentric"],
              description: "Layout algorithm for the graph visualization",
              default: "cose-bilkent"
            },
            filter: {
              type: "string",
              description: "Filter by entity type (e.g., 'software_component', 'technical_debt'). Leave empty for all entities."
            }
          }
        },
      },
    ],
  };
});

(server as any).setRequestHandler(CallToolRequestSchema, async (request: any) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error(`No arguments provided for tool: ${name}`);
  }

  switch (name) {
    case "create_entities":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.createEntities(args.entities as Entity[]), null, 2) }] };
    case "create_relations":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.createRelations(args.relations as Relation[]), null, 2) }] };
    case "add_observations":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.addObservations(args.observations as { entityName: string; contents: string[] }[]), null, 2) }] };
    case "delete_entities":
      await knowledgeGraphManager.deleteEntities(args.entityNames as string[]);
      return { content: [{ type: "text", text: "Entities deleted successfully" }] };
    case "delete_observations":
      await knowledgeGraphManager.deleteObservations(args.deletions as { entityName: string; observations: string[] }[]);
      return { content: [{ type: "text", text: "Observations deleted successfully" }] };
    case "delete_relations":
      await knowledgeGraphManager.deleteRelations(args.relations as Relation[]);
      return { content: [{ type: "text", text: "Relations deleted successfully" }] };
    case "read_graph":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.readGraph(), null, 2) }] };
    case "search_nodes":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.searchNodes(args.query as string), null, 2) }] };
    case "open_nodes":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.openNodes(args.names as string[]), null, 2) }] };
    case "visualize_graph":
      const visualizationPath = await knowledgeGraphManager.generateVisualization(args.layout as string, args.filter as string);
      return { 
        content: [{ 
          type: "text", 
          text: `Interactive visualization generated successfully!\n\nFile: ${visualizationPath}\n\nOpen this HTML file in your web browser to explore the knowledge graph.\n\nFeatures:\n- Interactive zoom, pan, and selection\n- Click nodes to view observations\n- Filter by entity type\n- Export as PNG or SVG\n- Multiple layout algorithms` 
        }] 
      };
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await (server as any).connect(transport);
  console.error("Knowledge Graph MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
