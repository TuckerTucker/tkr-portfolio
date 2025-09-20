#!/bin/bash
# TKR Context Kit - Terminal Logging Disablement Script
# Safely removes TKR logging integration from user's RC files
# Usage: ./disable-terminal.sh [options]

set -euo pipefail

# Script metadata
SCRIPT_NAME="disable-terminal"
SCRIPT_VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Configuration
VERBOSE="${TKR_UNINSTALL_VERBOSE:-false}"
DRY_RUN="${TKR_UNINSTALL_DRY_RUN:-false}"
BACKUP_ENABLED="${TKR_BACKUP_ENABLED:-true}"
CONFIRM_REMOVAL="${TKR_CONFIRM_REMOVAL:-true}"

# TKR Logging markers (must match enable-terminal.sh)
TKR_MARKER_START="# >>> TKR Context Kit Logging Initialize >>>"
TKR_MARKER_END="# <<< TKR Context Kit Logging Initialize <<<"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RESET='\033[0m'

# Shell configuration files
declare -A SHELL_RC_FILES=(
    ["bash"]="$HOME/.bashrc"
    ["zsh"]="$HOME/.zshrc"
    ["fish"]="$HOME/.config/fish/config.fish"
)

# Additional profile files to check
PROFILE_FILES=(
    "$HOME/.profile"
    "$HOME/.bash_profile"
    "$HOME/.zprofile"
)

# Removal tracking
FOUND_CONFIGURATIONS=()
REMOVED_COUNT=0
SKIPPED_COUNT=0

# ==============================================================================
# UTILITY FUNCTIONS
# ==============================================================================

log() {
    local level="$1"
    shift
    local message="$*"

    case "$level" in
        INFO)  echo -e "${BLUE}[INFO]${RESET} $message" ;;
        WARN)  echo -e "${YELLOW}[WARN]${RESET} $message" ;;
        ERROR) echo -e "${RED}[ERROR]${RESET} $message" >&2 ;;
        SUCCESS) echo -e "${GREEN}[SUCCESS]${RESET} $message" ;;
        DEBUG) [[ "$VERBOSE" == "true" ]] && echo -e "${CYAN}[DEBUG]${RESET} $message" ;;
    esac
}

# Create backup with timestamp
create_backup() {
    local file="$1"
    local backup_file="${file}.tkr-removal-backup.$(date +%Y%m%d_%H%M%S)"

    if [[ "$BACKUP_ENABLED" == "true" && -f "$file" ]]; then
        if [[ "$DRY_RUN" == "false" ]]; then
            cp "$file" "$backup_file"
            log SUCCESS "Backup created: $backup_file"
        else
            log INFO "Would create backup: $backup_file"
        fi
    fi
}

# Check if TKR logging is configured in file
is_tkr_configured() {
    local file="$1"
    [[ -f "$file" ]] && grep -q "$TKR_MARKER_START" "$file"
}

# Count lines that would be removed
count_tkr_lines() {
    local file="$1"
    if [[ ! -f "$file" ]]; then
        echo "0"
        return
    fi

    local start_line="$(grep -n "$TKR_MARKER_START" "$file" 2>/dev/null | cut -d: -f1 || echo "")"
    local end_line="$(grep -n "$TKR_MARKER_END" "$file" 2>/dev/null | cut -d: -f1 || echo "")"

    if [[ -n "$start_line" && -n "$end_line" ]]; then
        echo "$((end_line - start_line + 1))"
    else
        echo "0"
    fi
}

# Preview what would be removed
preview_removal() {
    local file="$1"

    if [[ ! -f "$file" ]]; then
        return
    fi

    local start_line="$(grep -n "$TKR_MARKER_START" "$file" 2>/dev/null | cut -d: -f1 || echo "")"
    local end_line="$(grep -n "$TKR_MARKER_END" "$file" 2>/dev/null | cut -d: -f1 || echo "")"

    if [[ -n "$start_line" && -n "$end_line" ]]; then
        echo "Lines $start_line-$end_line would be removed:"
        sed -n "${start_line},${end_line}p" "$file" | sed 's/^/  /'
    fi
}

# Confirm removal with user
confirm_removal() {
    local file="$1"
    local line_count="$2"

    if [[ "$CONFIRM_REMOVAL" != "true" ]]; then
        return 0
    fi

    echo
    log INFO "Found TKR configuration in: $file"
    log INFO "Lines to be removed: $line_count"

    if [[ "$VERBOSE" == "true" ]]; then
        preview_removal "$file"
    fi

    echo
    read -p "Remove TKR configuration from this file? [y/N] " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        return 0
    else
        log INFO "Skipping removal from $file"
        return 1
    fi
}

# ==============================================================================
# REMOVAL FUNCTIONS
# ==============================================================================

