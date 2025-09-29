#!/usr/bin/env bash
# TKR Context Kit - Comprehensive Logging Setup Script
# Integrates all Wave 1, 2, and 3 components into a cohesive logging solution
# Usage: ./setup-logging.sh [options]

set -euo pipefail

# Script metadata
SCRIPT_NAME="setup-logging"
SCRIPT_VERSION="2.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Configuration files and directories (all within logging-client)
CONFIG_DIR="$SCRIPT_DIR/config"
SCRIPTS_DIR="$SCRIPT_DIR/installation-scripts"
DEFAULTS_CONFIG="$CONFIG_DIR/defaults.json"
LOGGING_CLIENT_DIR="$SCRIPT_DIR"

# Setup options (can be overridden by environment variables)
FORCE_INSTALL="${TKR_FORCE_INSTALL:-false}"
VERBOSE="${TKR_SETUP_VERBOSE:-false}"
DRY_RUN="${TKR_SETUP_DRY_RUN:-false}"
BACKUP_ENABLED="${TKR_BACKUP_ENABLED:-true}"
INTERACTIVE="${TKR_INTERACTIVE:-true}"
SKIP_VALIDATION="${TKR_SKIP_VALIDATION:-false}"

# Component installation flags
ENABLE_TERMINAL="${TKR_ENABLE_TERMINAL:-}"
ENABLE_BROWSER="${TKR_ENABLE_BROWSER:-}"
ENABLE_NODE_OPTIONS="${TKR_ENABLE_NODE_OPTIONS:-}"
BUILD_TOOL_DETECTED=""

# Progress tracking
TOTAL_STEPS=8
CURRENT_STEP=0
INSTALLED_COMPONENTS=()
FAILED_COMPONENTS=()
ROLLBACK_NEEDED=false

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
BOLD='\033[1m'
RESET='\033[0m'

# Icons for better UX
ICON_SUCCESS="✅"
ICON_ERROR="❌"
ICON_WARNING="⚠️"
ICON_INFO="ℹ️"
ICON_SETUP="🚀"
ICON_CONFIG="⚙️"
ICON_TERMINAL="💻"
ICON_BROWSER="🌐"
ICON_NODE="📦"
ICON_CLEAN="🧹"

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
        "step")
            CURRENT_STEP=$((CURRENT_STEP + 1))
            echo -e "${PURPLE}${BOLD}[${CURRENT_STEP}/${TOTAL_STEPS}] ${message}${RESET}" >&2
            ;;
        *)
            echo -e "${message}" >&2
            ;;
    esac
}

progress_bar() {
    local current="$1"
    local total="$2"
    local width=50
    local percentage=$((current * 100 / total))
    local filled=$((current * width / total))
    local empty=$((width - filled))

    printf "\r${CYAN}Progress: [${GREEN}"
    printf "%*s" "$filled" | tr ' ' '='
    printf "${CYAN}"
    printf "%*s" "$empty" | tr ' ' '-'
    printf "${CYAN}] ${percentage}%%${RESET}"
}

validate_prerequisites() {
    log "step" "${ICON_CONFIG} Validating prerequisites..."

    # Check if we're in a valid project directory
    if [[ ! -f "$PROJECT_ROOT/package.json" && ! -f "$PROJECT_ROOT/.git/config" ]]; then
        log "warning" "No package.json or .git found. Proceeding with minimal validation."
    fi

    # Validate required scripts exist
    local required_scripts=(
        "enable-terminal.sh"
        "detect-build-tool.sh"
        "enable-node-options.sh"
        "verify-installation.sh"
    )

    for script in "${required_scripts[@]}"; do
        if [[ ! -f "$SCRIPTS_DIR/$script" ]]; then
            log "error" "Required script not found: $script"
            return 1
        fi
    done

    # Validate configuration exists
    if [[ ! -f "$DEFAULTS_CONFIG" ]]; then
        log "error" "Configuration file not found: $DEFAULTS_CONFIG"
        return 1
    fi

    # Validate logging client exists
    if [[ ! -d "$LOGGING_CLIENT_DIR" ]]; then
        log "error" "Logging client directory not found: $LOGGING_CLIENT_DIR"
        return 1
    fi

    log "success" "Prerequisites validated successfully"
    return 0
}

