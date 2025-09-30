#!/bin/bash
# Enhanced TKR Terminal Logger with buffering for early startup
# Buffers logs until service is available, then flushes them

# Enhanced Configuration
TKR_LOG_URL="${TKR_LOG_URL:-http://localhost:42003}"
TKR_LOG_SERVICE="${TKR_LOG_SERVICE:-Terminal}"
TKR_LOG_SERVICE_TYPE="${TKR_LOG_SERVICE_TYPE:-terminal}"
TKR_LOG_COMPONENT="${TKR_LOG_COMPONENT:-Shell}"
TKR_PROJECT_ROOT="${TKR_LOGGING_PROJECT_ROOT:-$(pwd)}"
TKR_LOGGING_ENABLED="${TKR_LOGGING_ENABLED:-true}"
TKR_LOG_BATCH_SIZE="${TKR_LOG_BATCH_SIZE:-10}"
TKR_LOG_MAX_BUFFER="${TKR_LOG_MAX_BUFFER:-100}"

# Performance optimization
TKR_LOG_BUFFER=()
TKR_LOG_COUNT=0
TKR_OFFLINE_BUFFER=()
TKR_SERVICE_AVAILABLE=false
TKR_LAST_CHECK_TIME=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Debug mode
TKR_DEBUG="${TKR_DEBUG:-false}"

