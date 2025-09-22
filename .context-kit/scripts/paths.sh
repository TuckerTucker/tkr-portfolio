#!/bin/bash

# TKR Project Kit - Centralized Path Management
# Provides consistent path resolution for all scripts in the project

# Project structure constants
readonly PROJECT_NAME="tkr-context-kit"
readonly SCRIPTS_DIR_NAME=".context-kit/scripts"
readonly KNOWLEDGE_GRAPH_DIR_NAME=".context-kit/knowledge-graph"

# Function to find project root from any script location
find_project_root() {
    local current_dir="${1:-$(pwd)}"
    while [[ "$current_dir" != "/" ]]; do
        if [[ -f "$current_dir/.context-kit/_context-kit.yml" ]] || [[ -d "$current_dir/.git" ]]; then
            echo "$current_dir"
            return 0
        fi
        current_dir="$(dirname "$current_dir")"
    done
    echo "ERROR: Could not find project root" >&2
    return 1
}

# Get absolute paths - call this function to initialize all path variables
get_project_paths() {
    # Ensure constants are available (re-declare if needed due to scoping issues)
    local scripts_dir_name="${SCRIPTS_DIR_NAME:-.context-kit/scripts}"
    local knowledge_graph_dir_name="${KNOWLEDGE_GRAPH_DIR_NAME:-.context-kit/knowledge-graph}"
    
    # Use multiple strategies to find the project root
    local search_paths=(
        "${SCRIPT_DIR:-}"               # From utils.sh if available
        "$(pwd)"                        # Current working directory
        "$(dirname "${BASH_SOURCE[0]}")" # Script location (fallback)
    )
    
    local found_root=""
    for search_path in "${search_paths[@]}"; do
        if [[ -n "$search_path" ]]; then
            found_root="$(find_project_root "$search_path")"
            if [[ $? -eq 0 && -n "$found_root" ]]; then
                break
            fi
        fi
    done
    
    if [[ -z "$found_root" ]]; then
        echo "ERROR: Could not find project root from any search path" >&2
        return 1
    fi
    
    PROJECT_ROOT="$found_root"
    
    # Debug: Show what we're working with (uncomment for debugging)
    # echo "DEBUG: PROJECT_ROOT='$PROJECT_ROOT'" >&2
    # echo "DEBUG: scripts_dir_name='$scripts_dir_name'" >&2
    # echo "DEBUG: knowledge_graph_dir_name='$knowledge_graph_dir_name'" >&2
    
    # Export path variables for use in scripts
    export PROJECT_ROOT
    export SCRIPTS_DIR="$PROJECT_ROOT/$scripts_dir_name"
    export KNOWLEDGE_GRAPH_DIR="$PROJECT_ROOT/$knowledge_graph_dir_name"
    export PROJECT_CONFIG="$PROJECT_ROOT/.context-kit/_context-kit.yml"
    
    return 0
}

# Debug function to print all paths
debug_paths() {
    echo "=== TKR Project Kit Paths ==="
    echo "PROJECT_ROOT: $PROJECT_ROOT"
    echo "SCRIPTS_DIR: $SCRIPTS_DIR"
    echo "KNOWLEDGE_GRAPH_DIR: $KNOWLEDGE_GRAPH_DIR"
    echo "PROJECT_CONFIG: $PROJECT_CONFIG"
    echo "=========================="
}

# Compatibility functions for scripts that expect these legacy functions
get_script_dir() {
    echo "$SCRIPT_DIR"
}

get_project_root() {
    echo "$PROJECT_ROOT"
}