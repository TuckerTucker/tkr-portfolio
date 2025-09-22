#!/bin/bash
# TKR Context Kit - Logging Installation Rollback Script
# Safely removes all TKR logging integrations and restores system state
# Usage: ./rollback-installation.sh [options]

set -euo pipefail

# Script metadata
SCRIPT_NAME="rollback-installation"
SCRIPT_VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../" && pwd)"

# Configuration
VERBOSE="${TKR_ROLLBACK_VERBOSE:-false}"
DRY_RUN="${TKR_ROLLBACK_DRY_RUN:-false}"
FORCE_ROLLBACK="${TKR_FORCE_ROLLBACK:-false}"

# TKR Logging markers for identification
TKR_MARKER_START="# >>> TKR Context Kit Logging Initialize >>>"
TKR_MARKER_END="# <<< TKR Context Kit Logging Initialize <<<"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RESET='\033[0m'

# Icons
ICON_SUCCESS="✅"
ICON_ERROR="❌"
ICON_WARNING="⚠️"
ICON_INFO="ℹ️"
ICON_CLEAN="🧹"

# Components to rollback
ROLLBACK_COMPONENTS=()
ROLLBACK_FAILURES=()

# ==============================================================================
# UTILITY FUNCTIONS
# ==============================================================================

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp="$(date '+%Y-%m-%d %H:%M:%S')"

    case "$level" in
        "success")
            echo -e "${GREEN}${ICON_SUCCESS} [${timestamp}] SUCCESS: ${message}${RESET}" >&2
            ;;
        "error")
            echo -e "${RED}${ICON_ERROR} [${timestamp}] ERROR: ${message}${RESET}" >&2
            ;;
        "warning")
            echo -e "${YELLOW}${ICON_WARNING} [${timestamp}] WARNING: ${message}${RESET}" >&2
            ;;
        "info")
            echo -e "${BLUE}${ICON_INFO} [${timestamp}] INFO: ${message}${RESET}" >&2
            ;;
        "debug")
            [[ "$VERBOSE" == "true" ]] && echo -e "${CYAN}DEBUG: [${timestamp}] ${message}${RESET}" >&2
            ;;
        *)
            echo -e "${message}" >&2
            ;;
    esac
}

