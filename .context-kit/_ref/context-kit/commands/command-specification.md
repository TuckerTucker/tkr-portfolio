# Claude Code Command Specification

Version: 1.0  
Last Updated: 2025-07-31

## Overview

This document defines the specification for Claude Code commands in the tkr-context-kit ecosystem. Commands are reusable instructions that guide Claude Code through complex or repetitive tasks.

## Command Architecture

### Core Components

1. **Title and Description**
2. **Metadata Section** (optional)
3. **Usage Instructions**
4. **Variables/Parameters**
5. **Execution Steps**
6. **Examples**
7. **Output Documentation**
8. **Integration Notes**

### File Structure

```
.claude/commands/
├── command-name.md         # Individual command definitions
├── README.md              # Command documentation
├── TEMPLATE.md            # Command template
└── deprecated/            # Deprecated commands (optional)
```

## Claude Code Compatibility

This specification aligns with the official Claude Code slash command format documented at https://docs.anthropic.com/en/docs/claude-code/slash-commands.

### Key Requirements

- Commands are Markdown files (`.md`) in `.claude/commands/`
- Command names derived from filename (without `.md` extension)
- Invoked with slash prefix: `/<command-name>`
- Optional YAML frontmatter for metadata and tool restrictions
- Automatic `$ARGUMENTS` variable available in all commands
- Support for file references with `@` prefix
- Support for bash execution with `!` prefix

## Command Formats

### Format 1: Standard Command

Used for procedural commands with step-by-step instructions.

```markdown
# Command Title

Brief one-line description of what the command does.

## Description
[Detailed explanation]

## Usage
`command_name [required_arg] [optional_arg]`

## Variables
[Variable definitions]

## Steps
[Numbered execution steps]

## Examples
[Usage examples]

## Output Structure
[Expected outputs]

## Notes
[Additional information]
```

### Format 2: Agent-Based Command

Used for commands that primarily delegate to AI agents.

```markdown
---
description: Brief action-oriented description
argument-hint: [arg1] [arg2] - Description of arguments
---

## Context
[Background information]

## Your Task
[Clear instructions]

## Expected Output
[Success criteria]

## Agent Execution Strategy
[Agent orchestration details]
```

## Section Specifications

### 1. Title and Brief Description

```markdown
# Command Name

Brief one-line description of what the command does.
```

- **Title**: Use title case, 2-5 words
- **Description**: One line, under 100 characters
- Start with action verb or noun phrase

### 2. Metadata Section (Optional)

For agent-based commands:

```yaml
---
description: Action-oriented description for delegation
argument-hint: [arg1] [arg2] - What arguments to expect
allowed-tools: Tool1, Tool2  # Restrict tool usage
---
```

### 3. Description Section

```markdown
## Description
Detailed explanation of the command's purpose, including:
- What problem it solves
- When to use it
- What outcomes to expect
- How it fits into broader workflows
```

Requirements:
- 3-8 sentences
- Focus on value and use cases
- Avoid implementation details

### 4. Usage Section

```markdown
## Usage
`/<command-name> [required_arg] [optional_arg]`

Alternative forms:
`/<command-name> <target> [options]`
`/<command-name> @file/path`
```

Conventions:
- Always show slash prefix (`/`)
- Use backticks for code formatting
- `[optional]` in square brackets
- `<required>` in angle brackets
- Show file reference patterns with `@`

### 5. Variables Section

```markdown
## Variables
- $ARGUMENTS: Command arguments passed from slash command invocation
- OUTPUT_PATH: Where results are saved (default: ./output)
- DEBUG: Enable verbose output (default: false)
```

Format:
- `$ARGUMENTS` is automatically available in all commands
- Environment variables in CAPS
- Clear description with defaults
- Group related variables

### 6. Steps Section

```markdown
## Steps

### Phase 1: Preparation
1. **Step Name**:
   - Sub-task description
   - Expected outcome
   - Error handling

2. **Validation**:
   - Check prerequisites
   - Verify inputs
   - Set up environment

### Phase 2: Execution
3. **Main Processing**:
   - Core logic
   - Progress tracking
   - Intermediate outputs
```

Guidelines:
- Use numbered steps
- Bold step names
- Group into logical phases
- Include error handling

### 7. Examples Section