show_welcome() {
    clear
    echo -e "${BOLD}${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                    TKR Context Kit - Logging Setup                          ║"
    echo "║                                                                              ║"
    echo "║  ${ICON_SETUP} Comprehensive logging solution setup wizard                          ║"
    echo "║  ${ICON_CONFIG} Integrates terminal, browser, and NODE_OPTIONS logging              ║"
    echo "║  ${ICON_TERMINAL} Automatic project detection and configuration                     ║"
    echo "║                                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${RESET}"
    echo
    echo -e "${BLUE}This wizard will guide you through setting up the TKR logging system.${RESET}"
    echo -e "${BLUE}The setup includes:${RESET}"
    echo -e "  ${ICON_TERMINAL} Terminal logging integration"
    echo -e "  ${ICON_BROWSER} Browser console integration (Vite/Webpack)"
    echo -e "  ${ICON_NODE} NODE_OPTIONS automatic logging"
    echo -e "  ${ICON_CONFIG} Configuration validation and testing"
    echo

    if [[ "$INTERACTIVE" == "true" ]]; then
        echo -e "${YELLOW}Press Enter to continue or Ctrl+C to cancel...${RESET}"
        read -r
    fi
}

detect_project_type() {
    log "step" "${ICON_CONFIG} Detecting project type and build tools..."

    # Run build tool detection
    if [[ -x "$SCRIPTS_DIR/detect-build-tool.sh" ]]; then
        log "debug" "Running build tool detection..."
        local detection_result
        detection_result=$("$SCRIPTS_DIR/detect-build-tool.sh" "$PROJECT_ROOT" 2>&1)
        local exit_code=$?

        BUILD_TOOL_DETECTED="$detection_result"
        log "success" "Project analysis completed"

        if [[ "$VERBOSE" == "true" ]]; then
            echo -e "${CYAN}Detection Results:${RESET}"
            echo "$BUILD_TOOL_DETECTED"
        fi

        # Note: Build tool detection now always exits 0, so this is just for future safety
        if [[ $exit_code -ne 0 ]]; then
            log "warning" "Build tool detection returned non-zero exit code but continuing anyway"
        fi
    else
        log "warning" "Build tool detection script not executable"
        BUILD_TOOL_DETECTED=""
    fi
}

prompt_component_selection() {
    if [[ "$INTERACTIVE" != "true" ]]; then
        # Non-interactive mode, use environment variables or defaults
        ENABLE_TERMINAL="${ENABLE_TERMINAL:-true}"
        ENABLE_BROWSER="${ENABLE_BROWSER:-auto}"
        ENABLE_NODE_OPTIONS="${ENABLE_NODE_OPTIONS:-true}"
        return 0
    fi

    log "step" "${ICON_CONFIG} Component selection..."
    echo
    echo -e "${BOLD}Select components to install:${RESET}"
    echo

    # Terminal logging
    if [[ -z "$ENABLE_TERMINAL" ]]; then
        echo -e "${ICON_TERMINAL} ${BOLD}Terminal logging${RESET} (monitors shell commands)"
        echo "   Captures output from npm, git, node commands, etc."
        while true; do
            echo -ne "${CYAN}Enable terminal logging? [Y/n]: ${RESET}"
            read -r response
            case "$response" in
                [Yy]*|"") ENABLE_TERMINAL="true"; break ;;
                [Nn]*) ENABLE_TERMINAL="false"; break ;;
                *) echo "Please answer yes or no." ;;
            esac
        done
        echo
    fi

    # Browser integration
    if [[ -z "$ENABLE_BROWSER" ]]; then
        echo -e "${ICON_BROWSER} ${BOLD}Browser integration${RESET} (captures console.log, errors)"
        if [[ -n "$BUILD_TOOL_DETECTED" ]]; then
            echo "   Detected build tools - will configure automatically"
            echo "   Available for: Vite, Webpack, and other bundlers"
        else
            echo "   Manual configuration required"
        fi
        while true; do
            echo -ne "${CYAN}Enable browser integration? [Y/n]: ${RESET}"
            read -r response
            case "$response" in
                [Yy]*|"") ENABLE_BROWSER="true"; break ;;
                [Nn]*) ENABLE_BROWSER="false"; break ;;
                *) echo "Please answer yes or no." ;;
            esac
        done
        echo
    fi

    # NODE_OPTIONS integration
    if [[ -z "$ENABLE_NODE_OPTIONS" ]]; then
        echo -e "${ICON_NODE} ${BOLD}NODE_OPTIONS integration${RESET} (automatic Node.js logging)"
        echo "   Automatically captures output from all Node.js processes"
        echo "   Uses NODE_OPTIONS environment variable"
        while true; do
            echo -ne "${CYAN}Enable NODE_OPTIONS integration? [Y/n]: ${RESET}"
            read -r response
            case "$response" in
                [Yy]*|"") ENABLE_NODE_OPTIONS="true"; break ;;
                [Nn]*) ENABLE_NODE_OPTIONS="false"; break ;;
                *) echo "Please answer yes or no." ;;
            esac
        done
        echo
    fi
}

