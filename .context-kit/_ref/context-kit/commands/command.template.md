# Command Name

Brief one-line description of what the command does.

## Description
Detailed explanation of the command's purpose, use cases, and value proposition. This should explain:
- What problem it solves
- When to use it
- What outcomes to expect
- How it fits into broader workflows

## Usage
`/<command-name> [required_arg] [optional_arg]`

## Variables
- $ARGUMENTS: Command arguments passed from slash command invocation
- OUTPUT_PATH: Where results are saved (default: ./output)
- DEBUG: Enable verbose output (default: false)

## Steps
1. **Step Name**: 
   - Detailed sub-step explanation
   - What happens at this stage
   - Expected outcomes

2. **Next Major Step**:
   - Implementation details
   - Validation criteria
   - Error handling approach

3. **Final Step**:
   - Consolidation or cleanup
   - Output generation
   - Success verification

## Examples
### Example 1: Basic usage
```bash
/<command-name> basic_arg
```
Description of what this example does and when to use it.

### Example 2: Advanced usage with options
```bash
/<command-name> /path/to/target --flag
```
Explanation of advanced features and customization options.

### Example 3: Integration scenario
```bash
/<command-name> @file/path
```
How to integrate with other commands or workflows.

## Output Structure
```
output/
├── main-result.md          # Primary output file
├── data/                   # Structured data outputs
│   ├── analysis.json      # Machine-readable results
│   └── metrics.json       # Performance metrics
└── logs/                   # Execution logs
    └── command.log        # Detailed execution log
```

## Integration Points
- **Related Commands**: List of commands that work well together
- **External Tools**: Any external dependencies or integrations  
- **Workflow Position**: Where this fits in larger processes
- **MCP Dependencies**: Knowledge graph tools and persistent state requirements
- **Agent Dependencies**: Which agents this command orchestrates or depends on
- **Context Updates**: What project context files this command modifies

## Best Practices
- Key recommendation for optimal use
- Common patterns that work well
- Performance considerations
- Security implications if applicable

## Notes
- Important caveats or limitations
- Version compatibility information
- Future enhancement considerations
- Edge cases to be aware of

---

# Alternative Format: Agent-Based Command Template

---
allowed-tools: [Read, Write]
tools: [Task, Read, Write]
description: Brief action-oriented description for automatic delegation
argument-hint: [arg1] [arg2] - Description of expected arguments
mcp-integration: true
---

## Context
Background information and setup required for the command execution.

## Your Task
Clear instructions on what needs to be accomplished, including:
1. Primary objective
2. Sub-tasks to complete
3. Expected deliverables

## Expected Output
Description of what successful execution looks like, including:
- File outputs
- Console messages
- State changes
- Next steps for the user

## Agent Execution Strategy
For commands that use AI agents:

**Modern Parallel Execution** (using Task tool batching):
```
Use Task tool to run multiple agents in a single operation:
- Run structure-analyzer for codebase mapping
- Run dependency-analyzer for library analysis
- Run pattern-analyzer for design system extraction
- Run consolidator-agent for synthesis
```

**Context-Aware Incremental Updates** (git-diff based):
```
1. Get git diff since last analysis: git diff --name-only HEAD~1
2. Run incremental update agents on changed files only
3. Update MCP knowledge graph entities and relations
4. Synchronize project context files (_context-kit.yml, analysis/*.yml)
```

**MCP Tool Integration Examples** (persistent state):
```
- mcp__context-kit__create_entity: Add new components to knowledge base
- mcp__context-kit__create_relation: Link dependencies and relationships
- mcp__context-kit__query: Search existing project knowledge
- mcp__context-kit__analyze_project: Get comprehensive insights
```

Invoke agents with: `subagent_type: "agent-name"`

After completion, provide a brief summary of:
- What was accomplished
- Key findings or outputs
- MCP entities/relations created or updated
- Files written to .context-kit/analysis/
- Next steps or follow-up actions recommended

## Context Synchronization Pattern

For commands that update persistent project context:

```markdown
## Context Update Strategy

**Phase 1: Change Detection**
- Get git diff and identify modified files
- Determine scope of analysis needed
- Check for new dependencies or structural changes

**Phase 2: Incremental Analysis**
- Run only relevant agents on changed components
- Update analysis files in .context-kit/analysis/
- Preserve unchanged analysis data

**Phase 3: Knowledge Graph Sync**
- Create/update MCP entities for new components
- Add relations for new dependencies
- Maintain consistency with existing knowledge

**Phase 4: Context File Updates**
- Update _context-kit.yml with new findings
- Synchronize design tokens and architecture patterns
- Ensure all context is current and accurate
```