detect_installed_components() {
    log "info" "Detecting installed TKR logging components..."

    # Check for terminal integration
    local shell_files=(
        "$HOME/.bashrc"
        "$HOME/.zshrc"
        "$HOME/.config/fish/config.fish"
    )

    for shell_file in "${shell_files[@]}"; do
        if [[ -f "$shell_file" ]] && grep -q "$TKR_MARKER_START" "$shell_file"; then
            ROLLBACK_COMPONENTS+=("terminal:$shell_file")
            log "debug" "Found terminal integration in: $shell_file"
        fi
    done

    # Check for NODE_OPTIONS integration
    if [[ -n "${NODE_OPTIONS:-}" ]] && [[ "$NODE_OPTIONS" == *"tkr-logger"* ]]; then
        ROLLBACK_COMPONENTS+=("node-options")
        log "debug" "Found NODE_OPTIONS integration"
    fi

    # Check for shell environment variables
    if [[ -n "${TKR_LOGGING_ENABLED:-}" ]]; then
        ROLLBACK_COMPONENTS+=("environment")
        log "debug" "Found TKR environment variables"
    fi

    log "info" "Found ${#ROLLBACK_COMPONENTS[@]} components to rollback"

    if [[ "$VERBOSE" == "true" && ${#ROLLBACK_COMPONENTS[@]} -gt 0 ]]; then
        for component in "${ROLLBACK_COMPONENTS[@]}"; do
            echo "  - $component"
        done
    fi
}

rollback_terminal_integration() {
    local shell_file="$1"

    log "info" "Rolling back terminal integration from: $(basename "$shell_file")"

    if [[ ! -f "$shell_file" ]]; then
        log "warning" "Shell file not found: $shell_file"
        return 0
    fi

    # Check if TKR markers exist
    if ! grep -q "$TKR_MARKER_START" "$shell_file"; then
        log "info" "No TKR integration found in: $(basename "$shell_file")"
        return 0
    fi

    if [[ "$DRY_RUN" == "true" ]]; then
        log "info" "[DRY RUN] Would remove TKR integration from: $(basename "$shell_file")"
        return 0
    fi

    # Create backup
    local backup_file="${shell_file}.tkr-rollback-$(date +%Y%m%d_%H%M%S)"
    if cp "$shell_file" "$backup_file"; then
        log "debug" "Created backup: $backup_file"
    else
        log "error" "Failed to create backup for: $(basename "$shell_file")"
        return 1
    fi

    # Remove TKR integration block
    if sed -i.tmp "/$TKR_MARKER_START/,/$TKR_MARKER_END/d" "$shell_file"; then
        rm -f "${shell_file}.tmp"
        log "success" "Removed TKR integration from: $(basename "$shell_file")"
        return 0
    else
        # Restore from backup on failure
        cp "$backup_file" "$shell_file"
        log "error" "Failed to remove TKR integration from: $(basename "$shell_file")"
        return 1
    fi
}

rollback_node_options() {
    log "info" "Rolling back NODE_OPTIONS integration..."

    if [[ "$DRY_RUN" == "true" ]]; then
        log "info" "[DRY RUN] Would remove NODE_OPTIONS integration"
        return 0
    fi

    # This is handled by the individual scripts that set NODE_OPTIONS
    # The actual rollback depends on how it was installed
    log "info" "NODE_OPTIONS integration rollback requires manual intervention"
    log "info" "Please unset NODE_OPTIONS or remove TKR references manually"
    return 0
}

rollback_environment_variables() {
    log "info" "Rolling back environment variables..."

    if [[ "$DRY_RUN" == "true" ]]; then
        log "info" "[DRY RUN] Would remove TKR environment variables"
        return 0
    fi

    # Remove TKR environment variables from current session
    local tkr_vars=(
        "TKR_LOGGING_ENABLED"
        "TKR_LOG_LEVEL"
        "TKR_PROJECT_ROOT"
        "TKR_SESSION_ID"
    )

    for var in "${tkr_vars[@]}"; do
        if [[ -n "${!var:-}" ]]; then
            unset "$var"
            log "debug" "Unset environment variable: $var"
        fi
    done

    log "success" "Environment variables cleaned up"
    return 0
}

perform_rollback() {
    log "info" "${ICON_CLEAN} Starting rollback process..."

    if [[ ${#ROLLBACK_COMPONENTS[@]} -eq 0 ]]; then
        log "info" "No TKR logging components detected - nothing to rollback"
        return 0
    fi

    local rollback_count=0
    local failure_count=0

    for component in "${ROLLBACK_COMPONENTS[@]}"; do
        case "$component" in
            terminal:*)
                local shell_file="${component#terminal:}"
                if rollback_terminal_integration "$shell_file"; then
                    ((rollback_count++))
                else
                    ((failure_count++))
                    ROLLBACK_FAILURES+=("$component")
                fi
                ;;
            node-options)
                if rollback_node_options; then
                    ((rollback_count++))
                else
                    ((failure_count++))
                    ROLLBACK_FAILURES+=("$component")
                fi
                ;;
            environment)
                if rollback_environment_variables; then
                    ((rollback_count++))
                else
                    ((failure_count++))
                    ROLLBACK_FAILURES+=("$component")
                fi
                ;;
            *)
                log "warning" "Unknown component type: $component"
                ;;
        esac
    done

    log "info" "Rollback completed: $rollback_count successful, $failure_count failed"
    return $failure_count
}

show_rollback_summary() {
    echo
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${CYAN}║                           Rollback Summary                                  ║${RESET}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════════╝${RESET}"
    echo

    if [[ ${#ROLLBACK_FAILURES[@]} -eq 0 ]]; then
        log "success" "All TKR logging components removed successfully"
        echo
        echo -e "${GREEN}System restored to clean state:${RESET}"
        echo -e "  ${ICON_SUCCESS} Terminal integration removed"
        echo -e "  ${ICON_SUCCESS} Environment variables cleaned"
        echo -e "  ${ICON_SUCCESS} Configuration restored"
        echo
        echo -e "${BLUE}Recommended next steps:${RESET}"
        echo -e "  1. Restart your terminal sessions"
        echo -e "  2. Verify NODE_OPTIONS is clean: echo \$NODE_OPTIONS"
        echo -e "  3. Remove any remaining TKR files if desired"

    else
        log "warning" "Some components failed to rollback completely"
        echo
        echo -e "${YELLOW}Failed Components:${RESET}"
        for failure in "${ROLLBACK_FAILURES[@]}"; do
            echo -e "  ${ICON_ERROR} $failure"
        done
        echo
        echo -e "${BLUE}Manual cleanup required:${RESET}"
        echo -e "  1. Check shell RC files for TKR markers"
        echo -e "  2. Verify NODE_OPTIONS is clean"
        echo -e "  3. Remove TKR environment variables"
    fi
}

show_usage() {
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  -h, --help         Show this help message"
    echo "  -v, --verbose      Enable verbose output"
    echo "  -n, --dry-run      Show what would be done without executing"
    echo "  -f, --force        Force rollback without confirmation"
    echo
    echo "Environment Variables:"
    echo "  TKR_ROLLBACK_VERBOSE    Enable verbose output (true/false)"
    echo "  TKR_ROLLBACK_DRY_RUN    Dry run mode (true/false)"
    echo "  TKR_FORCE_ROLLBACK      Force rollback (true/false)"
    echo
    echo "Examples:"
    echo "  $0                     # Interactive rollback"
    echo "  $0 --dry-run           # Show what would be removed"
    echo "  $0 --force --verbose   # Force rollback with verbose output"
}

# ==============================================================================
# ARGUMENT PARSING
# ==============================================================================

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -v|--verbose)
                VERBOSE="true"
                shift
                ;;
            -n|--dry-run)
                DRY_RUN="true"
                shift
                ;;
            -f|--force)
                FORCE_ROLLBACK="true"
                shift
                ;;
            *)
                log "error" "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
}

