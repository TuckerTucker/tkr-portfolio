# Claude Code Agent Specification

Version: 1.0  
Last Updated: 2025-07-31

## Overview

This document defines the specification for Claude Code agents in the tkr-context-kit ecosystem. Agents are specialized AI sub-agents that perform focused tasks within a Claude Code session.

## Agent Architecture

### Core Components

1. **Metadata Header** (YAML frontmatter)
2. **Purpose Statement** 
3. **Instructions Section**
4. **Best Practices Section**
5. **Output Format Section**

### File Structure

```
.claude/agents/
├── agent-name.md           # Individual agent definitions
├── README.md               # Agent documentation
└── deprecated/             # Deprecated agents (optional)
```

## Agent Definition Format

### 1. Metadata Header (Required)

```yaml
---
name: agent-name              # kebab-case, unique identifier
description: Brief action-oriented description for automatic delegation
tools: [Tool1, Tool2, Tool3]  # YAML array of required tools
color: Color                  # Visual identifier: Red, Blue, Green, Yellow, Purple, Orange, Pink, Cyan
---
```

#### Field Specifications

- **name**: 
  - Format: kebab-case (lowercase, hyphen-separated)
  - Length: 3-30 characters
  - Must be unique within the project
  - Examples: `docs-mapper`, `security-scanner`, `api-analyzer`

- **description**:
  - Length: 10-100 characters
  - Must start with an action verb
  - Should clearly indicate the agent's primary function
  - Used by Claude Code for automatic agent selection

- **tools**:
  - Only include tools the agent actually uses
  - Use exact tool names as recognized by Claude Code
  - Common tools: `Read`, `Write`, `Bash`, `Grep`, `Task`, `MultiEdit`
  - MCP tools: Use full MCP notation (e.g., `mcp__context7__resolve-library-id`)

- **color**:
  - Choose from: Red, Blue, Green, Yellow, Purple, Orange, Pink, Cyan
  - Use colors to group related functionality:
    - Blue: Documentation/reference tasks
    - Green: File system/structure tasks
    - Purple: Design/UI tasks
    - Cyan: Synthesis/compilation tasks
    - Red: Security/critical analysis
    - Yellow: Quality/optimization tasks

### 2. Purpose Statement (Required)

```markdown
# Purpose

Sole Purpose: [Primary function 2-3 words]. [One sentence describing what it creates/produces].
```

#### Purpose Format Rules

- Must start with "Sole Purpose:"
- Primary function: 2-3 words, capitalized
- Followed by a period
- Single sentence describing the output/result
- Total length: Under 150 characters

#### Examples

```markdown
Sole Purpose: Security vulnerability scanning. Identifying potential security risks and attack vectors in the codebase.

Sole Purpose: Dependency mapping. Creating a comprehensive map of all project dependencies with version information.

Sole Purpose: API documentation. Generating OpenAPI specifications from existing endpoint implementations.
```

### 3. Instructions Section (Required)

```markdown
## Instructions

When invoked, you must follow these steps:

1. **Action Verb + Primary Task**
   - Specific implementation detail
   - Expected outcome or validation
   - Error handling approach

2. **Secondary Task**
   - Prerequisite checks
   - Processing logic
   - Output generation

3. **Final Task**
   - Result validation
   - File writing
   - Cleanup operations
```

#### Instruction Guidelines

- Number all major steps
- Use bold for step titles
- Include specific file paths and commands
- Provide clear success/failure criteria
- Specify exact output locations

### 4. Best Practices Section (Required)

```markdown
## Best Practices

* Specific domain best practice
* Error handling approach
* Performance consideration
* Output quality guideline
```

Best practices should be:
- Actionable and specific
- Relevant to the agent's domain
- Focused on quality and reliability
- Concise (one line each)

### 5. Output Format Section (Required)

```markdown
## Output Format

[Description of output structure]

```yaml
# Example output structure
key:
  nested: value
  array: [item1, item2]
```
```

Include:
- Output file location
- File format (YAML, JSON, Markdown)
- Complete structure example
- Key abbreviations if used
- Size/complexity constraints

## Agent Categories

### Analysis Agents
- Examine existing code/structure
- Report findings without modifications
- Output: Structured data files

### Generation Agents
- Create new content based on analysis
- Transform data between formats
- Output: New files or configurations

### Validation Agents
- Check correctness and compliance
- Verify standards adherence
- Output: Reports with pass/fail status

### Synthesis Agents
- Combine multiple data sources
- Create unified outputs
- Output: Consolidated files

### Incremental Update Agents
- Monitor git changes and update context
- Maintain knowledge graph consistency
- Output: Updated analysis files and MCP entities

## Tool Usage Guidelines

### Tool Selection Principles

1. **Minimal Tool Set**: Only request tools actually used
2. **Specific Permissions**: Use narrowed permissions when possible
3. **No Redundancy**: Don't request overlapping tools

### Common Tool Patterns