remove_from_rc_file() {
    local rc_file="$1"
    local shell_type="${2:-unknown}"

    log DEBUG "Processing $rc_file ($shell_type)..."

    # Check if file exists
    if [[ ! -f "$rc_file" ]]; then
        log DEBUG "File does not exist: $rc_file"
        return 0
    fi

    # Check if TKR is configured
    if ! is_tkr_configured "$rc_file"; then
        log DEBUG "TKR not configured in: $rc_file"
        return 0
    fi

    # Count lines to be removed
    local line_count="$(count_tkr_lines "$rc_file")"

    # Add to found configurations
    FOUND_CONFIGURATIONS+=("$rc_file ($line_count lines)")

    # Confirm removal if interactive
    if [[ "$CONFIRM_REMOVAL" == "true" ]] && [[ "$DRY_RUN" == "false" ]]; then
        if ! confirm_removal "$rc_file" "$line_count"; then
            ((SKIPPED_COUNT++))
            return 0
        fi
    fi

    # Create backup
    create_backup "$rc_file"

    if [[ "$DRY_RUN" == "false" ]]; then
        # Create temporary file without TKR sections
        local temp_file="$(mktemp)"

        # Use sed to remove everything between markers (inclusive)
        sed "/$TKR_MARKER_START/,/$TKR_MARKER_END/d" "$rc_file" > "$temp_file"

        # Replace original file
        mv "$temp_file" "$rc_file"

        log SUCCESS "Removed TKR configuration from $rc_file ($line_count lines)"
        ((REMOVED_COUNT++))
    else
        log INFO "Would remove TKR configuration from $rc_file ($line_count lines)"
        if [[ "$VERBOSE" == "true" ]]; then
            preview_removal "$rc_file"
        fi
        ((REMOVED_COUNT++))
    fi
}

# Clean up empty lines that might be left after removal
cleanup_empty_lines() {
    local file="$1"

    if [[ "$DRY_RUN" == "true" ]] || [[ ! -f "$file" ]]; then
        return
    fi

    # Remove trailing blank lines
    # Create a temp file with trailing blanks removed
    local temp_file="$(mktemp)"
    awk '
        {lines[NR] = $0}
        END {
            for (i = 1; i <= NR; i++) {
                if (i == NR) {
                    # For the last line, remove trailing spaces
                    gsub(/[[:space:]]*$/, "", lines[i])
                }
                if (lines[i] != "" || i < NR) {
                    print lines[i]
                }
            }
        }' "$file" > "$temp_file"

    # Only replace if the file actually changed
    if ! cmp -s "$file" "$temp_file"; then
        mv "$temp_file" "$file"
        log DEBUG "Cleaned up trailing empty lines in $file"
    else
        rm "$temp_file"
    fi
}

# ==============================================================================
# DISCOVERY AND REMOVAL ORCHESTRATION
# ==============================================================================

scan_for_configurations() {
    log INFO "Scanning for TKR logging configurations..."

    # Check standard shell RC files
    for shell in "${!SHELL_RC_FILES[@]}"; do
        local rc_file="${SHELL_RC_FILES[$shell]}"
        remove_from_rc_file "$rc_file" "$shell"
    done

    # Check profile files
    for profile_file in "${PROFILE_FILES[@]}"; do
        remove_from_rc_file "$profile_file" "profile"
    done

    # Check for any other files that might contain TKR markers
    log DEBUG "Scanning for additional files with TKR markers..."

    # Search in common directories for RC files
    local search_dirs=("$HOME" "$HOME/.config")

    for dir in "${search_dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            # Find files that might contain shell configurations
            while IFS= read -r -d '' file; do
                if [[ -f "$file" ]] && is_tkr_configured "$file"; then
                    # Skip files we already processed
                    local already_processed=false
                    for processed in "${SHELL_RC_FILES[@]}" "${PROFILE_FILES[@]}"; do
                        if [[ "$file" -ef "$processed" ]]; then
                            already_processed=true
                            break
                        fi
                    done

                    if [[ "$already_processed" == false ]]; then
                        log INFO "Found TKR configuration in additional file: $file"
                        remove_from_rc_file "$file" "other"
                    fi
                fi
            done < <(find "$dir" -maxdepth 2 -name ".*rc" -o -name "*profile*" -o -name "config.fish" 2>/dev/null | head -20 | tr '\n' '\0')
        fi
    done
}

run_removal() {
    log INFO "Starting TKR terminal logging removal..."

    # Scan and remove
    scan_for_configurations

    # Clean up any files that were modified
    for shell in "${!SHELL_RC_FILES[@]}"; do
        local rc_file="${SHELL_RC_FILES[$shell]}"
        cleanup_empty_lines "$rc_file"
    done

    for profile_file in "${PROFILE_FILES[@]}"; do
        cleanup_empty_lines "$profile_file"
    done
}

# ==============================================================================
# VERIFICATION AND REPORTING
# ==============================================================================

