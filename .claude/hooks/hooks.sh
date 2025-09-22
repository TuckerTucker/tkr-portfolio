#!/bin/bash

# TKR Project Kit - Claude Code Hooks
# Ensures the TKR Project Kit Context Kit MCP server is running before using context kit tools
# Updated for the comprehensive context kit system at .context-kit/knowledge-graph

# Configuration for our context kit MCP server
readonly TKR_PROJECT_ROOT=$CLAUDE_PROJECT_DIR
readonly TKR_KG_DIR="$TKR_PROJECT_ROOT/.context-kit/knowledge-graph"
readonly TKR_KG_LOG="/tmp/tkr-context-kit.log"
readonly TKR_KG_PID="/tmp/tkr-context-kit.pid"

# Check if our context kit MCP server is running
is_tkr_kg_server_running() {
    # Check by process name pattern
    if pgrep -f "tkr-context-kit" > /dev/null; then
        return 0
    fi
    
    # Check by PID file if it exists
    if [ -f "$TKR_KG_PID" ]; then
        local stored_pid=$(cat "$TKR_KG_PID" 2>/dev/null)
        if [ -n "$stored_pid" ] && kill -0 "$stored_pid" 2>/dev/null; then
            return 0
        fi
    fi
    
    return 1
}

# Check if this is a context kit related tool call
check_knowledge_graph_tool() {
    local tool_name="$1"
    local tool_args="$2"
    
    # Check for context kit MCP tools
    case "$tool_name" in
        "create_entity"|"create_relation"|"analyze_state_mutations"|"trace_workflow"|"trace_user_flow"|"analyze_impact"|"find_patterns"|"generate_code"|"validate_consistency"|"search_entities"|"get_component_dependencies"|"analyze_state_patterns"|"generate_test_scenarios"|"analyze_project"|"analyze_storybook"|"query"|"get_stats")
            return 0  # This is a context kit tool
            ;;
        "Task")
            # Check if the task involves context kit analysis
            if echo "$tool_args" | grep -q -E "(context.?kit|analyze.?project|storybook|state.?mutation)"; then
                return 0  # This task likely uses the context kit
            fi
            ;;
    esac
    
    return 1  # Not a context kit tool
}

# Start the context kit MCP server if not running  
start_tkr_kg_server() {
    # Check if server is already running
    if is_tkr_kg_server_running; then
        echo "✅ TKR Context Kit MCP server is already running"
        return 0
    fi
    
    echo "🚀 Starting Context Kit MCP server..."
    
    # Ensure the server is built
    if [ ! -f "$TKR_KG_DIR/dist/mcp/cli.js" ]; then
        echo "📦 Building Context Kit system..."
        cd "$TKR_KG_DIR" && npm run build
        if [ $? -ne 0 ]; then
            echo "❌ Failed to build Context Kit system"
            return 1
        fi
    fi
    
    # Start the MCP server
    cd "$TKR_KG_DIR"
    
    # Use the npm script to start the MCP server
    nohup npm run mcp-server > "$TKR_KG_LOG" 2>&1 &
    local server_pid=$!
    
    # Store PID
    echo $server_pid > "$TKR_KG_PID"
    
    # Wait for server to start
    sleep 2
    
    # Verify the server started
    if kill -0 $server_pid 2>/dev/null; then
        echo "✅ Context Kit MCP server started (PID: $server_pid)"
        echo "📝 Logs: $TKR_KG_LOG"
        return 0
    else
        echo "❌ Failed to start Context Kit MCP server"
        echo "📝 Check logs: $TKR_KG_LOG"
        return 1
    fi
}

# Pretool hook - called before every tool execution
pretool_hook() {
    local tool_name="$1"
    local tool_args="$2"
    
    # Only act on context kit related tools
    if check_knowledge_graph_tool "$tool_name" "$tool_args"; then
        echo "🧠 Context kit operation detected: $tool_name"
        
        # Ensure MCP server is running
        if ! start_tkr_kg_server; then
            echo "⚠️  Warning: MCP server failed to start, context kit operations may not work"
            echo "💡 Try running: cd .context-kit/knowledge-graph && npm run build && npm run mcp-server"
        fi
    fi
}

# Main hook execution
case "${HOOK_TYPE:-pretool}" in
    "pretool")
        pretool_hook "$@"
        ;;
    *)
        # Default behavior for other hook types
        ;;
esac