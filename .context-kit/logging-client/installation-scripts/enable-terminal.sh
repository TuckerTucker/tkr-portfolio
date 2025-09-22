#!/bin/bash
# TKR Context Kit - Terminal Logging Enablement Script
# Safely integrates shell logging into user's RC files with clean markers
# Usage: ./enable-terminal.sh [options]

set -euo pipefail

# Script metadata
SCRIPT_NAME="enable-terminal"
SCRIPT_VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../" && pwd)"

# Configuration
FORCE_INSTALL="${TKR_FORCE_INSTALL:-false}"
VERBOSE="${TKR_INSTALL_VERBOSE:-false}"
DRY_RUN="${TKR_INSTALL_DRY_RUN:-false}"
BACKUP_ENABLED="${TKR_BACKUP_ENABLED:-true}"

# TKR Logging markers for clean uninstall
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

# Detection results
CURRENT_SHELL=""
DETECTED_SHELLS=()
AVAILABLE_RC_FILES=()

# ==============================================================================
# UTILITY FUNCTIONS
# ==============================================================================

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp="$(date '+%Y-%m-%d %H:%M:%S')"

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
    local backup_file="${file}.tkr-backup.$(date +%Y%m%d_%H%M%S)"

    if [[ "$BACKUP_ENABLED" == "true" && -f "$file" ]]; then
        if [[ "$DRY_RUN" == "false" ]]; then
            cp "$file" "$backup_file"
            log SUCCESS "Backup created: $backup_file"
        else
            log INFO "Would create backup: $backup_file"
        fi
    fi
}

# Check if TKR logging is already configured in file
is_tkr_configured() {
    local file="$1"
    [[ -f "$file" ]] && grep -q "$TKR_MARKER_START" "$file"
}

# ==============================================================================
# SHELL DETECTION FUNCTIONS
# ==============================================================================

detect_current_shell() {
    log DEBUG "Detecting current shell..."

    # Try multiple methods to detect shell
    local detected_shell=""

    # Method 1: Check $SHELL environment variable
    if [[ -n "${SHELL:-}" ]]; then
        detected_shell="$(basename "$SHELL")"
        log DEBUG "Shell from \$SHELL: $detected_shell"
    fi

    # Method 2: Check parent process
    if [[ -z "$detected_shell" ]]; then
        if command -v ps >/dev/null 2>&1; then
            local parent_cmd="$(ps -p $PPID -o comm= 2>/dev/null || echo "")"
            if [[ -n "$parent_cmd" ]]; then
                detected_shell="$(basename "$parent_cmd")"
                log DEBUG "Shell from parent process: $detected_shell"
            fi
        fi
    fi

    # Method 3: Check if we're in a known shell environment
    if [[ -z "$detected_shell" ]]; then
        if [[ -n "${ZSH_VERSION:-}" ]]; then
            detected_shell="zsh"
        elif [[ -n "${BASH_VERSION:-}" ]]; then
            detected_shell="bash"
        elif [[ -n "${FISH_VERSION:-}" ]]; then
            detected_shell="fish"
        fi
        log DEBUG "Shell from version variables: $detected_shell"
    fi

    # Validate detected shell
    case "$detected_shell" in
        bash|zsh|fish)
            CURRENT_SHELL="$detected_shell"
            log SUCCESS "Current shell detected: $CURRENT_SHELL"
            ;;
        *)
            log WARN "Unknown or unsupported shell: $detected_shell"
            CURRENT_SHELL=""
            ;;
    esac
}

detect_available_shells() {
    log DEBUG "Detecting available shell configurations..."

    # Check which shell RC files exist
    for shell in "${!SHELL_RC_FILES[@]}"; do
        local rc_file="${SHELL_RC_FILES[$shell]}"

        if [[ -f "$rc_file" ]]; then
            AVAILABLE_RC_FILES+=("$rc_file")
            DETECTED_SHELLS+=("$shell")
            log DEBUG "Found $shell configuration: $rc_file"
        fi
    done

    # Also check for profile files that might source shell-specific configs
    for profile_file in "$HOME/.profile" "$HOME/.bash_profile" "$HOME/.zprofile"; do
        if [[ -f "$profile_file" ]]; then
            AVAILABLE_RC_FILES+=("$profile_file")
            log DEBUG "Found profile file: $profile_file"
        fi
    done

    log INFO "Available shell configurations: ${#AVAILABLE_RC_FILES[@]} found"
}

