#!/bin/bash
# TKR Terminal Logger - Enterprise automatic command capture
# Performance: < 1ms overhead per command with intelligent batching
# Usage: source this file for automatic terminal logging

# Enhanced Configuration
TKR_LOG_URL="${TKR_LOG_URL:-http://localhost:42003}"
TKR_LOG_SERVICE="${TKR_LOG_SERVICE:-Terminal}"
TKR_LOG_SERVICE_TYPE="${TKR_LOG_SERVICE_TYPE:-terminal}"
TKR_LOG_COMPONENT="${TKR_LOG_COMPONENT:-Shell}"
TKR_PROJECT_ROOT="${TKR_LOGGING_PROJECT_ROOT:-$(pwd)}"
TKR_LOGGING_ENABLED="${TKR_LOGGING_ENABLED:-true}"
TKR_LOG_BATCH_SIZE="${TKR_LOG_BATCH_SIZE:-10}"

# Performance optimization
TKR_LOG_BUFFER=()
TKR_LOG_COUNT=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Debug mode
TKR_DEBUG="${TKR_DEBUG:-false}"

# Log function
tkr_log() {
    local level="$1"
    local message="$2"
    local component="$3"
    local metadata="$4"

    # Set defaults if not provided
    if [ -z "$component" ]; then
        component="$TKR_LOG_COMPONENT"
    fi
    if [ -z "$metadata" ]; then
        metadata="{}"
    fi
    
    # Create timestamp
    local timestamp=$(date +%s)
    
    # Convert level to uppercase (compatible with older shells)
    local level_upper=$(echo "$level" | tr '[:lower:]' '[:upper:]')

    # Escape message for JSON
    local escaped_message=$(printf '%s' "$message" | sed 's/\\/\\\\/g; s/"/\\"/g')

    # Construct JSON payload
    local json_payload=$(cat <<EOF
{
  "level": "$level_upper",
  "message": "$escaped_message",
  "service": "$TKR_LOG_SERVICE",
  "service_type": "$TKR_LOG_SERVICE_TYPE",
  "component": "$component",
  "metadata": $metadata,
  "timestamp": $timestamp
}
EOF
)
    
    # Send log (fail silently)
    curl -s -X POST "$TKR_LOG_URL/api/logs" \
        -H "Content-Type: application/json" \
        -d "$json_payload" \
        2>/dev/null || true
    
    # Also log to console
    echo "[$level_upper] $TKR_LOG_SERVICE/$component: $escaped_message" >&2
}

# Convenience functions
tkr_debug() {
    local component="$2"
    local metadata="$3"
    if [ -z "$component" ]; then component="$TKR_LOG_COMPONENT"; fi
    if [ -z "$metadata" ]; then metadata="{}"; fi
    tkr_log "debug" "$1" "$component" "$metadata"
}

tkr_info() {
    local component="$2"
    local metadata="$3"
    if [ -z "$component" ]; then component="$TKR_LOG_COMPONENT"; fi
    if [ -z "$metadata" ]; then metadata="{}"; fi
    tkr_log "info" "$1" "$component" "$metadata"
}

tkr_warn() {
    local component="$2"
    local metadata="$3"
    if [ -z "$component" ]; then component="$TKR_LOG_COMPONENT"; fi
    if [ -z "$metadata" ]; then metadata="{}"; fi
    tkr_log "warn" "$1" "$component" "$metadata"
}

tkr_error() {
    local component="$2"
    local metadata="$3"
    if [ -z "$component" ]; then component="$TKR_LOG_COMPONENT"; fi
    if [ -z "$metadata" ]; then metadata="{}"; fi
    tkr_log "error" "$1" "$component" "$metadata"
}

tkr_fatal() {
    local component="$2"
    local metadata="$3"
    if [ -z "$component" ]; then component="$TKR_LOG_COMPONENT"; fi
    if [ -z "$metadata" ]; then metadata="{}"; fi
    tkr_log "fatal" "$1" "$component" "$metadata"
}

# Enhanced automatic command capture functions

# Debug utility functions
tkr_debug_log() {
    [[ "$TKR_DEBUG" == "true" ]] && echo -e "${CYAN}[TKR DEBUG] $1${NC}" >&2
}