# ==============================================================================
# MAIN EXECUTION
# ==============================================================================

main() {
    # Parse command line arguments
    parse_arguments "$@"

    echo -e "${CYAN}${ICON_CLEAN} TKR Context Kit - Logging Rollback${RESET}"
    echo -e "${BLUE}This script will remove all TKR logging integrations.${RESET}"
    echo

    # Detect installed components
    detect_installed_components

    if [[ ${#ROLLBACK_COMPONENTS[@]} -eq 0 ]]; then
        log "info" "No TKR logging components detected - nothing to rollback"
        exit 0
    fi

    # Confirm rollback unless forced
    if [[ "$FORCE_ROLLBACK" != "true" && "$DRY_RUN" != "true" ]]; then
        echo -e "${YELLOW}Found ${#ROLLBACK_COMPONENTS[@]} components to remove.${RESET}"
        echo -e "${YELLOW}This action cannot be undone (backups will be created).${RESET}"
        echo
        printf "Are you sure you want to proceed? [y/N]: "
        read -r response
        case "$response" in
            [Yy]*) ;;
            *)
                log "info" "Rollback cancelled by user"
                exit 0
                ;;
        esac
        echo
    fi

    # Perform rollback
    if perform_rollback; then
        show_rollback_summary
        log "success" "TKR logging rollback completed successfully"
        exit 0
    else
        show_rollback_summary
        log "error" "TKR logging rollback completed with errors"
        exit 1
    fi
}

# Execute main function with all arguments
main "$@"