# ==============================================================================
# INSTALLATION FUNCTIONS
# ==============================================================================

generate_shell_integration() {
    local shell_type="$1"
    local tkr_script_path="$PROJECT_ROOT/.context-kit/shell/tkr-logging.sh"

    # Make path relative if it's within the user's home directory
    local relative_path="$tkr_script_path"
    if [[ "$tkr_script_path" == "$HOME"* ]]; then
        relative_path="\$HOME${tkr_script_path#$HOME}"
    fi

    cat << EOF
$TKR_MARKER_START
# TKR Context Kit - Terminal Logging Integration
# Auto-generated on $(date)
# This section can be safely removed by running disable-terminal.sh

# Check if the TKR logging script exists and source it
if [[ -f "$tkr_script_path" ]]; then
    source "$tkr_script_path"
elif [[ -f "$relative_path" ]]; then
    source "$relative_path"
else
    echo "Warning: TKR logging script not found at expected location" >&2
fi
$TKR_MARKER_END
EOF
}

install_to_rc_file() {
    local rc_file="$1"
    local shell_type="$2"

    log INFO "Installing to $rc_file ($shell_type)..."

    # Check if already installed
    if is_tkr_configured "$rc_file"; then
        if [[ "$FORCE_INSTALL" == "true" ]]; then
            log WARN "TKR logging already configured in $rc_file - forcing reinstall"
            remove_from_rc_file "$rc_file"
        else
            log WARN "TKR logging already configured in $rc_file - skipping (use --force to override)"
            return 0
        fi
    fi

    # Create backup
    create_backup "$rc_file"

    # Generate integration code
    local integration_code="$(generate_shell_integration "$shell_type")"

    if [[ "$DRY_RUN" == "false" ]]; then
        # Append to RC file
        echo "" >> "$rc_file"
        echo "$integration_code" >> "$rc_file"
        log SUCCESS "TKR logging integration added to $rc_file"
    else
        log INFO "Would add TKR logging integration to $rc_file"
        log DEBUG "Integration code:"
        echo "$integration_code" | sed 's/^/  /'
    fi
}

remove_from_rc_file() {
    local rc_file="$1"

    if [[ ! -f "$rc_file" ]]; then
        return 0
    fi

    if ! is_tkr_configured "$rc_file"; then
        return 0
    fi

    log DEBUG "Removing existing TKR configuration from $rc_file"

    if [[ "$DRY_RUN" == "false" ]]; then
        # Create temporary file without TKR sections
        local temp_file="$(mktemp)"

        # Use sed to remove everything between markers (inclusive)
        sed "/$TKR_MARKER_START/,/$TKR_MARKER_END/d" "$rc_file" > "$temp_file"

        # Replace original file
        mv "$temp_file" "$rc_file"
        log DEBUG "Removed existing TKR configuration from $rc_file"
    fi
}

# ==============================================================================
# INSTALLATION ORCHESTRATION
# ==============================================================================

validate_environment() {
    log INFO "Validating installation environment..."

    # Check if project root exists
    if [[ ! -d "$PROJECT_ROOT" ]]; then
        log ERROR "Project root not found: $PROJECT_ROOT"
        exit 1
    fi

    # Check if TKR shell script exists
    local tkr_script="$PROJECT_ROOT/.context-kit/shell/tkr-logging.sh"
    if [[ ! -f "$tkr_script" ]]; then
        log ERROR "TKR shell script not found: $tkr_script"
        log ERROR "Please ensure Wave 1 components are installed"
        exit 1
    fi

    # Verify script is executable
    if [[ ! -x "$tkr_script" ]]; then
        log WARN "TKR shell script is not executable: $tkr_script"
        if [[ "$DRY_RUN" == "false" ]]; then
            chmod +x "$tkr_script"
            log SUCCESS "Made TKR shell script executable"
        fi
    fi

    log SUCCESS "Environment validation passed"
}