verify_removal() {
    log INFO "Verifying complete removal..."

    local verification_failed=false

    # Check all files we tried to clean
    for shell in "${!SHELL_RC_FILES[@]}"; do
        local rc_file="${SHELL_RC_FILES[$shell]}"
        if is_tkr_configured "$rc_file"; then
            log ERROR "TKR configuration still found in: $rc_file"
            verification_failed=true
        fi
    done

    for profile_file in "${PROFILE_FILES[@]}"; do
        if is_tkr_configured "$profile_file"; then
            log ERROR "TKR configuration still found in: $profile_file"
            verification_failed=true
        fi
    done

    if [[ "$verification_failed" == true ]]; then
        log ERROR "Verification failed - some configurations remain"
        return 1
    else
        log SUCCESS "Verification passed - all TKR configurations removed"
        return 0
    fi
}

generate_summary() {
    echo
    echo "📊 REMOVAL SUMMARY"
    echo "=================="

    if [[ ${#FOUND_CONFIGURATIONS[@]} -eq 0 ]]; then
        log INFO "No TKR logging configurations found"
        return
    fi

    echo
    echo "Found configurations:"
    for config in "${FOUND_CONFIGURATIONS[@]}"; do
        echo "  📄 $config"
    done

    echo
    if [[ "$DRY_RUN" == "true" ]]; then
        log INFO "Dry run results:"
        log INFO "  - Would remove: $REMOVED_COUNT configurations"
        log INFO "  - Would skip: $SKIPPED_COUNT configurations"
    else
        log INFO "Removal results:"
        log SUCCESS "  - Removed: $REMOVED_COUNT configurations"
        if [[ $SKIPPED_COUNT -gt 0 ]]; then
            log INFO "  - Skipped: $SKIPPED_COUNT configurations"
        fi
    fi

    if [[ $REMOVED_COUNT -gt 0 ]]; then
        echo
        log INFO "🔄 NEXT STEPS:"
        if [[ "$DRY_RUN" == "false" ]]; then
            log INFO "1. Restart your terminal or source your RC files"
            log INFO "2. TKR logging commands will no longer be available"
            log INFO "3. Backups are available if you need to restore"
        else
            log INFO "1. Run without --dry-run to apply changes"
            log INFO "2. Add --no-confirm to skip interactive prompts"
        fi
    fi
}

# ==============================================================================
# COMMAND LINE PARSING
# ==============================================================================

show_help() {
    cat << EOF
TKR Terminal Logging Disablement Script

USAGE:
    $0 [options]

OPTIONS:
    -h, --help          Show this help message
    -n, --dry-run       Show what would be removed without making changes
    -v, --verbose       Enable verbose logging and preview removal content
    --no-confirm        Skip confirmation prompts (auto-remove all)
    --no-backup         Skip creating backup files

ENVIRONMENT VARIABLES:
    TKR_UNINSTALL_VERBOSE   Enable verbose logging (true/false, default: false)
    TKR_UNINSTALL_DRY_RUN   Run without making changes (true/false, default: false)
    TKR_BACKUP_ENABLED      Create backup files (true/false, default: true)
    TKR_CONFIRM_REMOVAL     Prompt for confirmation (true/false, default: true)

EXAMPLES:
    $0                    # Interactive removal with confirmation
    $0 --dry-run          # Preview what would be removed
    $0 --no-confirm       # Remove all configurations without prompting
    $0 --verbose          # Show detailed information about removal

The script will:
1. Scan all shell configuration files for TKR logging integration
2. Create backups of files before modification (unless --no-backup)
3. Remove TKR logging sections marked with clear boundaries
4. Clean up any leftover empty lines
5. Verify complete removal

SAFETY FEATURES:
- Uses clear markers to identify TKR sections
- Creates timestamped backups before modification
- Confirms each removal (unless --no-confirm)
- Verifies complete removal after processing
- Handles multiple shell environments safely

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -n|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --no-confirm)
            CONFIRM_REMOVAL=false
            shift
            ;;
        --no-backup)
            BACKUP_ENABLED=false
            shift
            ;;
        *)
            log ERROR "Unknown option: $1"
            log INFO "Use --help for usage information"
            exit 1
            ;;
    esac
done

# ==============================================================================
# MAIN SCRIPT EXECUTION
# ==============================================================================

main() {
    log INFO "TKR Terminal Logging Disablement v$SCRIPT_VERSION"

    # Run removal process
    run_removal

    # Generate summary
    generate_summary

    # Verify removal (only if not dry run)
    if [[ "$DRY_RUN" == "false" ]] && [[ $REMOVED_COUNT -gt 0 ]]; then
        if ! verify_removal; then
            exit 1
        fi
    fi

    if [[ "$DRY_RUN" == "true" ]]; then
        log INFO "Dry run complete - no changes made"
        log INFO "Run without --dry-run to apply changes"
    fi
}

# Run main function
main "$@"