```markdown
## Examples

### Example 1: Basic usage
```bash
/<command-name> basic_arg
```
Description of what this does.

### Example 2: File reference
```bash
/<command-name> @src/components/Button.tsx
```
Process a specific file using @ prefix.

### Example 3: Advanced with arguments
```bash
/<command-name> /path/to/target --verbose
```
Pass complex arguments through $ARGUMENTS variable.
```

Requirements:
- 2-5 examples minimum
- Progress from simple to complex
- Include real-world scenarios
- Explain each example's purpose

### 8. Output Structure

```markdown
## Output Structure
```
output/
├── summary.md              # Executive summary
├── data/                   # Structured data
│   ├── results.json       # Machine-readable
│   └── metrics.yaml       # Performance data
└── logs/                   # Execution logs
    └── command.log        # Detailed log
```

Description of each output file and its purpose.
```

Include:
- Directory tree visualization
- File format descriptions
- Size expectations
- Usage instructions

### 9. Integration Points

```markdown
## Integration Points
- **Related Commands**: Commands that work together
- **Dependencies**: External tools required
- **Workflow Position**: Where this fits in pipelines
- **API Endpoints**: Services used (if any)
```

### 10. Best Practices

```markdown
## Best Practices
- Key recommendation for optimal use
- Common successful patterns
- Performance considerations
- Security implications
```

Keep concise - one line per practice.

### 11. Notes Section

```markdown
## Notes
- Important limitations
- Version requirements
- Known issues
- Future enhancements
```

## Command Categories

### 1. Analysis Commands
- Examine code or data
- Generate reports
- No modifications
- Often use parallel agent execution

Examples: `analyze_deps`, `security_scan`, `lint_check`, `project-yaml`

### 2. Generation Commands
- Create new files
- Generate code
- Build documentation
- May create MCP entities

Examples: `create_component`, `gen_docs`, `scaffold`

### 3. Modification Commands
- Update existing files
- Refactor code
- Apply fixes
- Update knowledge graph

Examples: `update_deps`, `fix_lint`, `refactor`

### 4. Utility Commands
- Development tools
- Workflow helpers
- Environment setup
- MCP server management

Examples: `commit`, `test`, `deploy`, `kg_init`

### 5. Review Commands
- Code review helpers
- Quality checks
- Holistic analysis
- Context-aware insights

Examples: `review_pr`, `check_quality`, `minima`

### 6. Context Commands
- Update persistent project state
- Synchronize knowledge graph
- Incremental context updates
- Git-aware processing

Examples: `context_prime`, `update_claude_code`

## Variable Conventions

### Naming Standards

```bash
# Environment variables
PROJECT_ROOT=/path/to/project
OUTPUT_FORMAT=json
MAX_DEPTH=3

# Boolean flags
VERBOSE=true
DEBUG=false
DRY_RUN=true

# Lists
INCLUDE_PATTERNS="*.js,*.ts"
EXCLUDE_DIRS="node_modules,dist"
```

### Default Values

Always provide sensible defaults:
- Paths: Current directory or project-relative
- Formats: Most common/useful format
- Flags: Safe/conservative option
- Limits: Reasonable for most projects

## Agent Integration

### Agent-Based Commands

For commands using AI agents:

```markdown
## Agent Execution Strategy

**Modern Parallel Execution** (using Task tool batching):
```
Use Task tool with multiple agent invocations in a single call:
- Analyze codebase structure with dir-mapper agent
- Extract design system with design-system agent  
- Document dependencies with docs-context7 agent
- Consolidate findings with project-consolidator agent
```

**Context-Aware Updates** (incremental processing):
```
1. Get git diff since last analysis
2. Run incremental update agents on changed files only
3. Update MCP knowledge graph with new entities/relations
4. Synchronize project context files
```

**MCP Tool Integration** (persistent state):
```
- create_entity: Add new project entities to knowledge graph
- create_relation: Link components and dependencies
- analyze_project: Get comprehensive project insights
- query: Search existing knowledge base
```

Invoke with: `subagent_type: "agent-name"`
```

### Agent Selection

Document which agents to use:
- Agent name and purpose
- Input requirements
- Expected outputs
- Error handling
- Parallel execution compatibility
- MCP tool dependencies
- Incremental update support

## Error Handling

