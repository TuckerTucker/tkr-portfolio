# TKR Project Kit - Claude Code Hooks Documentation

## Overview
This document describes the pretool hook system set up for the TKR Project Kit to ensure the consolidated Project Kit MCP server is running before project operations.

## Hook Configuration

### Files Created:
- `.claude/hooks/hooks.sh` - Main hook script
- Updated `.claude/settings.local.json` - Hook configuration

### Hook Features:
1. **Auto-detection** of context-kit operations
2. **Automatic server startup** when needed
3. **Build verification** before server start
4. **Process monitoring** and PID management
5. **Logging** to `/tmp/tkr-context-kit.log`

## Supported Operations

The hook automatically activates for:

### MCP Tools:
- `create_entity` - Create new entities in the knowledge graph
- `create_relation` - Create relationships between entities
- `analyze_state_mutations` - Find state mutations for stores
- `trace_workflow` - Trace workflow execution paths
- `trace_user_flow` - Trace user interaction flows
- `analyze_impact` - Analyze impact of changes
- `find_patterns` - Find similar patterns across components
- `generate_code` - Generate code from patterns
- `validate_consistency` - Validate workflow consistency
- `search_entities` - Full-text search across the knowledge graph
- `get_component_dependencies` - Get component dependency graphs
- `analyze_state_patterns` - Analyze state management patterns
- `generate_test_scenarios` - Generate test scenarios for components
- `analyze_project` - Perform static code analysis
- `analyze_storybook` - Analyze Storybook stories and patterns
- `query` - Execute custom SQL queries
- `get_stats` - Get knowledge graph statistics
- `run_script` - Execute npm scripts across project modules
- `list_available_scripts` - Discover available scripts
- `start_dev_server` - Launch UI development server
- `build_ui` - Build production UI assets
- `run_tests` - Execute test suites
- `check_ports` - Verify port availability (42xxx range)
- `stop_services` - Gracefully stop running services

### Task Agent:
- Any Task using patterns like `knowledge-graph`, `analyze-project`, `storybook`, `state-mutation`, or `context-kit`

## Hook Behavior

When a context-kit operation is detected:

1. **Check if server running**: Uses `pgrep -f "context-kit"`
2. **Build if needed**: Runs `npm run build` in MCP directory
3. **Start server**: Launches consolidated MCP server in background
4. **Verify startup**: Confirms process started successfully
5. **Log activity**: Records server status and PID

## Manual Operations

### Start Server Manually:
```bash
cd .context-kit/mcp
npm run build
npm run start
```

### Check Server Status:
```bash
pgrep -f "context-kit"
```

### View Server Logs:
```bash
tail -f /tmp/tkr-context-kit.log
```

### Stop Server:
```bash
pkill -f "context-kit"
```

### Setup MCP Server:
```bash
.context-kit/scripts/setup-context-kit-mcp
```

## Permissions Added

The following permissions were added to `.claude/settings.local.json`:

```json
{
  "hooks": {
    "pretool": ".claude/hooks/hooks.sh"
  },
  "permissions": {
    "allow": [
      "Bash(node:*)",
      "Bash(npm:*)",
      "Bash(nohup:*)", 
      "Bash(pgrep:*)",
      "Bash(kill:*)",
      "Bash(sleep:*)",
      "mcp__context-kit__*"
    ]
  }
}
```

## Testing

### Test Hook Activation:
```bash
# These operations should trigger the hook
mcp__context-kit__create_entity
mcp__context-kit__analyze_project
mcp__context-kit__run_script
mcp__context-kit__start_dev_server
```

### Verify Hook Function:
The hook should display:
- `🧠 Project-kit operation detected`
- `🚀 Starting MCP Project Kit server...` (if not running)
- `✅ MCP Project Kit server started successfully`

## Troubleshooting

### Hook Not Running:
1. Verify `.claude/hooks/hooks.sh` is executable: `chmod +x .claude/hooks/hooks.sh`
2. Check settings.local.json has correct hook configuration
3. Ensure all required permissions are granted

### Server Won't Start:
1. Check if dependencies are installed: `cd .context-kit/mcp && npm install`
2. Verify build works: `npm run build`
3. Check for port conflicts or permission issues
4. Review logs at `/tmp/tkr-context-kit.log`
5. Run setup script: `.context-kit/scripts/setup-context-kit-mcp`

### MCP Tools Not Available:
1. Verify the MCP server is properly registered with Claude Code
2. Check Claude Code's MCP configuration at `.claude/claude_desktop_config.json`
3. Ensure the server is responding on the correct protocol (STDIO)
4. Restart Claude Code desktop app after configuration changes

### Script Execution Issues:
1. Ensure scripts are run from project root directory
2. Check that target module directories exist (e.g., `.context-kit/knowledge-graph/`)
3. Verify npm scripts exist in target module's package.json
4. Check working directory permissions

## Integration Benefits

This hook system provides:
- **Seamless Experience**: No manual server management required
- **Automatic Recovery**: Server restarts if needed
- **Development Efficiency**: Focus on project operations, not infrastructure
- **Error Prevention**: Catches missing server scenarios early
- **Logging**: Full audit trail of server operations
- **Consolidated Tools**: All context-kit functionality in one MCP server

## Architecture Changes

### MCP Consolidation Completed:
- **Old**: Separate knowledge-graph MCP server (`mcp__knowledge-graph__*`)
- **New**: Consolidated context-kit MCP server (`mcp__context-kit__*`)
- **Location**: `.context-kit/mcp/` (was `.context-kit/knowledge-graph/src/mcp/`)
- **Tools**: All knowledge graph + script execution + development tools

### Context7 Integration:
- Context7 MCP server remains separate and unchanged
- Tools: `mcp__context7__*` (third-party library resolution)
- No conflicts with consolidated context-kit server

## Future Enhancements

Potential improvements:
- Health checks and automatic restart on failure
- Configuration validation before server start
- Integration with Claude Code's native MCP management
- Multiple server environment support
- Performance monitoring and metrics collection
- Enhanced script execution with streaming output