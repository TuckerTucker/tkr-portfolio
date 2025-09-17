#!/bin/bash

# Port conflict detection utility for tkr-context-kit development
# Checks availability of ports in the 42xxx range before starting services

set -e

# Source shared utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils.sh"

# Initialize project environment
if ! init_project_env; then
    print_status "error" "Failed to initialize project environment"
    exit 1
fi

# Default ports from tkr-context-kit port allocation
PORTS_TO_CHECK=(
    42001  # Dashboard
    42003  # Knowledge Graph API
    42005  # Logging Service
    42007  # MCP Tools
)

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1  # Port is in use
    else
        return 0  # Port is available
    fi
}

# Function to find process using port
get_port_process() {
    local port=$1
    lsof -Pi :$port -sTCP:LISTEN | tail -n +2 | awk '{print $2, $1}' | head -1
}

# Parse command line arguments
YAML_FILE=""
VERBOSE=false
FIX_CONFLICTS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --yaml|-y)
            YAML_FILE="$2"
            shift 2
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --fix|-f)
            FIX_CONFLICTS=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --yaml, -y FILE    Read port configuration from _context-kit.yml"
            echo "  --verbose, -v      Show detailed output"
            echo "  --fix, -f          Attempt to suggest alternative ports"
            echo "  --help, -h         Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Use project config if no YAML file specified
if [[ -z "$YAML_FILE" ]] && [[ -f "$PROJECT_CONFIG" ]]; then
    YAML_FILE="$PROJECT_CONFIG"
fi

# Read ports from YAML if specified
if [[ -n "$YAML_FILE" ]] && [[ -f "$YAML_FILE" ]]; then
    if command -v yq >/dev/null 2>&1; then
        # Extract ports from YAML using yq
        YAML_PORTS=$(yq eval '.development.ports.services | to_entries | .[].value' "$YAML_FILE" 2>/dev/null || true)
        if [[ -n "$YAML_PORTS" ]]; then
            PORTS_TO_CHECK=()
            while IFS= read -r port; do
                if [[ "$port" =~ ^[0-9]+$ ]]; then
                    PORTS_TO_CHECK+=("$port")
                fi
            done <<< "$YAML_PORTS"
        fi
    else
        print_status "warning" "yq not found. Install with: brew install yq"
        print_status "info" "Using default port list..."
    fi
fi

echo "🔍 Checking port availability for tkr-context-kit development..."
echo

CONFLICTS=()
AVAILABLE=()

for port in "${PORTS_TO_CHECK[@]}"; do
    if check_port "$port"; then
        AVAILABLE+=("$port")
        if [[ "$VERBOSE" == "true" ]]; then
            print_status "success" "✓ Port $port is available"
        fi
    else
        CONFLICTS+=("$port")
        PROCESS_INFO=$(get_port_process "$port")
        print_status "error" "✗ Port $port is in use by: $PROCESS_INFO"
    fi
done

echo
echo "📊 Summary:"
print_status "success" "  Available ports: ${AVAILABLE[*]}"
if [[ ${#CONFLICTS[@]} -gt 0 ]]; then
    print_status "error" "  Conflicting ports: ${CONFLICTS[*]}"
    
    if [[ "$FIX_CONFLICTS" == "true" ]]; then
        echo
        echo "🔧 Suggested alternatives:"
        for port in "${CONFLICTS[@]}"; do
            # Find next available port in the same range
            case $port in
                4200[0-9])
                    RANGE_START=42001
                    RANGE_END=42099
                    ;;
                4210[0-9])
                    RANGE_START=42100
                    RANGE_END=42199
                    ;;
                4220[0-9])
                    RANGE_START=42200
                    RANGE_END=42299
                    ;;
                *)
                    RANGE_START=$((port + 1))
                    RANGE_END=$((port + 100))
                    ;;
            esac
            
            for ((alt_port=RANGE_START; alt_port<=RANGE_END; alt_port++)); do
                if check_port "$alt_port"; then
                    echo "  Port $port → $alt_port"
                    break
                fi
            done
        done
    fi
    
    echo
    echo "💡 To resolve conflicts:"
    echo "  • Stop services using conflicting ports"
    echo "  • Update your _context-kit.yml with alternative ports"
    echo "  • Use --fix flag to see suggested alternatives"
    
    exit 1
else
    print_status "success" "  ✅ All ports are available!"
fi