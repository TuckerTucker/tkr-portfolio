#!/bin/bash

# TKR Project Kit - Shared Utilities
# Common functions for all scripts in the project

# Self-locating script - find utils.sh absolute location regardless of how it's called
_locate_utils_and_paths() {
    # Strategy 1: Use BASH_SOURCE to find this script's location
    local source="${BASH_SOURCE[0]}"
    
    # Handle symlinks
    while [[ -h "$source" ]]; do
        local dir="$(cd -P "$(dirname "$source")" && pwd)"
        source="$(readlink "$source")"
        # If readlink gave us a relative path, make it absolute
        [[ $source != /* ]] && source="$dir/$source"
    done
    
    # Get the absolute directory containing utils.sh
    local utils_dir="$(cd -P "$(dirname "$source")" && pwd)"
    
    # Strategy 2: If that fails, try to find .context-kit/scripts from current location
    if [[ ! -f "$utils_dir/paths.sh" ]]; then
        # Search upward from current directory
        local search_dir="$(pwd)"
        while [[ "$search_dir" != "/" ]]; do
            if [[ -f "$search_dir/.context-kit/scripts/utils.sh" && -f "$search_dir/.context-kit/scripts/paths.sh" ]]; then
                utils_dir="$search_dir/.context-kit/scripts"
                break
            fi
            search_dir="$(dirname "$search_dir")"
        done
    fi
    
    # Strategy 3: If still not found, try to find from script location
    if [[ ! -f "$utils_dir/paths.sh" ]]; then
        echo "ERROR: Cannot locate paths.sh. Tried:" >&2
        echo "  - Script location: $utils_dir" >&2
        echo "  - Search from PWD: $(pwd)" >&2
        return 1
    fi
    
    # Export the script directory and source paths.sh
    export SCRIPT_DIR="$utils_dir"
    if ! source "$utils_dir/paths.sh"; then
        echo "ERROR: Failed to source paths.sh from $utils_dir" >&2
        return 1
    fi
    
    return 0
}

# Initialize the path system
if ! _locate_utils_and_paths; then
    echo "FATAL: Could not initialize TKR Project Kit path system" >&2
    return 1 2>/dev/null || exit 1
fi

# Validate required directories exist
validate_project_structure() {
    local required_paths=(
        "$PROJECT_ROOT"
        "$SCRIPTS_DIR" 
        "$KNOWLEDGE_GRAPH_DIR"
        "$PROJECT_CONFIG"
    )
    
    for path in "${required_paths[@]}"; do
        if [[ ! -e "$path" ]]; then
            echo "ERROR: Required path not found: $path" >&2
            return 1
        fi
    done
    
    return 0
}

# Safe path resolution with validation
resolve_path() {
    local relative_path="$1"
    local base_path="${2:-$PROJECT_ROOT}"
    
    if [[ ! -d "$base_path" ]]; then
        echo "ERROR: Base path does not exist: $base_path" >&2
        return 1
    fi
    
    local resolved="$(cd "$base_path" && cd "$relative_path" 2>/dev/null && pwd)"
    if [[ $? -ne 0 ]]; then
        echo "ERROR: Cannot resolve path: $relative_path from $base_path" >&2
        return 1
    fi
    
    echo "$resolved"
}

# Get the directory containing the current script
get_script_dir() {
    echo "${SCRIPT_DIR:-$(dirname "${BASH_SOURCE[0]}")}"
}

# Get the project root directory
get_project_root() {
    if [[ -n "$PROJECT_ROOT" ]]; then
        echo "$PROJECT_ROOT"
    else
        # Initialize if not already done
        if get_project_paths >/dev/null 2>&1; then
            echo "$PROJECT_ROOT"
        else
            echo "ERROR: Could not determine project root" >&2
            return 1
        fi
    fi
}

# Initialize project environment
init_project_env() {
    # Safety check - ensure we have the functions we need
    if ! command -v get_project_paths >/dev/null 2>&1; then
        echo "ERROR: get_project_paths function not available - paths.sh may not be sourced correctly" >&2
        return 1
    fi
    
    # Initialize paths
    if ! get_project_paths; then
        echo "ERROR: Failed to initialize project paths" >&2
        echo "DEBUG: SCRIPT_DIR=${SCRIPT_DIR:-not_set}" >&2
        echo "DEBUG: PWD=$(pwd)" >&2
        return 1
    fi

    # Validate project structure
    if ! validate_project_structure; then
        echo "ERROR: Invalid project structure" >&2
        debug_paths
        return 1
    fi
    
    return 0
}

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Print colored output
print_status() {
    local status="$1"
    local message="$2"
    local color=""
    
    case "$status" in
        "success") color='\033[0;32m' ;;  # Green
        "error")   color='\033[0;31m' ;;  # Red
        "warning") color='\033[1;33m' ;;  # Yellow
        "info")    color='\033[0;36m' ;;  # Cyan
        *)         color='\033[0m' ;;     # No color
    esac
    
    echo -e "${color}${message}\033[0m"
}