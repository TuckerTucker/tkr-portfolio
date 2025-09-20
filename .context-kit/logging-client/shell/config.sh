#!/bin/bash
# TKR Context Kit - Shell Logging Configuration
# Configuration variables for terminal logging system

# ==============================================================================
# ENDPOINT CONFIGURATION
# ==============================================================================

# Default HTTP endpoint for log submission
export TKR_LOG_ENDPOINT="${TKR_LOG_ENDPOINT:-http://localhost:42003/api/logs}"

# Batch endpoint for multiple log entries
export TKR_LOG_BATCH_ENDPOINT="${TKR_LOG_BATCH_ENDPOINT:-http://localhost:42003/api/logs/batch}"

# Health check endpoint
export TKR_LOG_HEALTH_ENDPOINT="${TKR_LOG_HEALTH_ENDPOINT:-http://localhost:42003/health}"

# ==============================================================================
# LOG LEVEL CONFIGURATION
# ==============================================================================

# Minimum log level to capture (DEBUG, INFO, WARN, ERROR, FATAL)
export TKR_LOG_LEVEL="${TKR_LOG_LEVEL:-INFO}"

# Log levels priority mapping (compatibility with older bash)
if [[ "${BASH_VERSINFO[0]}" -ge 4 ]]; then
    declare -A TKR_LOG_LEVELS=(
        ["DEBUG"]=0
        ["INFO"]=1
        ["WARN"]=2
        ["ERROR"]=3
        ["FATAL"]=4
    )
else
    # Fallback for bash < 4.0
    TKR_LOG_LEVELS_DEBUG=0
    TKR_LOG_LEVELS_INFO=1
    TKR_LOG_LEVELS_WARN=2
    TKR_LOG_LEVELS_ERROR=3
    TKR_LOG_LEVELS_FATAL=4
fi

# ==============================================================================
# BATCHING CONFIGURATION
# ==============================================================================

# Number of logs to batch before sending (1-100)
export TKR_LOG_BATCH_SIZE="${TKR_LOG_BATCH_SIZE:-10}"

# Milliseconds between batch flushes (1000-60000)
export TKR_LOG_FLUSH_INTERVAL="${TKR_LOG_FLUSH_INTERVAL:-5000}"

# Maximum time to wait for batch completion (seconds)
export TKR_LOG_BATCH_TIMEOUT="${TKR_LOG_BATCH_TIMEOUT:-30}"

# ==============================================================================
# BEHAVIOR CONFIGURATION
# ==============================================================================

# Master switch for logging
export TKR_LOG_ENABLED="${TKR_LOG_ENABLED:-true}"

# Only log in directories with .context-kit
export TKR_LOG_PROJECT_ONLY="${TKR_LOG_PROJECT_ONLY:-true}"

# Show prompt indicator when logging is active
export TKR_LOG_SHOW_INDICATOR="${TKR_LOG_SHOW_INDICATOR:-true}"

# Capture command output for logging
export TKR_LOG_CAPTURE_OUTPUT="${TKR_LOG_CAPTURE_OUTPUT:-true}"

# Log successful commands (not just errors)
export TKR_LOG_SUCCESS_COMMANDS="${TKR_LOG_SUCCESS_COMMANDS:-true}"

# ==============================================================================
# COMMAND MONITORING
# ==============================================================================

# Commands to monitor (space-separated)
export TKR_LOG_MONITORED_COMMANDS="${TKR_LOG_MONITORED_COMMANDS:-npm yarn git node tsx ts-node}"

# Pattern to exclude from logging (regex)
export TKR_LOG_EXCLUDE_PATTERN="${TKR_LOG_EXCLUDE_PATTERN:-node_modules|\.git|dist|build}"

# ==============================================================================
# NETWORK CONFIGURATION
# ==============================================================================

# HTTP request timeout (seconds)
export TKR_LOG_HTTP_TIMEOUT="${TKR_LOG_HTTP_TIMEOUT:-5}"