# Check if service is available (with caching)
tkr_check_service() {
    local current_time=$(date +%s)
    local check_interval=5  # Check every 5 seconds

    # Use cached result if recent
    if [[ $((current_time - TKR_LAST_CHECK_TIME)) -lt $check_interval ]]; then
        return $([ "$TKR_SERVICE_AVAILABLE" == "true" ] && echo 0 || echo 1)
    fi

    TKR_LAST_CHECK_TIME=$current_time

    # Quick health check with 1 second timeout
    if curl -s --max-time 1 "$TKR_LOG_URL/health" > /dev/null 2>&1; then
        TKR_SERVICE_AVAILABLE=true

        # If service just became available, flush offline buffer
        if [[ ${#TKR_OFFLINE_BUFFER[@]} -gt 0 ]]; then
            [[ "$TKR_DEBUG" == "true" ]] && echo -e "${GREEN}[TKR] Service available, flushing ${#TKR_OFFLINE_BUFFER[@]} buffered logs${NC}" >&2
            tkr_flush_offline_buffer
        fi

        return 0
    else
        TKR_SERVICE_AVAILABLE=false
        return 1
    fi
}

# Flush offline buffer when service becomes available
tkr_flush_offline_buffer() {
    if [[ ${#TKR_OFFLINE_BUFFER[@]} -eq 0 ]]; then
        return 0
    fi

    local logs_array="["
    for ((i=0; i<${#TKR_OFFLINE_BUFFER[@]}; i++)); do
        logs_array+="${TKR_OFFLINE_BUFFER[i]}"
        if [[ $i -lt $((${#TKR_OFFLINE_BUFFER[@]}-1)) ]]; then
            logs_array+=","
        fi
    done
    logs_array+="]"

    local batch_json="{\"logs\": $logs_array}"

    # Send buffered logs
    {
        curl -s --max-time 5 \
             -X POST \
             -H "Content-Type: application/json" \
             -d "$batch_json" \
             "$TKR_LOG_URL/api/logs/batch" \
             > /dev/null 2>&1
    } &

    # Clear offline buffer
    TKR_OFFLINE_BUFFER=()
}

# Log function with buffering
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
    local timestamp=$(date +%s)000  # Convert to milliseconds

    # Convert level to lowercase for API
    local level_lower=$(echo "$level" | tr '[:upper:]' '[:lower:]')

    # Escape message for JSON
    local escaped_message=$(echo "$message" | sed 's/"/\\"/g' | sed 's/\\/\\\\/g' | tr '\n' ' ')

    # Build the log entry
    local log_entry="{
        \"id\": \"tkr-${timestamp}-$$-${RANDOM}\",
        \"timestamp\": $timestamp,
        \"level\": \"$level_lower\",
        \"service\": \"$TKR_LOG_SERVICE\",
        \"message\": \"$escaped_message\",
        \"component\": \"$component\",
        \"metadata\": $metadata
    }"

    # Check if service is available
    if tkr_check_service; then
        # Service available - add to regular buffer
        TKR_LOG_BUFFER+=("$log_entry")
        TKR_LOG_COUNT=$((TKR_LOG_COUNT + 1))

        # Flush if batch size reached
        if [[ $TKR_LOG_COUNT -ge $TKR_LOG_BATCH_SIZE ]]; then
            tkr_send_batch "${TKR_LOG_BUFFER[@]}"
            TKR_LOG_BUFFER=()
            TKR_LOG_COUNT=0
        fi
    else
        # Service not available - add to offline buffer
        TKR_OFFLINE_BUFFER+=("$log_entry")

        # Limit offline buffer size to prevent memory issues
        if [[ ${#TKR_OFFLINE_BUFFER[@]} -gt $TKR_LOG_MAX_BUFFER ]]; then
            # Remove oldest entry
            TKR_OFFLINE_BUFFER=("${TKR_OFFLINE_BUFFER[@]:1}")
            [[ "$TKR_DEBUG" == "true" ]] && echo -e "${YELLOW}[TKR] Offline buffer full, dropping oldest log${NC}" >&2
        fi

        [[ "$TKR_DEBUG" == "true" ]] && echo -e "${YELLOW}[TKR] Service unavailable, buffering log (${#TKR_OFFLINE_BUFFER[@]} in buffer)${NC}" >&2
    fi
}

# Send batch function (unchanged)
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

# Command logging function
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

    # Determine log level based on exit code
    local level="info"
    if [[ $exit_code -ne 0 ]]; then
        level="error"
    fi

    # Create metadata for command
    local metadata="{
        \"command\": \"$(echo "$command" | sed 's/"/\\"/g')\",
        \"exit_code\": $exit_code,
        \"duration\": $duration,
        \"pwd\": \"$PWD\",
        \"user\": \"$USER\"
    }"

    tkr_log "$level" "Command executed: $command" "Command" "$metadata"
}

# Periodic flush for buffered logs
tkr_flush_periodically() {
    while true; do
        sleep 5

        # Check service availability
        tkr_check_service

        # Flush regular buffer if needed
        if [[ ${#TKR_LOG_BUFFER[@]} -gt 0 ]] && [[ "$TKR_SERVICE_AVAILABLE" == "true" ]]; then
            tkr_send_batch "${TKR_LOG_BUFFER[@]}"
            TKR_LOG_BUFFER=()
            TKR_LOG_COUNT=0
        fi
    done
}

# Start periodic flush in background (only in interactive shells)
if [[ $- == *i* ]]; then
    (tkr_flush_periodically &) 2>/dev/null
fi

# Setup bash/zsh hooks for command capture (if interactive shell)
if [[ $- == *i* ]]; then
    if [[ -n "$BASH_VERSION" ]]; then
        # Bash setup
        tkr_preexec() {
            TKR_COMMAND_START=$(date +%s%N)
            TKR_CURRENT_COMMAND="$1"
        }

        tkr_precmd() {
            local exit_code=$?
            if [[ -n "$TKR_CURRENT_COMMAND" ]]; then
                local duration=0
                if [[ -n "$TKR_COMMAND_START" ]]; then
                    local end_time=$(date +%s%N)
                    duration=$(( (end_time - TKR_COMMAND_START) / 1000000 ))
                fi
                tkr_log_command "$TKR_CURRENT_COMMAND" "$exit_code" "$duration"
                unset TKR_CURRENT_COMMAND
                unset TKR_COMMAND_START
            fi
        }

        # Setup trap for command execution
        trap 'tkr_preexec "$BASH_COMMAND"' DEBUG
        PROMPT_COMMAND="${PROMPT_COMMAND:+$PROMPT_COMMAND$'\n'}tkr_precmd"

    elif [[ -n "$ZSH_VERSION" ]]; then
        # Zsh setup
        autoload -Uz add-zsh-hook

        tkr_preexec() {
            TKR_COMMAND_START=$(date +%s%N)
            TKR_CURRENT_COMMAND="$1"
        }

        tkr_precmd() {
            local exit_code=$?
            if [[ -n "$TKR_CURRENT_COMMAND" ]]; then
                local duration=0
                if [[ -n "$TKR_COMMAND_START" ]]; then
                    local end_time=$(date +%s%N)
                    duration=$(( (end_time - TKR_COMMAND_START) / 1000000 ))
                fi
                tkr_log_command "$TKR_CURRENT_COMMAND" "$exit_code" "$duration"
                unset TKR_CURRENT_COMMAND
                unset TKR_COMMAND_START
            fi
        }

        add-zsh-hook preexec tkr_preexec
        add-zsh-hook precmd tkr_precmd
    fi

    # Initial check and status message
    if tkr_check_service; then
        echo -e "${GREEN}✓ Terminal logging enabled and connected to $TKR_LOG_URL${NC}"
    else
        echo -e "${YELLOW}⚠ Terminal logging enabled (buffering - service not yet available)${NC}"
        echo -e "${YELLOW}  Logs will be sent once service starts at $TKR_LOG_URL${NC}"
    fi
else
    [[ "$TKR_DEBUG" == "true" ]] && echo -e "${CYAN}[TKR] Not an interactive shell, command capture disabled${NC}" >&2
fi

# Export functions for use
export -f tkr_log tkr_debug tkr_info tkr_warn tkr_error tkr_fatal tkr_log_command 2>/dev/null || true