### Required Error Checks

1. **Input Validation**
   - Verify arguments
   - Check file existence
   - Validate permissions

2. **Execution Errors**
   - Command failures
   - Timeout handling
   - Resource limits

3. **Output Validation**
   - Verify outputs created
   - Check output validity
   - Confirm success criteria

### Error Messaging

```markdown
ERROR: File not found: /path/to/file
HINT: Check if the file exists and you have read permissions

WARNING: Large repository detected (>1000 files)
INFO: This may take several minutes to complete
```

Format:
- ERROR: Critical failures
- WARNING: Important notices
- INFO: Status updates
- HINT: Helpful suggestions

## Performance Guidelines

### Optimization Strategies

1. **Parallelization**
   - Run independent tasks concurrently using Task tool
   - Batch multiple agent invocations in single Task call
   - Use MCP for persistent state across parallel operations

2. **Caching**
   - Cache expensive computations
   - Reuse previous results
   - Implement incremental updates

3. **Resource Management**
   - Set reasonable limits
   - Provide progress indicators
   - Allow early termination

### Performance Metrics

Document expected performance:
- Execution time estimates
- Resource usage
- Scaling characteristics

## Testing Commands

### Validation Checklist

- [ ] Command executes without errors
- [ ] All examples work as documented
- [ ] Output matches specification
- [ ] Error cases handled gracefully
- [ ] Performance is acceptable
- [ ] Integration points verified

### Test Scenarios

1. **Happy Path**: Normal execution
2. **Edge Cases**: Boundary conditions
3. **Error Cases**: Invalid inputs
4. **Integration**: With other commands

## Documentation Standards

### Writing Style

- **Clear**: Avoid jargon
- **Concise**: Be brief but complete
- **Consistent**: Follow patterns
- **Actionable**: Focus on doing

### Formatting

- Use Markdown consistently
- Code blocks with language hints
- Tables for structured data
- Lists for multiple items

### Examples Quality

- Realistic and useful
- Progressively complex
- Well-explained
- Copy-paste ready

## Version Control

### Change Management

When updating commands:
1. Maintain backward compatibility
2. Document breaking changes
3. Provide migration path
4. Update examples

### Deprecation Process

```markdown
## DEPRECATED
This command is deprecated as of v2.0.
Use `new_command` instead.
Migration guide: [link]
```

## Quality Standards

### Command Quality

- Single, clear purpose
- Predictable behavior
- Useful outputs
- Good performance

### Documentation Quality

- Complete sections
- Accurate information
- Helpful examples
- Clear instructions

### User Experience

- Intuitive usage
- Helpful errors
- Progress feedback
- Success confirmation

## Appendix: Common Patterns

### Pattern 1: Analysis Command with Parallel Agents

```markdown
# Project Analysis

Comprehensive codebase analysis using multiple specialized agents.

## Usage
`/project-yaml [scope]`

## Agent Execution Strategy
Use Task tool to run multiple agents in parallel:
- docs-context7: Library dependency analysis
- dir-mapper: Directory structure analysis  
- design-system: UI/UX pattern extraction
- project-consolidator: Synthesis and YAML generation
```

### Pattern 2: Context-Aware Command

```markdown
---
description: Update project context based on git changes
argument-hint: [commit-range] - Git range to analyze
tools: [Bash, Task, mcp__context-kit__*]
mcp-integration: true
---

## Context Synchronization
1. **Detect Changes**: Get git diff and modified files
2. **Incremental Analysis**: Run agents only on changed components
3. **Update Knowledge Graph**: Sync entities and relations via MCP
4. **Context Files**: Update _context-kit.yml and analysis outputs
```

### Pattern 3: MCP-Integrated Workflow Command

```markdown
# Enhanced Commit

Commit with automatic context updates and knowledge graph sync.

## Steps
1. **Stage Changes**: Git add modified files
2. **Update Context**: Run incremental update agents
3. **Sync Knowledge**: Update MCP entities and relations
4. **Commit**: Include code changes + context updates

## MCP Integration
- create_entity: Add new components to knowledge graph
- create_relation: Link dependencies and relationships
- query: Validate consistency with existing knowledge
```

---

This specification ensures consistency, usability, and maintainability across all Claude Code commands in the tkr-context-kit ecosystem.