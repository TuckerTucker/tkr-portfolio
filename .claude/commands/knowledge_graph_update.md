# Knowledge Graph Update

Update the local knowledge graph using the MCP server to capture current project state and insights.

## Description
This command systematically updates the local knowledge graph via the MCP server to reflect the current project understanding, relationships, and observations. It ensures the AI's persistent memory stays synchronized with actual project evolution by analyzing the codebase and updating entities, relations, and observations in the knowledge graph store.

## Usage
`knowledge_graph_update [focus_area]`

## Variables
- PROJECT_ROOT: Starting directory for analysis (default: current directory)
- MEMORY_PATH: Path to knowledge graph storage (default: _project/mcp-knowledge-graph/memory)
- FOCUS_AREA: Specific domain to update (default: comprehensive update)
- BACKUP: Create backup before updating (default: true)

## Parallel Agents
- Use an agent for each of the steps and run them in parallel

## Steps
1. **Analyze Current Project State**:
   - Review codebase structure and components
   - Identify key entities (files, functions, classes, modules)
   - Map relationships between components
   - Document current implementation patterns and decisions

2. **Extract Project Entities**:
   - Create entities for major components and modules
   - Document key files and their purposes
   - Identify important functions and classes
   - Map external dependencies and libraries

3. **Map Component Relations**:
   - Document imports and dependencies between modules
   - Map data flow and control flow relationships
   - Identify inheritance and composition patterns
   - Note configuration and deployment relationships

4. **Capture Technical Observations**:
   - Document architectural decisions and patterns
   - Note performance characteristics and constraints
   - Record security considerations and implementations
   - Capture testing strategies and coverage

5. **Update Business Context**:
   - Document project goals and requirements
   - Map feature implementations to business objectives
   - Note user stories and use cases
   - Record stakeholder concerns and priorities

6. **Synchronize Development Insights**:
   - Document recent changes and their impacts
   - Note technical debt and improvement opportunities
   - Record lessons learned and best practices
   - Update development workflow observations

7. **Validate Graph Integrity**:
   - Check for orphaned entities and broken relationships
   - Ensure referential integrity between entities
   - Validate observation accuracy and relevance
   - Clean up outdated or incorrect information

## MCP Operations Used
- `create_entities`: Add new project components and concepts
- `create_relations`: Map relationships between components
- `add_observations`: Record insights and technical details
- `delete_entities`: Remove outdated components
- `delete_relations`: Clean up broken relationships
- `delete_observations`: Remove obsolete information
- `search_nodes`: Find existing relevant entities
- `read_graph`: Validate current graph state

## Examples

### Example 1: Full project analysis
Complete knowledge graph update after major architectural changes or new feature implementation.

### Example 2: Security-focused update
Update knowledge graph with security-related entities, relations, and observations after security review.

### Example 3: Performance analysis update
Focused update on performance-related components and their relationships after optimization work.

### Example 4: Dependency update
Update graph with new dependencies and their relationships after package updates.

## Integration Points
- **MCP Server**: Uses `/Users/tucker/localkg/_project/mcp-knowledge-graph/` server
- **Context Prime**: Should be run after `context_prime` to capture comprehensive project understanding
- **Repository Review**: Can incorporate findings from specialized analysis agents
- **Project YAML**: Complements `project_yaml_update` by providing deeper relational context

## Best Practices
- Always backup knowledge graph before major updates
- Use specific, descriptive entity names and types
- Create meaningful relationships that capture actual dependencies
- Write observations that provide actionable insights
- Maintain consistent entity typing and naming conventions
- Validate relationships for accuracy and relevance
- Focus on capturing knowledge that persists across sessions

## Entity Types to Consider
- `software_component`: Major modules, services, libraries
- `technical_concept`: Patterns, architectures, algorithms  
- `business_requirement`: Features, user stories, objectives
- `technical_debt`: Issues, improvements, refactoring needs
- `configuration`: Settings, environment variables, deployment configs
- `external_dependency`: Third-party libraries, services, APIs
- `development_process`: Workflows, practices, standards

## Relation Types to Consider
- `depends_on`: Component dependencies
- `implements`: Feature implementations
- `extends`: Inheritance relationships
- `configures`: Configuration relationships
- `tests`: Testing relationships
- `deploys_to`: Deployment relationships
- `addresses`: Problem-solution mappings

## Notes
- Focus on capturing relationships and insights that are valuable across development sessions
- Balance between comprehensive coverage and actionable specificity
- Update observations to reflect current state, not historical artifacts
- Consider both technical architecture and business context when modeling entities
- Use the knowledge graph to enhance AI understanding for future development tasks
- Leverage visualization capabilities to validate graph structure and relationships