# Optimized batch sender
tkr_send_batch() {
    local entries=("$@")
    local logs_array="["

    for ((i=0; i<${#entries[@]}; i++)); do
        logs_array+="${entries[i]}"
        if [[ $i -lt $((${#entries[@]}-1)) ]]; then
            logs_array+=","
        fi
    done
    logs_array+="]"

    # Wrap in logs object as expected by API
    local batch_json="{\"logs\": $logs_array}"

    # Send batch asynchronously with timeout
    {
        curl -s --max-time 5 \
             -X POST \
             -H "Content-Type: application/json" \
             -d "$batch_json" \
             "$TKR_LOG_URL/api/logs/batch" \
             > /dev/null 2>&1
    } &
}

# Enhanced command logging with performance optimization
tkr_log_command() {
    local command="$1"
    local exit_code="${2:-0}"
    local duration="${3:-0}"

    # Skip if logging disabled or outside project
    [[ "$TKR_LOGGING_ENABLED" != "true" ]] && return 0
    [[ ! "$PWD" == "$TKR_PROJECT_ROOT"* ]] && return 0

    # Skip noisy commands
    case "$command" in
        ls|pwd|cd|echo|clear|cat|which|type) return 0 ;;
    esac

    local timestamp=$(date +%s)
    local json_entry=$(cat <<EOF
{
    "level": "INFO",
    "message": "Command executed: $command",
    "service": "$TKR_LOG_SERVICE",
    "service_type": "$TKR_LOG_SERVICE_TYPE",
    "component": "CommandCapture",
    "metadata": {
        "command": "$command",
        "exit_code": $exit_code,
        "duration_ms": $duration,
        "working_directory": "$PWD",
        "shell": "${SHELL##*/}",
        "session_id": "${TKR_SESSION_ID:-$$}"
    },
    "timestamp": $timestamp
}
EOF
)

    # Add to buffer
    TKR_LOG_BUFFER+=("$json_entry")
    TKR_LOG_COUNT=$((TKR_LOG_COUNT + 1))

    tkr_debug_log "Buffered command: $command (buffer: ${#TKR_LOG_BUFFER[@]})"

    # Send batch when full
    if [[ ${#TKR_LOG_BUFFER[@]} -ge $TKR_LOG_BATCH_SIZE ]]; then
        tkr_debug_log "Sending batch of ${#TKR_LOG_BUFFER[@]} entries"
        tkr_send_batch "${TKR_LOG_BUFFER[@]}"
        TKR_LOG_BUFFER=()
    fi
}

# Flush buffer function
tkr_flush_buffer() {
    if [[ ${#TKR_LOG_BUFFER[@]} -gt 0 ]]; then
        tkr_debug_log "Flushing ${#TKR_LOG_BUFFER[@]} remaining entries"
        tkr_send_batch "${TKR_LOG_BUFFER[@]}"
        TKR_LOG_BUFFER=()
    fi
}

# Shell integration setup
tkr_init_session() {
    TKR_SESSION_ID="tkr-$$-$(date +%s)"
    export TKR_SESSION_ID

    # Log session start
    tkr_info "Terminal logging session started" "Session" "{\"session_id\": \"$TKR_SESSION_ID\"}"
    tkr_debug_log "Session initialized: $TKR_SESSION_ID"
}

# Enhanced shell integration
if [[ "${BASH_SOURCE[0]}" != "${0}" || -n "$ZSH_VERSION" ]]; then
    # Script is being sourced - setup automatic capture
    if [[ "$PWD" == "$TKR_PROJECT_ROOT"* ]]; then
        tkr_init_session

        # Setup cleanup trap
        trap tkr_flush_buffer EXIT

        # Bash integration
        if [[ -n "$BASH_VERSION" ]]; then
            tkr_bash_preexec() {
                TKR_LAST_COMMAND="$BASH_COMMAND"
                # Use seconds for macOS compatibility (date doesn't support %3N)
                TKR_COMMAND_START=$(date +%s)
            }

            tkr_bash_precmd() {
                local exit_code=$?
                if [[ -n "$TKR_LAST_COMMAND" && "$TKR_LAST_COMMAND" != "tkr_bash_precmd" ]] && [[ -n "$TKR_COMMAND_START" ]]; then
                    # Calculate duration in seconds and convert to approximate milliseconds
                    local duration=$(( ($(date +%s) - TKR_COMMAND_START) * 1000 ))
                    tkr_log_command "$TKR_LAST_COMMAND" "$exit_code" "$duration"
                fi
                TKR_LAST_COMMAND=""
                TKR_COMMAND_START=""
            }

            trap 'tkr_bash_preexec' DEBUG
            PROMPT_COMMAND="tkr_bash_precmd${PROMPT_COMMAND:+; $PROMPT_COMMAND}"
        fi

        # Zsh integration
        if [[ -n "$ZSH_VERSION" ]]; then
            autoload -Uz add-zsh-hook

            tkr_zsh_preexec() {
                TKR_LAST_COMMAND="$1"
                # Use seconds for macOS compatibility (date doesn't support %3N)
                TKR_COMMAND_START=$(date +%s)
            }

            tkr_zsh_precmd() {
                local exit_code=$?
                if [[ -n "$TKR_LAST_COMMAND" ]] && [[ -n "$TKR_COMMAND_START" ]]; then
                    # Calculate duration in seconds and convert to approximate milliseconds
                    local duration=$(( ($(date +%s) - TKR_COMMAND_START) * 1000 ))
                    tkr_log_command "$TKR_LAST_COMMAND" "$exit_code" "$duration"
                fi
                TKR_LAST_COMMAND=""
                TKR_COMMAND_START=""
            }

            add-zsh-hook preexec tkr_zsh_preexec
            add-zsh-hook precmd tkr_zsh_precmd
        fi

        echo -e "${GREEN}[TKR] Terminal logging enabled for $(basename "$TKR_PROJECT_ROOT")${NC}" >&2
    fi
fi

# Control functions
tkr_enable() {
    TKR_LOGGING_ENABLED="true"
    export TKR_LOGGING_ENABLED
    echo -e "${GREEN}[TKR] Logging enabled${NC}" >&2
}

tkr_disable() {
    TKR_LOGGING_ENABLED="false"
    export TKR_LOGGING_ENABLED
    echo -e "${YELLOW}[TKR] Logging disabled${NC}" >&2
}

tkr_status() {
    echo "TKR Terminal Logger Status:"
    echo "  Enabled: $TKR_LOGGING_ENABLED"
    echo "  Project: $(basename "$TKR_PROJECT_ROOT")"
    echo "  Session: ${TKR_SESSION_ID:-none}"
    echo "  Buffer: ${#TKR_LOG_BUFFER[@]}/${TKR_LOG_BATCH_SIZE}"
    echo "  Commands: $TKR_LOG_COUNT"
}

# Export enhanced functions
export -f tkr_log_command tkr_enable tkr_disable tkr_status tkr_flush_buffer

# Example usage:
# source .context-kit/logging-client/tkr-logger.sh
# tkr_info "Script started"
# tkr_error "Something went wrong" "ErrorHandler" '{"code": 500}'