```yaml
# File reading only
tools: [Read]

# File creation/modification
tools: [Read, Write]

# Shell command execution
tools: [Bash]

# Complex file editing
tools: [Read, MultiEdit]

# Web content fetching
tools: [WebFetch]

# Search operations
tools: [Grep, Glob]

# Parallel Task execution for agent orchestration
tools: [Read, Task]

# MCP integrations
tools: [mcp__context7__resolve-library-id, mcp__context7__get-library-docs]

# Incremental update agents
tools: [Read, Bash, mcp__context-kit__*]
```

## Output Conventions

### File Naming

```
.context-kit/analysis/{agent-name}-output.{ext}
```

- Use agent name in output filename
- Standard extensions: `.yml`, `.json`, `.md`
- Temporary files: Append timestamp

### YAML Structure Standards

```yaml
# Metadata section
_meta:
  generated: "2025-07-31T10:00:00Z"
  agent: "agent-name"
  version: "1.0"

# Main content
data:
  # Use consistent abbreviations
  deps: []    # dependencies
  struct: {}  # structure
  comp: []    # components
  
# Use anchors for repeated values
colors: &base-colors
  primary: "#000"
theme:
  <<: *base-colors
```

### Compression Guidelines

1. **Standard Abbreviations**:
   - dependencies → deps
   - structure → struct
   - components → comp
   - properties → props
   - accessibility → a11y
   - development → dev
   - production → prod

2. **Optimization Techniques**:
   - Use YAML anchors for repeated values
   - Compact array notation: `[a, b, c]`
   - Omit null/empty values
   - Group related data

## Error Handling

### Required Error Checks

1. **Input Validation**
   ```markdown
   - Verify required files exist before processing
   - Check file permissions
   - Validate file formats
   ```

2. **Graceful Degradation**
   ```markdown
   - Continue processing remaining items on individual failures
   - Log errors clearly
   - Provide partial results when possible
   ```

3. **Clear Error Messages**
   ```markdown
   - State what failed
   - Explain why it failed
   - Suggest remediation
   ```

## Performance Guidelines

### Efficiency Requirements

1. **Batch Operations**: Process multiple files in single operations
2. **Minimal I/O**: Read files once, cache results
3. **Parallel Processing**: Use Task tool for concurrent agent execution
4. **Early Termination**: Fail fast on critical errors
5. **MCP Integration**: Leverage persistent state across conversations
6. **Incremental Updates**: Process only changed files when possible

### Resource Limits

- Output file size: Warn if > 1MB
- Processing time: Log if > 60 seconds
- Memory usage: Stream large files

## Testing Agents

### Validation Checklist

- [ ] Metadata header is valid YAML
- [ ] All required sections present
- [ ] Purpose follows exact format
- [ ] Instructions are numbered and clear
- [ ] Output format includes examples
- [ ] Tool list is minimal and accurate
- [ ] Error handling is specified

### Test Execution

```bash
# Individual agent test
/agent agent-name

# Verify output
ls .context-kit/analysis/*-output.*

# Test parallel execution pattern
/command project-yaml  # Uses multiple agents in parallel
```

## Version Control

### Agent Evolution

1. **Backward Compatibility**: Maintain output structure compatibility
2. **Deprecation Process**: Move old agents to `deprecated/` folder
3. **Version Documentation**: Note changes in agent header comments

### Change Management

When updating agents:
1. Test with sample projects
2. Update dependent agents
3. Document breaking changes
4. Provide migration path

## Integration Requirements

### Claude Code Integration

Agents must:
- Respond to `/agent agent-name` invocation
- Use only declared tools
- Write to specified output locations
- Return clear success/failure status

### Inter-Agent Communication

- Agents read outputs from other agents
- Never invoke other agents directly
- Use consistent data formats
- Document dependencies clearly

## Quality Standards

### Code Quality

- Clear, readable instructions
- Consistent formatting
- Proper error handling
- Efficient execution

### Documentation Quality

- Complete examples
- Clear purpose statement
- Accurate tool requirements
- Helpful best practices

### Output Quality

- Valid file formats
- Consistent structure
- Meaningful content
- Optimized size

## Appendix: Common Patterns

### Pattern 1: File Analysis Agent

```yaml
---
name: file-analyzer
description: Analyze files for specific patterns
tools: [Read, Grep, Write]
color: Green
---
```

### Pattern 2: API Integration Agent

```yaml
---
name: api-mapper
description: Map API endpoints and generate documentation
tools: [Read, mcp__context7__resolve-library-id, Write]
color: Blue
---
```

### Pattern 3: Security Scanner Agent

```yaml
---
name: security-scanner
description: Scan for security vulnerabilities
tools: [Read, Grep, Bash, Write]
color: Red
---
```

### Pattern 4: Incremental Update Agent

```yaml
---
name: context-updater
description: Update project context based on git changes
tools: [Bash, Read, mcp__context-kit__create_entity]
color: Cyan
---
```

### Pattern 5: Agent Orchestrator

```yaml
---
name: project-consolidator
description: Orchestrate multiple analysis agents in parallel
tools: [Task, Read, Write]
color: Purple
---
```

---

This specification ensures consistency, quality, and maintainability across all Claude Code agents in the tkr-context-kit ecosystem.