run_installation() {
    log INFO "Starting TKR terminal logging installation..."

    # Detection phase
    detect_current_shell
    detect_available_shells

    if [[ ${#AVAILABLE_RC_FILES[@]} -eq 0 ]]; then
        log ERROR "No shell configuration files found"
        log INFO "Please create a shell configuration file (e.g., ~/.bashrc, ~/.zshrc) and run again"
        exit 1
    fi

    # Installation phase
    local installed_count=0

    # Install to current shell first if detected
    if [[ -n "$CURRENT_SHELL" ]]; then
        local current_rc="${SHELL_RC_FILES[$CURRENT_SHELL]}"
        if [[ -f "$current_rc" ]]; then
            install_to_rc_file "$current_rc" "$CURRENT_SHELL"
            ((installed_count++))
        fi
    fi

    # Ask about other shells if multiple are detected
    if [[ ${#DETECTED_SHELLS[@]} -gt 1 ]]; then
        log INFO "Multiple shells detected: ${DETECTED_SHELLS[*]}"

        for shell in "${DETECTED_SHELLS[@]}"; do
            if [[ "$shell" != "$CURRENT_SHELL" ]]; then
                local rc_file="${SHELL_RC_FILES[$shell]}"

                if [[ "$FORCE_INSTALL" == "true" ]]; then
                    install_to_rc_file "$rc_file" "$shell"
                    ((installed_count++))
                else
                    log INFO "Found $shell configuration: $rc_file"
                    log INFO "Run with --all to install to all detected shells"
                fi
            fi
        done
    fi

    log SUCCESS "Installation complete - modified $installed_count file(s)"

    if [[ $installed_count -gt 0 ]]; then
        log INFO ""
        log INFO "🔄 NEXT STEPS:"
        log INFO "1. Restart your terminal or run: source ~/.${CURRENT_SHELL}rc"
        log INFO "2. Verify installation: .context-kit/scripts/logging/verify-installation.sh"
        log INFO "3. Navigate to a project directory and run commands to see logging in action"
        log INFO "4. View logs at: http://localhost:42001"
    fi
}

# ==============================================================================
# COMMAND LINE PARSING
# ==============================================================================

show_help() {
    cat << EOF
TKR Terminal Logging Enablement Script

USAGE:
    $0 [options]

OPTIONS:
    -h, --help          Show this help message
    -f, --force         Force installation even if already configured
    -a, --all           Install to all detected shell configurations
    -n, --dry-run       Show what would be done without making changes
    -v, --verbose       Enable verbose logging
    --no-backup         Skip creating backup files

ENVIRONMENT VARIABLES:
    TKR_FORCE_INSTALL     Force installation (true/false, default: false)
    TKR_INSTALL_VERBOSE   Enable verbose logging (true/false, default: false)
    TKR_INSTALL_DRY_RUN   Run without making changes (true/false, default: false)
    TKR_BACKUP_ENABLED    Create backup files (true/false, default: true)

EXAMPLES:
    $0                    # Install to current shell
    $0 --all              # Install to all detected shells
    $0 --dry-run          # Preview changes without installing
    $0 --force            # Reinstall even if already configured

The script will:
1. Detect your current shell and available configurations
2. Add TKR logging integration with clear markers
3. Create backups of modified files
4. Provide instructions for activation

To uninstall, use: .context-kit/scripts/logging/disable-terminal.sh

EOF
}

# Parse command line arguments
INSTALL_ALL_SHELLS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -f|--force)
            FORCE_INSTALL=true
            shift
            ;;
        -a|--all)
            INSTALL_ALL_SHELLS=true
            shift
            ;;
        -n|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
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
    log INFO "TKR Terminal Logging Enablement v$SCRIPT_VERSION"

    # Update installation mode based on flags
    if [[ "$INSTALL_ALL_SHELLS" == "true" ]]; then
        FORCE_INSTALL=true
    fi

    # Validate environment
    validate_environment

    # Run installation
    run_installation

    if [[ "$DRY_RUN" == "true" ]]; then
        log INFO "Dry run complete - no changes made"
        log INFO "Run without --dry-run to apply changes"
    fi
}

# Run main function
main "$@"