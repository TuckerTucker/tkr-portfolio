#!/bin/bash

# TKR Project Kit - Port Management
# UI: 42001, API: 42003, MCP: 42005

UI_PORT=42001
API_PORT=42003
MCP_PORT=42005

echo "🔍 TKR Port Management - Checking ports ${UI_PORT}, ${API_PORT}, ${MCP_PORT}"

kill_port() {
    local port=$1
    local service_name=$2
    
    echo "🔍 Checking port $port for $service_name..."
    local pid=$(lsof -ti :$port)
    
    if [ -n "$pid" ]; then
        echo "❌ Port $port is in use by PID $pid - killing..."
        kill -9 $pid 2>/dev/null || true
        sleep 1
        
        # Verify it's dead
        if lsof -ti :$port >/dev/null 2>&1; then
            echo "⚠️  Failed to kill process on port $port"
            return 1
        else
            echo "✅ Successfully killed process on port $port"
        fi
    else
        echo "✅ Port $port is free"
    fi
}

start_services() {
    echo "🚀 Starting services..."
    
    # Start API server in background
    echo "📡 Starting Knowledge Graph API on port $API_PORT..."
    npm run dev:api > api.log 2>&1 &
    API_PID=$!
    echo "API Server PID: $API_PID"
    
    # Give it a moment to start
    sleep 2
    
    # Check if API started successfully
    if curl -s "http://localhost:$API_PORT/health" >/dev/null; then
        echo "✅ API Server is healthy on port $API_PORT"
    else
        echo "❌ API Server failed to start on port $API_PORT"
        echo "📋 API logs:"
        tail -10 api.log
        return 1
    fi
    
    echo "🎯 UI Server should be running on port $UI_PORT"
    echo "📋 Services status:"
    echo "   UI:  http://localhost:$UI_PORT (Vite)"
    echo "   API: http://localhost:$API_PORT (Knowledge Graph)"
}

stop_services() {
    echo "🛑 Stopping all TKR services..."
    kill_port $UI_PORT "UI Server"
    kill_port $API_PORT "API Server" 
    kill_port $MCP_PORT "MCP Server"
    
    # Clean up any tsx processes
    pkill -f "tsx.*knowledge-graph" || true
    pkill -f "vite" || true
    
    echo "✅ All services stopped"
}

case "$1" in
    "start")
        stop_services
        start_services
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        sleep 1
        start_services
        ;;
    "status")
        echo "📊 TKR Port Status:"
        lsof -i :$UI_PORT -i :$API_PORT -i :$MCP_PORT || echo "No services running"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        echo "Manages TKR Project Kit services on ports $UI_PORT, $API_PORT, $MCP_PORT"
        exit 1
        ;;
esac