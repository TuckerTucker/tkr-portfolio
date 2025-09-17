# Knowledge Graph for App State Management

A comprehensive knowledge graph system designed for AI-assisted development workflows, with specialized support for app state management, component analysis, and pattern recognition.

## Features

### 🧠 Core Knowledge Graph
- **SQLite-based storage** with JSONB flexibility
- **Full-text search** with FTS5 virtual tables
- **Optimized queries** for common app development patterns
- **Transactional operations** with prepared statements
- **Relationship mapping** between entities

### 🔍 Static Code Analysis
- **TypeScript/JavaScript parsing** with full AST analysis
- **React component detection** and prop extraction
- **State store analysis** (Zustand, Redux patterns)
- **API endpoint detection** and classification
- **Module dependency tracking**

### 📚 Storybook Integration
- **Story metadata extraction** from .stories files
- **Visual state documentation** from story args
- **Interaction pattern detection** from play functions
- **Documentation analysis** from MDX files
- **Pattern recognition** across story collections

### 🤖 MCP Server for AI Agents
- **16 specialized tools** for AI agent interaction
- **Domain-specific queries** for app state analysis
- **Code generation** from pattern templates
- **Impact analysis** for change planning
- **Workflow validation** and consistency checking

### 📊 Advanced Analytics
- **State mutation tracking** across stores
- **User flow tracing** through components
- **Component dependency graphs**
- **Test scenario generation**
- **Architectural pattern detection**

## Installation

```bash
cd .context-kit/knowledge-graph
npm install
```

## Quick Start

### 1. Basic Usage

```typescript
import { AppStateKG } from '@tkr-context-kit/knowledge-graph';

// Initialize knowledge graph
const kg = new AppStateKG({
  databasePath: './my-project.db',
  projectRoot: './src',
  enableFullTextSearch: true
});

// Create entities
const userStore = kg.createEntity('Store', 'UserStore', {
  location: 'src/stores/user.ts',
  technology: 'Zustand',
  observations: ['Manages authentication state', 'Persists to localStorage']
});

const loginForm = kg.createEntity('Component', 'LoginForm', {
  location: 'src/components/LoginForm.tsx',
  props: ['onSubmit', 'isLoading'],
  observations: ['Form validation with Zod', 'Accessible design']
});

// Create relationships
kg.createRelation(loginForm.id, userStore.id, 'USES', {
  methods: ['login', 'logout']
});

// Query state mutations
const mutations = kg.findStateMutations('UserStore');
console.log('State mutations:', mutations);
```

### 2. Project Analysis

```typescript
import { ProjectScanner } from '@tkr-context-kit/knowledge-graph';

const scanner = new ProjectScanner(kg);

// Comprehensive project scan
await scanner.scanProject({
  projectRoot: process.cwd(),
  patterns: ['**/*.ts', '**/*.tsx'],
  includeStorybook: true,
  includeTests: false
});

// Get insights
const patterns = kg.analyzeStatePatterns();
const dependencies = kg.getComponentDependencies('LoginForm');
const testScenarios = kg.generateTestScenarios('LoginForm');
```

### 3. MCP Server for AI Agents

```bash
# Start MCP server
npm run mcp-server

# Or with custom config
KG_DATABASE_PATH=./project.db KG_PROJECT_ROOT=./src npm run mcp-server
```

The MCP server provides these tools for AI agents:
- `analyze_project` - Perform static code analysis
- `analyze_storybook` - Extract patterns from Storybook
- `trace_workflow` - Trace execution paths
- `analyze_impact` - Assess change impact
- `generate_code` - Generate from patterns
- `search_entities` - Full-text search
- `get_stats` - Knowledge graph statistics

## Configuration

Create a `kg-config.json` file in your project root:

```json
{
  \"patterns\": [\"**/*.ts\", \"**/*.tsx\"],
  \"ignorePatterns\": [\"**/node_modules/**\", \"**/dist/**\"],
  \"includeTests\": false,
  \"includeStorybook\": true,
  \"storiesPattern\": \"**/*.stories.{ts,tsx}\",
  \"databasePath\": \"./knowledge-graph.db\",
  \"customEntityTypes\": [\"CustomComponent\"],
  \"analysisRules\": {
    \"detectPatterns\": true,
    \"validateWorkflows\": true
  }
}
```

## Logging Configuration

The knowledge graph system includes configurable logging for both the API server and Vite development server.

### Vite Development Server Log Levels

By default, the Vite dev server runs with minimal logging (`error` level) to reduce noise:

```bash
npm run dev:ui          # Default: error level only
npm run dev:ui:verbose  # Full Vite logging (info level)
npm run dev:ui:quiet    # Warnings and errors only
npm run dev:ui:silent   # No Vite logs
```

### Environment Variable Override

You can override the log level for any command:

```bash
VITE_LOG_LEVEL=warn npm run dev:ui     # Warnings and errors
VITE_LOG_LEVEL=silent npm run dev:ui   # No logs
VITE_LOG_LEVEL=info npm run dev:ui     # Full logging
```

