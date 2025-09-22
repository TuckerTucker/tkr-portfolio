# Claude Code settings.local.json Configuration Guide

[Official Documentation](https://docs.anthropic.com/en/docs/claude-code/settings)

Claude Code's configuration system enables powerful autonomous coding capabilities through its hierarchical settings structure, with `.claude/settings.local.json` providing project-specific overrides that maximize capabilities while maintaining security boundaries.

## Core Configuration Structure

A comprehensive Claude Code configuration includes the following key sections:

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "includeCoAuthoredBy": false,
  "defaultMode": "acceptEdits",
  "additionalDirectories": [
    ".context-kit/knowledge-graph"
  ],
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "DISABLE_PROMPT_CACHING": "0",
    "MCP_TIMEOUT": "30000",
    "OTEL_METRIC_EXPORT_INTERVAL": "10000",
    "NODE_ENV": "development"
  },
  "permissions": {
    "allow": [
      "Bash(npm:*)",
      "Bash(git:*)",
      "Edit",
      "Read",
      "Write",
      "mcp__context-kit__*",
      "mcp__context7__*"
    ],
    "deny": [
      "Bash(rm -rf /)",
      "Bash(sudo rm:*)",
      "Edit(/etc/**)",
      "Edit(/usr/**)",
      "Edit(~/.ssh/**)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/hooks.sh"
          }
        ]
      }
    ]
  }
}
```

## Permission System Deep Dive

### File System Access Permissions

Claude Code's permission system uses **gitignore-style patterns** for maximum flexibility. The most permissive configurations grant broad access while maintaining critical security boundaries:

**Maximum File Access:**
- `"Edit"` - Allows editing all files in the project
- `"Create"` - Enables creating new files anywhere in the project
- `"Read"` - Permits reading all accessible files
- `"Write"` - Allows writing to any project file
- `"Replace"` - Enables find-and-replace operations
- `"Delete"` - Permits file deletion (use with caution)

**Pattern-Based Restrictions:**
For more controlled environments, use specific patterns:
- `"Edit(src/**)"` - Limit editing to source directory
- `"Read(~/.zshrc)"` - Allow reading specific home directory files
- `"Write(//tmp/**)"` - Grant write access to absolute paths

### Command Execution Capabilities

The **Bash permission format** provides granular control over command execution:

**Wildcard Permissions:**
- `"Bash(*)"` - Allows ALL bash commands (maximum risk, not recommended)
- `"Bash(npm:*)"` - Allows all npm commands
- `"Bash(git:*)"` - Permits all git operations

**Security-Critical Denials:**
Always include these deny rules to prevent catastrophic operations:
```json
"deny": [
  "Bash(rm -rf /)",
  "Bash(sudo:*)",
  "Bash(chmod 777:*)",
  "Bash(curl:* | sh)",
  "Bash(wget:* | bash)"
]
```

### Network Access Configuration

**WebFetch Permissions:**
- `"WebFetch"` - Allows fetching from any URL (maximum capability)
- `"WebFetch(domain:*.openai.com)"` - Domain-specific restrictions
- `"WebFetch(domain:localhost:*)"` - Local development server access

## Configuration Settings Reference

### Schema and Validation

- `"$schema"`: Points to the JSON schema for validation and IDE support
- Value: `"https://json.schemastore.org/claude-code-settings.json"`

### Core Settings

#### includeCoAuthoredBy
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Controls whether to include "Co-Authored-By: Claude" in git commits
- **Example**: `"includeCoAuthoredBy": false`

#### defaultMode
- **Type**: `string`
- **Options**: `"acceptEdits"`, `"reviewEdits"`, `"dryRun"`
- **Description**: Sets the default behavior for edit operations
- **Example**: `"defaultMode": "acceptEdits"`

#### additionalDirectories
- **Type**: `array` of strings
- **Description**: Additional directories to include in Claude's context
- **Example**: `"additionalDirectories": [".context-kit/knowledge-graph", "custom-dir"]`

### Environment Variables (env)

Configure runtime behavior through environment variables:

```json
"env": {
  "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
  "DISABLE_PROMPT_CACHING": "0",
  "MCP_TIMEOUT": "30000",
  "OTEL_METRIC_EXPORT_INTERVAL": "10000",
  "NODE_ENV": "development"
}
```

- **CLAUDE_CODE_ENABLE_TELEMETRY**: Enable usage analytics
- **DISABLE_PROMPT_CACHING**: Control prompt caching behavior
- **MCP_TIMEOUT**: Timeout for MCP server operations (milliseconds)
- **OTEL_METRIC_EXPORT_INTERVAL**: OpenTelemetry metrics export interval
- **NODE_ENV**: Environment mode (development/production)

### MCP (Model Context Protocol) Permissions

Enable access to MCP server tools with specific permissions:

#### Project Kit MCP Server
```json
"mcp__context-kit__get_stats",
"mcp__context-kit__create_entity",
"mcp__context-kit__create_relation",
"mcp__context-kit__search_entities",
"mcp__context-kit__analyze_state_mutations",
"mcp__context-kit__trace_workflow",
"mcp__context-kit__trace_user_flow",
"mcp__context-kit__analyze_impact",
"mcp__context-kit__find_patterns",
"mcp__context-kit__generate_code",
"mcp__context-kit__validate_consistency",
"mcp__context-kit__get_component_dependencies",
"mcp__context-kit__analyze_state_patterns",
"mcp__context-kit__generate_test_scenarios",
"mcp__context-kit__analyze_project",
"mcp__context-kit__analyze_storybook",
"mcp__context-kit__query",
"mcp__context-kit__run_script",
"mcp__context-kit__list_available_scripts",
"mcp__context-kit__check_ports",
"mcp__context-kit__start_dev_server",
"mcp__context-kit__build_ui",
"mcp__context-kit__run_tests",
"mcp__context-kit__stop_services",
"mcp__context-kit__service_status"
```

#### Context7 MCP Server
```json
"mcp__context7__resolve-library-id",
"mcp__context7__get-library-docs"
```

### Hooks Configuration

The hooks system allows running scripts before tool execution:

```json
"hooks": {
  "PreToolUse": [
    {
      "matcher": "*",
      "hooks": [
        {
          "type": "command",
          "command": ".claude/hooks/hooks.sh"
        }
      ]
    }
  ]
}
```

- **PreToolUse**: Runs before any tool execution
- **matcher**: Pattern to match tools ("*" for all tools)
- **type**: Hook type ("command" for shell commands)
- **command**: Path to the hook script relative to project root

## Example Configurations

This directory contains several example configurations for different use cases:

### current.example.json
The actual working configuration used in this project, including all MCP permissions and modern settings.

### permissive.example.json
Maximum capabilities with comprehensive tool access, suitable for development environments with security boundaries.

### balanced.example.json
Balanced configuration for daily development work with appropriate restrictions and review mode enabled.

### empty.example.json
Minimal configuration starting point with essential security deny rules.

## Permission Patterns and Best Practices

### File System Patterns
- `"Edit"` - Allows editing all files in project
- `"Edit(src/**)"` - Limit editing to specific directory
- `"Read"` - Read access to all files
- `"Write(dist/**)"` - Write access to specific paths

### Command Patterns
- `"Bash(npm:*)"` - Allow all npm commands
- `"Bash(git add .)"` - Specific git command
- `"Bash(docker:*)"` - All docker operations

### MCP Permission Patterns
- `"mcp__context-kit__*"` - All context-kit MCP tools
- `"mcp__context-kit__query"` - Specific MCP tool
- `"mcp__context7__*"` - All context7 MCP tools

### Security Considerations

Always include essential deny rules:
```json
"deny": [
  "Bash(rm -rf /)",
  "Bash(sudo:*)",
  "Edit(/etc/**)",
  "Edit(/usr/**)",
  "Edit(~/.ssh/**)"
]
```

## Troubleshooting

### Common MCP Setup Issues

#### MCP Server Not Starting
```bash
# Check if MCP server is configured correctly
cd .context-kit/knowledge-graph
npm run build
node dist/mcp/server.js

