#!/usr/bin/env bash
# TKR Context Kit - Terminal Logging System
# Captures command output with project-aware activation

# Source configuration
# Try to determine script directory using multiple methods
if [[ -n "${BASH_SOURCE[0]}" && "${BASH_SOURCE[0]}" != "${0}" ]]; then
    # Script is being sourced
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
elif [[ -n "${ZSH_VERSION}" ]]; then
    # Zsh support - use a different approach
    if [[ -n "${0}" ]]; then
        SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
    else
        SCRIPT_DIR="$(pwd)"
    fi
else
    # Fallback: look for config.sh in likely locations
    for dir in "$(pwd)/.context-kit/shell" "$(dirname "$0")" "$(pwd)"; do
        if [[ -f "$dir/config.sh" ]]; then
            SCRIPT_DIR="$dir"
            break
        fi
    done
fi

if [[ -f "$SCRIPT_DIR/config.sh" ]]; then
    source "$SCRIPT_DIR/config.sh"
else
    echo "Error: Cannot find config.sh. Tried: $SCRIPT_DIR" >&2
    return 1 2>/dev/null || exit 1
fi

# ==============================================================================
# GLOBAL VARIABLES
# ==============================================================================

# Batch storage
declare -a TKR_LOG_BATCH=()
declare TKR_LOG_BATCH_COUNT=0
declare TKR_LOG_LAST_FLUSH=0

# Process ID for unique temp files
TKR_LOG_PID="$$"

# Debug function
tkr_debug() {
    if [[ "$TKR_LOG_DEBUG" == "true" ]]; then
        echo "[TKR-DEBUG] $*" >&2
        if [[ -n "$TKR_LOG_DEBUG_FILE" ]]; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$TKR_LOG_DEBUG_FILE"
        fi
    fi
}

# ==============================================================================
# PROJECT DETECTION
# ==============================================================================

# Check if logging should be active in current directory
tkr_should_log() {
    # Check master switch
    if [[ "$TKR_LOG_ENABLED" != "true" ]]; then
        return 1
    fi

    # If project-only mode is disabled, always log
    if [[ "$TKR_LOG_PROJECT_ONLY" != "true" ]]; then
        return 0
    fi

    # Look for .context-kit directory in current path
    local dir="$PWD"
    while [[ "$dir" != "/" ]]; do
        if [[ -d "$dir/.context-kit" ]]; then
            tkr_debug "Found .context-kit in: $dir"
            return 0
        fi
        dir="$(dirname "$dir")"
    done

    tkr_debug "No .context-kit found, logging disabled"
    return 1
}

# ==============================================================================
# LOG LEVEL HANDLING
# ==============================================================================

# Check if log level should be captured
tkr_should_capture_level() {
    local level="$1"
    local current_level="$TKR_LOG_LEVEL"

    # Get priority levels (with compatibility fallback)
    local level_priority current_priority

    if [[ "${BASH_VERSINFO[0]}" -ge 4 ]] && [[ -n "${TKR_LOG_LEVELS["$level"]:-}" ]]; then
        level_priority="${TKR_LOG_LEVELS[$level]}"
        current_priority="${TKR_LOG_LEVELS[$current_level]}"
    else
        # Fallback method for older bash (core module compatible)
        case "$level" in
            debug|DEBUG) level_priority=0 ;;
            info|INFO) level_priority=1 ;;
            warn|WARN) level_priority=2 ;;
            error|ERROR) level_priority=3 ;;
            fatal|FATAL) level_priority=4 ;;
            *) level_priority=1 ;;
        esac

        case "$current_level" in
            debug|DEBUG) current_priority=0 ;;
            info|INFO) current_priority=1 ;;
            warn|WARN) current_priority=2 ;;
            error|ERROR) current_priority=3 ;;
            fatal|FATAL) current_priority=4 ;;
            *) current_priority=1 ;;
        esac
    fi

    # Capture if level priority >= current priority
    [[ "$level_priority" -ge "$current_priority" ]]
}

# ==============================================================================
# LOG BATCHING SYSTEM
# ==============================================================================