# Maximum retries for failed requests
export TKR_LOG_MAX_RETRIES="${TKR_LOG_MAX_RETRIES:-3}"

# Retry delay multiplier (seconds)
export TKR_LOG_RETRY_DELAY="${TKR_LOG_RETRY_DELAY:-1}"

# ==============================================================================
# DEBUG CONFIGURATION
# ==============================================================================

# Enable debug output to stderr
export TKR_LOG_DEBUG="${TKR_LOG_DEBUG:-false}"

# Log file for debugging (empty = no file logging)
export TKR_LOG_DEBUG_FILE="${TKR_LOG_DEBUG_FILE:-}"

# ==============================================================================
# VISUAL INDICATORS
# ==============================================================================

# Prompt indicator emoji/text
export TKR_LOG_INDICATOR="${TKR_LOG_INDICATOR:-📝}"

# Color codes for log levels
export TKR_LOG_COLOR_DEBUG="${TKR_LOG_COLOR_DEBUG:-\033[0;36m}"    # Cyan
export TKR_LOG_COLOR_INFO="${TKR_LOG_COLOR_INFO:-\033[0;32m}"      # Green
export TKR_LOG_COLOR_WARN="${TKR_LOG_COLOR_WARN:-\033[1;33m}"      # Yellow
export TKR_LOG_COLOR_ERROR="${TKR_LOG_COLOR_ERROR:-\033[0;31m}"    # Red
export TKR_LOG_COLOR_FATAL="${TKR_LOG_COLOR_FATAL:-\033[1;31m}"    # Bold Red
export TKR_LOG_COLOR_RESET="${TKR_LOG_COLOR_RESET:-\033[0m}"       # Reset

# ==============================================================================
# SESSION CONFIGURATION
# ==============================================================================

# Generate session ID for this shell session
if [[ -z "$TKR_LOG_SESSION_ID" ]]; then
    if command -v uuidgen >/dev/null 2>&1; then
        export TKR_LOG_SESSION_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
    else
        # Fallback: timestamp + random
        export TKR_LOG_SESSION_ID="session-$(date +%s)-$RANDOM"
    fi
fi

# ==============================================================================
# VALIDATION FUNCTIONS
# ==============================================================================

# Validate log level
tkr_validate_log_level() {
    local level="$1"
    case "$level" in
        DEBUG|INFO|WARN|ERROR|FATAL) return 0 ;;
        *) return 1 ;;
    esac
}

# Validate batch size
tkr_validate_batch_size() {
    local size="$1"
    if [[ "$size" =~ ^[0-9]+$ ]] && [ "$size" -ge 1 ] && [ "$size" -le 100 ]; then
        return 0
    else
        return 1
    fi
}

# Validate endpoint URL
tkr_validate_endpoint() {
    local url="$1"
    if [[ "$url" =~ ^https?://[^[:space:]]+$ ]]; then
        return 0
    else
        return 1
    fi
}

# ==============================================================================
# ENVIRONMENT VALIDATION
# ==============================================================================

# Run validation on load
if [[ "$TKR_LOG_ENABLED" == "true" ]]; then
    # Validate critical configuration
    if ! tkr_validate_log_level "$TKR_LOG_LEVEL"; then
        echo "Warning: Invalid TKR_LOG_LEVEL '$TKR_LOG_LEVEL', using INFO" >&2
        export TKR_LOG_LEVEL="INFO"
    fi

    if ! tkr_validate_batch_size "$TKR_LOG_BATCH_SIZE"; then
        echo "Warning: Invalid TKR_LOG_BATCH_SIZE '$TKR_LOG_BATCH_SIZE', using 10" >&2
        export TKR_LOG_BATCH_SIZE="10"
    fi

    if ! tkr_validate_endpoint "$TKR_LOG_ENDPOINT"; then
        echo "Warning: Invalid TKR_LOG_ENDPOINT '$TKR_LOG_ENDPOINT', disabling logging" >&2
        export TKR_LOG_ENABLED="false"
    fi
fi