# Verify port availability
.context-kit/scripts/check-ports.sh
```

#### MCP Permission Denied
Ensure MCP permissions are correctly configured in settings.local.json:
```json
{
  "permissions": {
    "allow": [
      "mcp__context-kit__*",
      "mcp__context7__*"
    ]
  }
}
```

#### MCP Timeout Issues
Increase timeout values in environment configuration:
```json
{
  "env": {
    "MCP_TIMEOUT": "60000"
  }
}
```

### Permission Configuration Problems

#### Tool Permission Denied
Check permission patterns in allow/deny lists:
```json
{
  "permissions": {
    "allow": [
      "Bash(npm:*)",     // Allows all npm commands
      "Edit(src/**)",    // Allows editing in src directory only
      "Read"             // Allows reading all files
    ]
  }
}
```

#### Directory Access Issues
Use additionalDirectories for custom paths:
```json
{
  "additionalDirectories": [
    ".context-kit/knowledge-graph",
    "custom-directory"
  ]
}
```

### Hooks System Debugging

#### Hook Script Not Executing
1. Verify hook script exists and is executable:
```bash
ls -la .claude/hooks/hooks.sh
chmod +x .claude/hooks/hooks.sh
```

2. Check hook configuration syntax:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/hooks.sh"
          }
        ]
      }
    ]
  }
}
```

#### Hook Script Errors
Debug hook execution:
```bash
# Test hook script manually
.claude/hooks/hooks.sh

# Check script output
bash -x .claude/hooks/hooks.sh
```

### Performance Issues

#### Slow Context Loading
Optimize ignore patterns:
```json
{
  "ignorePatterns": [
    "node_modules/**",
    ".git/**",
    "*.log",
    "dist/**",
    "build/**",
    ".next/**",
    "coverage/**"
  ]
}
```

#### Memory Usage
Configure caching and telemetry:
```json
{
  "env": {
    "DISABLE_PROMPT_CACHING": "0",
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1"
  }
}
```

## Best Practices

### Security-First Configuration
- Always include deny rules for dangerous operations
- Use specific path patterns rather than broad permissions
- Test configurations in isolated environments first

### Development Workflow
- Use balanced permissions for daily development
- Enable hooks for automated validation
- Configure MCP servers for enhanced capabilities

### Maintenance
- Regularly review and update permission lists
- Monitor hook script performance
- Keep MCP servers updated

## Conclusion

Claude Code's settings.local.json provides extensive configurability for autonomous coding operations. The most effective configurations balance broad capabilities with appropriate security boundaries. Key considerations include proper MCP server setup, thoughtful permission management, and robust hooks configuration for automated workflows.