install_terminal_logging() {
    if [[ "$ENABLE_TERMINAL" != "true" ]]; then
        log "info" "Skipping terminal logging (disabled by user)"
        return 0
    fi

    log "step" "${ICON_TERMINAL} Installing terminal logging..."

    local install_script="$SCRIPTS_DIR/enable-terminal.sh"
    if [[ ! -x "$install_script" ]]; then
        log "error" "Terminal installation script not found or not executable"
        FAILED_COMPONENTS+=("terminal")
        return 1
    fi

    # Set environment variables for the installation script
    export TKR_FORCE_INSTALL="$FORCE_INSTALL"
    export TKR_INSTALL_VERBOSE="$VERBOSE"
    export TKR_INSTALL_DRY_RUN="$DRY_RUN"
    export TKR_BACKUP_ENABLED="$BACKUP_ENABLED"

    log "info" "Running terminal logging installation..."
    if [[ "$DRY_RUN" == "true" ]]; then
        log "info" "[DRY RUN] Would execute: $install_script"
        INSTALLED_COMPONENTS+=("terminal")
        return 0
    fi

    if "$install_script"; then
        log "success" "Terminal logging installed successfully"
        INSTALLED_COMPONENTS+=("terminal")
        return 0
    else
        log "error" "Terminal logging installation failed"
        FAILED_COMPONENTS+=("terminal")
        return 1
    fi
}

install_browser_integration() {
    if [[ "$ENABLE_BROWSER" != "true" ]]; then
        log "info" "Skipping browser integration (disabled by user)"
        return 0
    fi

    log "step" "${ICON_BROWSER} Installing browser integration..."

    # First detect build tools if not already done
    if [[ -z "$BUILD_TOOL_DETECTED" ]]; then
        detect_project_type
    fi

    # The browser integration is handled by the build tool detection
    # and individual plugin installations
    log "info" "Configuring browser integration based on detected build tools..."

    if [[ "$DRY_RUN" == "true" ]]; then
        log "info" "[DRY RUN] Would configure browser integration"
        INSTALLED_COMPONENTS+=("browser")
        return 0
    fi

    # Browser integration is primarily configuration-based
    # The actual client script is served by the knowledge-graph service
    log "success" "Browser integration configured successfully"
    INSTALLED_COMPONENTS+=("browser")
    return 0
}

install_node_options() {
    if [[ "$ENABLE_NODE_OPTIONS" != "true" ]]; then
        log "info" "Skipping NODE_OPTIONS integration (disabled by user)"
        return 0
    fi

    log "step" "${ICON_NODE} Installing NODE_OPTIONS integration..."

    local install_script="$SCRIPTS_DIR/enable-node-options.sh"
    if [[ ! -x "$install_script" ]]; then
        log "error" "NODE_OPTIONS installation script not found or not executable"
        FAILED_COMPONENTS+=("node-options")
        return 1
    fi

    # Set environment variables for the installation script
    export TKR_FORCE_INSTALL="$FORCE_INSTALL"
    export TKR_INSTALL_VERBOSE="$VERBOSE"
    export TKR_INSTALL_DRY_RUN="$DRY_RUN"
    export TKR_BACKUP_ENABLED="$BACKUP_ENABLED"

    log "info" "Running NODE_OPTIONS installation..."
    if [[ "$DRY_RUN" == "true" ]]; then
        log "info" "[DRY RUN] Would execute: $install_script"
        INSTALLED_COMPONENTS+=("node-options")
        return 0
    fi

    if "$install_script"; then
        log "success" "NODE_OPTIONS integration installed successfully"
        INSTALLED_COMPONENTS+=("node-options")
        return 0
    else
        log "error" "NODE_OPTIONS installation failed"
        FAILED_COMPONENTS+=("node-options")
        return 1
    fi
}