# Generate UUID for batch/trace IDs
tkr_generate_uuid() {
    if command -v uuidgen >/dev/null 2>&1; then
        uuidgen | tr '[:upper:]' '[:lower:]'
    else
        # Fallback: timestamp + random + pid
        echo "$(date +%s)-$RANDOM-$$" | sed 's/-//g'
    fi
}

# Add log entry to batch
tkr_add_to_batch() {
    local level="$1"
    local message="$2"
    local service="$3"
    local component="$4"
    local metadata="$5"

    # Create log entry JSON (core module format)
    local timestamp=$(date +%s)000  # Core module expects milliseconds
    local trace_id=$(tkr_generate_uuid)

    # Convert level to lowercase for core module compatibility
    local core_level=$(echo "$level" | tr '[:upper:]' '[:lower:]')

    # Escape JSON strings
    message=$(printf '%s' "$message" | sed 's/\\/\\\\/g; s/"/\\"/g; s/'"$(printf '\t')"'/\\t/g; s/'"$(printf '\r')"'/\\r/g; s/'"$(printf '\n')"'/\\n/g')
    service=$(printf '%s' "$service" | sed 's/\\/\\\\/g; s/"/\\"/g')
    component=$(printf '%s' "$component" | sed 's/\\/\\\\/g; s/"/\\"/g')

    # Core module format
    local log_entry="{
        \"id\": \"$trace_id\",
        \"timestamp\": $timestamp,
        \"level\": \"$core_level\",
        \"service\": \"$service\",
        \"source\": \"$component\",
        \"message\": \"$message\",
        \"metadata\": $metadata
    }"

    # Add to batch (simplified without file locking for compatibility)
    TKR_LOG_BATCH+=("$log_entry")
    TKR_LOG_BATCH_COUNT=$((TKR_LOG_BATCH_COUNT + 1))
    tkr_debug "Added log to batch. Count: $TKR_LOG_BATCH_COUNT"

    # Check if batch should be flushed
    if [[ "$TKR_LOG_BATCH_COUNT" -ge "$TKR_LOG_BATCH_SIZE" ]]; then
        tkr_flush_batch_internal
    fi
}

# Internal batch flush (assumes lock is held)
tkr_flush_batch_internal() {
    if [[ "$TKR_LOG_BATCH_COUNT" -eq 0 ]]; then
        return 0
    fi

    tkr_debug "Flushing batch with $TKR_LOG_BATCH_COUNT entries"

    # Create batch JSON (core module format)
    local batch_id=$(tkr_generate_uuid)
    local batch_json="{
        \"entries\": [$(IFS=','; echo "${TKR_LOG_BATCH[*]}")],
        \"timestamp\": $(date +%s)000,
        \"source\": \"shell\"
    }"

    # Send batch asynchronously
    tkr_send_batch_async "$batch_json"

    # Clear batch
    TKR_LOG_BATCH=()
    TKR_LOG_BATCH_COUNT=0
    TKR_LOG_LAST_FLUSH=$(date +%s)
}

# Send batch asynchronously
tkr_send_batch_async() {
    local batch_json="$1"

    # Send in background to avoid blocking terminal
    {
        local retries=0
        while [[ "$retries" -lt "$TKR_LOG_MAX_RETRIES" ]]; do
            if curl -s -m "$TKR_LOG_HTTP_TIMEOUT" \
                   -H "Content-Type: application/json" \
                   -d "$batch_json" \
                   "$TKR_LOG_BATCH_ENDPOINT" >/dev/null 2>&1; then
                tkr_debug "Batch sent successfully"
                break
            else
                retries=$((retries + 1))
                tkr_debug "Batch send failed, retry $retries/$TKR_LOG_MAX_RETRIES"
                if [[ "$retries" -lt "$TKR_LOG_MAX_RETRIES" ]]; then
                    sleep "$((TKR_LOG_RETRY_DELAY * retries))"
                fi
            fi
        done
    } &
}

# Flush batch (public interface)
tkr_flush_batch() {
    tkr_flush_batch_internal
}

