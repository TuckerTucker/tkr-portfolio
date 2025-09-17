#!/bin/bash
# tkr-context-kit Logging Client for Bash
# Usage: source this file and use the log functions

# Configuration
TKR_LOG_URL="${TKR_LOG_URL:-http://localhost:42003}"
TKR_LOG_SERVICE="${TKR_LOG_SERVICE:-BashScript}"
TKR_LOG_SERVICE_TYPE="${TKR_LOG_SERVICE_TYPE:-cli}"
TKR_LOG_COMPONENT="${TKR_LOG_COMPONENT:-Main}"

# Log function
tkr_log() {
    local level="$1"
    local message="$2"
    local component="${3:-$TKR_LOG_COMPONENT}"
    local metadata="${4:-'{}'}"
    
    # Create timestamp
    local timestamp=$(date +%s)
    
    # Construct JSON payload
    local json_payload=$(cat <<EOF
{
  "level": "${level^^}",
  "message": "$message",
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
    echo "[${level^^}] $TKR_LOG_SERVICE/$component: $message" >&2
}

# Convenience functions
tkr_debug() {
    tkr_log "debug" "$1" "${2:-$TKR_LOG_COMPONENT}" "${3:-'{}'}"
}

tkr_info() {
    tkr_log "info" "$1" "${2:-$TKR_LOG_COMPONENT}" "${3:-'{}'}"
}

tkr_warn() {
    tkr_log "warn" "$1" "${2:-$TKR_LOG_COMPONENT}" "${3:-'{}'}"
}

tkr_error() {
    tkr_log "error" "$1" "${2:-$TKR_LOG_COMPONENT}" "${3:-'{}'}"
}

tkr_fatal() {
    tkr_log "fatal" "$1" "${2:-$TKR_LOG_COMPONENT}" "${3:-'{}'}"
}

# Example usage:
# tkr_info "Script started"
# tkr_error "Something went wrong" "ErrorHandler" '{"code": 500}'
# TKR_LOG_SERVICE="MyScript" tkr_info "Custom service name"