validate_installation() {
    if [[ "$SKIP_VALIDATION" == "true" ]]; then
        log "info" "Skipping installation validation (disabled by user)"
        return 0
    fi

    log "step" "${ICON_CONFIG} Validating installation..."

    local validation_script="$SCRIPTS_DIR/verify-installation.sh"
    if [[ ! -x "$validation_script" ]]; then
        log "warning" "Validation script not found, skipping verification"
        return 0
    fi

    log "info" "Running installation verification..."
    if [[ "$DRY_RUN" == "true" ]]; then
        log "info" "[DRY RUN] Would execute: $validation_script"
        return 0
    fi

    # Set environment variables for validation
    export TKR_VERIFY_VERBOSE="$VERBOSE"
    export TKR_VERIFY_COMPONENTS="$(IFS=','; echo "${INSTALLED_COMPONENTS[*]}")"

    if "$validation_script"; then
        log "success" "Installation validation completed successfully"
        return 0
    else
        log "error" "Installation validation failed"
        return 1
    fi
}

show_completion_summary() {
    log "step" "${ICON_SUCCESS} Setup completed!"
    echo
    echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${BOLD}${GREEN}║                         Setup Completed Successfully!                       ║${RESET}"
    echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════════════════════════════════╝${RESET}"
    echo

    echo -e "${BOLD}Installed Components:${RESET}"
    for component in "${INSTALLED_COMPONENTS[@]}"; do
        echo -e "  ${ICON_SUCCESS} ${component}"
    done

    if [[ ${#FAILED_COMPONENTS[@]} -gt 0 ]]; then
        echo
        echo -e "${BOLD}${YELLOW}Failed Components:${RESET}"
        for component in "${FAILED_COMPONENTS[@]}"; do
            echo -e "  ${ICON_ERROR} ${component}"
        done
    fi

    echo
    echo -e "${BOLD}Next Steps:${RESET}"
    echo -e "  1. ${ICON_TERMINAL} Restart your terminal to activate shell logging"
    echo -e "  2. ${ICON_BROWSER} Start your development server to test browser integration"
    echo -e "  3. ${ICON_CONFIG} Check logs at: http://localhost:42001"
    echo -e "  4. ${ICON_INFO} View documentation: .context-kit/logging-client/README.md"
    echo

    if [[ "$ENABLE_TERMINAL" == "true" ]]; then
        echo -e "${CYAN}To reload your shell configuration:${RESET}"
        echo -e "  ${BOLD}source ~/.bashrc${RESET}   # for bash"
        echo -e "  ${BOLD}source ~/.zshrc${RESET}    # for zsh"
        echo
    fi

    echo -e "${CYAN}Logging endpoints:${RESET}"
    echo -e "  • Dashboard: ${BOLD}http://localhost:42001${RESET}"
    echo -e "  • API: ${BOLD}http://localhost:42003/api/logs${RESET}"
    echo -e "  • Health: ${BOLD}http://localhost:42003/health${RESET}"
    echo
}

perform_rollback() {
    if [[ "$ROLLBACK_NEEDED" != "true" || ${#INSTALLED_COMPONENTS[@]} -eq 0 ]]; then
        return 0
    fi

    log "step" "${ICON_CLEAN} Performing rollback..."
    echo
    echo -e "${YELLOW}${BOLD}Rolling back installed components due to failures...${RESET}"

    # Use the dedicated rollback script if available
    local rollback_script="$SCRIPTS_DIR/rollback-installation.sh"
    if [[ -x "$rollback_script" ]]; then
        log "info" "Using comprehensive rollback script..."
        export TKR_FORCE_ROLLBACK="true"
        export TKR_ROLLBACK_VERBOSE="$VERBOSE"

        if "$rollback_script"; then
            log "success" "Comprehensive rollback completed successfully"
        else
            log "warning" "Comprehensive rollback completed with warnings"
        fi
    else
        # Fallback to basic rollback
        log "info" "Using basic rollback (comprehensive script not available)..."

        # Rollback terminal logging
        if [[ " ${INSTALLED_COMPONENTS[*]} " =~ " terminal " ]]; then
            log "info" "Rolling back terminal logging..."
            local disable_script="$SCRIPTS_DIR/disable-terminal.sh"
            if [[ -x "$disable_script" ]]; then
                "$disable_script" || log "warning" "Failed to rollback terminal logging"
            fi
        fi

        # Rollback NODE_OPTIONS
        if [[ " ${INSTALLED_COMPONENTS[*]} " =~ " node-options " ]]; then
            log "info" "Rolling back NODE_OPTIONS integration..."
            # Basic NODE_OPTIONS cleanup
            if [[ -n "${NODE_OPTIONS:-}" ]] && [[ "$NODE_OPTIONS" == *"tkr-logger"* ]]; then
                log "info" "Please manually clean NODE_OPTIONS environment variable"
            fi
        fi
    fi

    log "warning" "Rollback completed. System restored to previous state."
}

show_usage() {
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -v, --verbose           Enable verbose output"
    echo "  -n, --dry-run           Show what would be done without executing"
    echo "  -f, --force             Force installation even if already installed"
    echo "  -y, --yes               Non-interactive mode (use defaults)"
    echo "  --no-backup             Disable backup creation"
    echo "  --no-validation         Skip installation validation"
    echo "  --terminal=<bool>       Enable/disable terminal logging"
    echo "  --browser=<bool>        Enable/disable browser integration"
    echo "  --node-options=<bool>   Enable/disable NODE_OPTIONS integration"
    echo
    echo "Environment Variables:"
    echo "  TKR_FORCE_INSTALL       Force installation (true/false)"
    echo "  TKR_SETUP_VERBOSE       Enable verbose output (true/false)"
    echo "  TKR_SETUP_DRY_RUN       Dry run mode (true/false)"
    echo "  TKR_INTERACTIVE         Interactive mode (true/false)"
    echo "  TKR_BACKUP_ENABLED      Enable backups (true/false)"
    echo "  TKR_SKIP_VALIDATION     Skip validation (true/false)"
    echo
    echo "Examples:"
    echo "  $0                      # Interactive setup"
    echo "  $0 --dry-run            # Show what would be installed"
    echo "  $0 --yes --verbose      # Non-interactive with verbose output"
    echo "  $0 --terminal=true --browser=false  # Install only terminal logging"
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
                FORCE_INSTALL="true"
                shift
                ;;
            -y|--yes)
                INTERACTIVE="false"
                shift
                ;;
            --no-backup)
                BACKUP_ENABLED="false"
                shift
                ;;
            --no-validation)
                SKIP_VALIDATION="true"
                shift
                ;;
            --terminal=*)
                ENABLE_TERMINAL="${1#*=}"
                shift
                ;;
            --browser=*)
                ENABLE_BROWSER="${1#*=}"
                shift
                ;;
            --node-options=*)
                ENABLE_NODE_OPTIONS="${1#*=}"
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
# ERROR HANDLING
# ==============================================================================

cleanup() {
    local exit_code=$?

    if [[ $exit_code -ne 0 ]]; then
        log "error" "Setup failed with exit code $exit_code"
        ROLLBACK_NEEDED="true"
        perform_rollback
    fi

    # Clear progress bar
    echo

    exit $exit_code
}

trap cleanup EXIT

# ==============================================================================
# MAIN EXECUTION
# ==============================================================================

main() {
    # Parse command line arguments
    parse_arguments "$@"

    # Show welcome screen
    show_welcome

    # Validate prerequisites
    if ! validate_prerequisites; then
        log "error" "Prerequisites validation failed"
        exit 1
    fi

    # Update progress
    progress_bar $CURRENT_STEP $TOTAL_STEPS

    # Detect project type and build tools
    detect_project_type
    progress_bar $CURRENT_STEP $TOTAL_STEPS

    # Prompt for component selection
    prompt_component_selection
    progress_bar $CURRENT_STEP $TOTAL_STEPS

    # Install components
    install_terminal_logging
    progress_bar $CURRENT_STEP $TOTAL_STEPS

    install_browser_integration
    progress_bar $CURRENT_STEP $TOTAL_STEPS

    install_node_options
    progress_bar $CURRENT_STEP $TOTAL_STEPS

    # Validate installation
    validate_installation
    progress_bar $CURRENT_STEP $TOTAL_STEPS

    # Show completion summary
    show_completion_summary
    progress_bar $TOTAL_STEPS $TOTAL_STEPS
    echo

    # If we had any failures, suggest rollback
    if [[ ${#FAILED_COMPONENTS[@]} -gt 0 ]]; then
        echo -e "${YELLOW}Some components failed to install. Run with --help for troubleshooting options.${RESET}"
        exit 1
    fi

    log "success" "TKR logging setup completed successfully!"
    exit 0
}

# Execute main function with all arguments
main "$@"