# Periodic batch flush
tkr_periodic_flush() {
    while true; do
        sleep "$((TKR_LOG_FLUSH_INTERVAL / 1000))"
        if [[ "$TKR_LOG_BATCH_COUNT" -gt 0 ]]; then
            local now=$(date +%s)
            local elapsed=$((now - TKR_LOG_LAST_FLUSH))
            if [[ "$elapsed" -ge "$((TKR_LOG_FLUSH_INTERVAL / 1000))" ]]; then
                tkr_flush_batch
            fi
        fi
    done &
}

# ==============================================================================
# COMMAND WRAPPERS
# ==============================================================================

# Wrapper for monitored commands
tkr_wrap_command() {
    local cmd="$1"
    shift
    local args=("$@")

    # Check if we should log this command
    if ! tkr_should_log; then
        exec "$cmd" "${args[@]}"
        return $?
    fi

    # Check if command is monitored
    if [[ ! " $TKR_LOG_MONITORED_COMMANDS " =~ " $cmd " ]]; then
        exec "$cmd" "${args[@]}"
        return $?
    fi

    tkr_debug "Wrapping command: $cmd ${args[*]}"

    # Create temp files for output capture
    local stdout_file=$(mktemp)
    local stderr_file=$(mktemp)
    local combined_file=$(mktemp)

    # Execute command with output capture
    local start_time=$(date +%s.%3N)

    # Use script to capture both stdout/stderr and preserve colors/formatting
    script -q "$combined_file" "$cmd" "${args[@]}" > "$stdout_file" 2> "$stderr_file"
    local exit_code=$?

    local end_time=$(date +%s.%3N)
    local duration=$(echo "$end_time - $start_time" | bc 2>/dev/null || echo "0")

    # Read captured output
    local stdout_content=""
    local stderr_content=""
    if [[ -f "$stdout_file" ]]; then
        stdout_content=$(cat "$stdout_file")
    fi
    if [[ -f "$stderr_file" ]]; then
        stderr_content=$(cat "$stderr_file")
    fi

    # Display output to user (passthrough behavior)
    if [[ -n "$stdout_content" ]]; then
        echo "$stdout_content"
    fi
    if [[ -n "$stderr_content" ]]; then
        echo "$stderr_content" >&2
    fi

    # Determine log level based on exit code (core module compatible)
    local log_level="info"
    if [[ "$exit_code" -ne 0 ]]; then
        log_level="error"
    fi

    # Create log message
    local message="Command: $cmd ${args[*]}"
    if [[ "$exit_code" -ne 0 ]]; then
        message="$message (exit code: $exit_code)"
    fi

    # Add output to message if enabled and not too long
    local full_output=""
    if [[ -n "$stdout_content" ]]; then
        full_output="$stdout_content"
    fi
    if [[ -n "$stderr_content" ]]; then
        if [[ -n "$full_output" ]]; then
            full_output="$full_output\n--- stderr ---\n$stderr_content"
        else
            full_output="$stderr_content"
        fi
    fi

    # Truncate if too long (max 5000 chars to stay under 10KB limit)
    if [[ ${#full_output} -gt 5000 ]]; then
        full_output="${full_output:0:4950}... [truncated]"
    fi

    # Create metadata
    local metadata="{
        \"command\": \"$cmd\",
        \"args\": [$(printf '"%s",' "${args[@]}" | sed 's/,$//')],
        \"exitCode\": $exit_code,
        \"duration\": $duration,
        \"workingDirectory\": \"$PWD\",
        \"output\": \"$(echo "$full_output" | sed 's/\\/\\\\/g; s/"/\\"/g; s/'"$(printf '\t')"'/\\t/g; s/'"$(printf '\r')"'/\\r/g; s/'"$(printf '\n')"'/\\n/g')\"
    }"

    # Send log if appropriate level
    if tkr_should_capture_level "$log_level"; then
        tkr_add_to_batch "$log_level" "$message" "shell" "$cmd" "$metadata"
    fi

    # Cleanup temp files
    rm -f "$stdout_file" "$stderr_file" "$combined_file"

    return $exit_code
}

# ==============================================================================
# DIRECT LOGGING FUNCTIONS
# ==============================================================================

# Send a single log entry
tkr_send_log() {
    local level="$1"
    local message="$2"
    local service="${3:-shell}"
    local component="${4:-}"
    local metadata="${5:-{}}"

    if ! tkr_should_log; then
        return 0
    fi

    if ! tkr_should_capture_level "$level"; then
        return 0
    fi

    tkr_add_to_batch "$level" "$message" "$service" "$component" "$metadata"
}

# Pipe command output through logging
tkr_log_pipe() {
    local service="${1:-shell}"
    local component="${2:-pipe}"

    if ! tkr_should_log; then
        cat
        return 0
    fi

    while IFS= read -r line; do
        echo "$line"  # Passthrough to stdout

        # Log the line
        local metadata="{\"source\": \"pipe\", \"workingDirectory\": \"$PWD\"}"
        tkr_add_to_batch "info" "$line" "$service" "$component" "$metadata"
    done
}

# ==============================================================================
# SHELL INTEGRATION
# ==============================================================================

# Return prompt indicator if logging is active
tkr_prompt_indicator() {
    if tkr_should_log && [[ "$TKR_LOG_SHOW_INDICATOR" == "true" ]]; then
        echo "$TKR_LOG_INDICATOR"
    fi
}

# Set up command monitoring for common commands
tkr_setup_command_monitoring() {
    # Only set up if logging is enabled
    if ! tkr_should_log; then
        return 0
    fi

    # Create command wrappers
    for cmd in $TKR_LOG_MONITORED_COMMANDS; do
        if command -v "$cmd" >/dev/null 2>&1; then
            # Create wrapper function
            eval "
            original_$cmd() {
                command $cmd \"\$@\"
            }

            $cmd() {
                tkr_wrap_command \"$cmd\" \"\$@\"
            }
            "
            tkr_debug "Set up monitoring for: $cmd"
        fi
    done
}

# Remove command monitoring
tkr_cleanup_command_monitoring() {
    for cmd in $TKR_LOG_MONITORED_COMMANDS; do
        if declare -f "$cmd" >/dev/null 2>&1; then
            unset -f "$cmd"
            if declare -f "original_$cmd" >/dev/null 2>&1; then
                eval "$cmd() { original_$cmd \"\$@\"; }"
            fi
            tkr_debug "Cleaned up monitoring for: $cmd"
        fi
    done
}

# ==============================================================================
# INITIALIZATION AND CLEANUP
# ==============================================================================

# Initialize logging system
tkr_init_logging() {
    if [[ "$TKR_LOG_ENABLED" != "true" ]]; then
        return 0
    fi

    tkr_debug "Initializing TKR logging system"

    # Test endpoint connectivity
    if ! curl -s -m 2 "$TKR_LOG_HEALTH_ENDPOINT" >/dev/null 2>&1; then
        tkr_debug "Warning: Cannot reach logging endpoint, running in offline mode"
    fi

    # Set up command monitoring
    tkr_setup_command_monitoring

    # Start periodic flush
    tkr_periodic_flush

    # Set up cleanup on shell exit
    trap 'tkr_cleanup_logging' EXIT

    tkr_debug "TKR logging system initialized"
}

# Cleanup logging system
tkr_cleanup_logging() {
    tkr_debug "Cleaning up TKR logging system"

    # Flush any remaining logs
    tkr_flush_batch

    # Remove command monitoring
    tkr_cleanup_command_monitoring

    # Clean up any temp files
    rm -f "/tmp/tkr-logging-$TKR_LOG_PID"*

    tkr_debug "TKR logging system cleaned up"
}

# ==============================================================================
# AUTO-INITIALIZATION
# ==============================================================================

# Auto-initialize if sourced directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]] || [[ -n "$PS1" ]]; then
    tkr_init_logging
fi

# Export public functions
export -f tkr_should_log
export -f tkr_send_log
export -f tkr_log_pipe
export -f tkr_prompt_indicator
export -f tkr_flush_batch