### Available Log Levels

- `info` - All logs (default Vite behavior)
- `warn` - Warnings and errors only
- `error` - Errors only (default for tkr-context-kit)
- `silent` - No logs

### API Server Logging

The API server (`npm run serve`) uses structured logging and outputs to both console and the centralized logging system. View logs at `http://localhost:42001#logs`.

## Entity Types

The knowledge graph supports these entity types:

### Core Entities
- **Component** - React/UI components with props and state
- **Store** - State management stores (Zustand, Redux, etc.)
- **Action** - State mutations and user actions
- **API** - HTTP endpoints and external services
- **Workflow** - Multi-step user or system processes

### Documentation Entities
- **Story** - Storybook stories with args and interactions
- **StoryCollection** - Groups of related stories
- **VisualState** - Component visual states from stories
- **Documentation** - MDX docs and README files

### Analysis Entities
- **Pattern** - Recurring code or interaction patterns
- **UserInteraction** - User actions from story play functions
- **TestExpectation** - Assertions from story tests
- **Insight** - Generated analysis insights

### Meta Entities
- **Project** - Project-level metadata
- **Configuration** - Build and tool configurations
- **Module** - File-level entities for dependency tracking

## Relationship Types

- **USES** - Component uses store/service
- **MUTATES** - Action modifies store state
- **TRIGGERS** - User action triggers system action
- **CONTAINS** - Workflow contains phases/actions
- **DOCUMENTS** - Story documents component
- **DEMONSTRATES_STATE_OF** - Visual state shows component state
- **IMPLEMENTS** - Entity implements pattern
- **DEPENDS_ON** - Dependency relationship
- **IMPORTS** - Module import relationship

## Domain Queries

### State Management
```typescript
// Find all mutations for a store
const mutations = kg.findStateMutations('UserStore');

// Analyze state patterns across project
const patterns = kg.analyzeStatePatterns();

// Get component dependencies
const deps = kg.getComponentDependencies('LoginForm');
```

### Workflow Analysis
```typescript
// Trace user workflow
const flow = kg.traceUserFlow('LoginButton');

// Validate workflow consistency
const validation = kg.validateWorkflow('UserRegistration');

// Analyze change impact
const impact = kg.analyzeImpact('UserStore', 'modify');
```

### Pattern Recognition
```typescript
// Find similar patterns
const similar = kg.findSimilarPatterns('LoginForm');

// Generate test scenarios
const scenarios = kg.generateTestScenarios('LoginForm');

// Find code generation opportunities
const opportunities = kg.findGenerationOpportunities();
```

## Code Generation

Generate code from patterns:

```typescript
// Create a pattern template
kg.createEntity('Pattern', 'OptimisticUpdate', {
  template: `
const {{actionName}} = async ({{params}}) => {
  set{{stateManager}}(state => ({ ...state, loading: true }));
  try {
    const result = await {{apiCall}};
    set{{stateManager}}(state => ({ ...state, data: result, loading: false }));
  } catch (error) {
    set{{stateManager}}(state => ({ ...state, error, loading: false }));
  }
};`,
  rules: ['Include loading states', 'Handle errors', 'Use optimistic updates']
});

// Generate code from pattern
const generated = await kg.generateFromPattern({
  entityType: 'Action',
  pattern: 'OptimisticUpdate',
  actionName: 'updateProfile',
  stateManager: 'UserStore',
  params: 'profileData',
  apiCall: 'api.updateProfile(profileData)'
});

console.log(generated.code);
```

## Advanced Queries

Execute custom SQL queries:

```typescript
// Find components by framework
const reactComponents = kg.query(`
  SELECT name, data->>'$.props' as props
  FROM entities 
  WHERE type = 'Component' AND data->>'$.framework' = 'React'
`);

// Analyze test coverage
const coverage = kg.query(`
  SELECT 
    COUNT(DISTINCT c.id) as total_components,
    COUNT(DISTINCT t.to_id) as tested_components
  FROM entities c
  LEFT JOIN relations t ON c.id = t.to_id AND t.type = 'TESTED_IN'
  WHERE c.type = 'Component'
`);
```

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Examples

See `examples/usage-examples.ts` for comprehensive usage examples:

```bash
npm run build
node dist/examples/usage-examples.js
```

## Architecture

The knowledge graph uses a layered architecture:

1. **Storage Layer** - SQLite with optimized schema and indexes
2. **Core Layer** - Entity/relation management with transactions
3. **Analysis Layer** - Static code analysis and pattern recognition
4. **Query Layer** - Domain-specific queries and aggregations
5. **Integration Layer** - MCP server and project scanning
6. **Application Layer** - CLI tools and usage examples

## Performance

- **Sub-second queries** for projects with 1000+ components
- **Efficient indexing** on entity types, names, and relationships
- **Prepared statements** for common operations
- **Full-text search** with relevance ranking
- **Incremental updates** for file changes

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

For questions or support, please open an issue on GitHub.