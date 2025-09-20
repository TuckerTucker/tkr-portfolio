#!/bin/bash
# TKR Context Kit - NODE_OPTIONS Configuration Script
# Sets up automatic Node.js logging via NODE_OPTIONS with smart process filtering
# Usage: ./enable-node-options.sh [options]

set -euo pipefail

# Script metadata
SCRIPT_NAME="enable-node-options"
SCRIPT_VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../" && pwd)"

# Configuration
FORCE_INSTALL="${TKR_FORCE_INSTALL:-false}"
VERBOSE="${TKR_INSTALL_VERBOSE:-false}"
DRY_RUN="${TKR_INSTALL_DRY_RUN:-false}"
BACKUP_ENABLED="${TKR_BACKUP_ENABLED:-true}"
GLOBAL_INSTALL="${TKR_GLOBAL_INSTALL:-false}"

# NODE_OPTIONS markers for clean uninstall
TKR_NODE_MARKER_START="# >>> TKR Context Kit NODE_OPTIONS >>>"
TKR_NODE_MARKER_END="# <<< TKR Context Kit NODE_OPTIONS <<<"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RESET='\033[0m'

# Configuration targets
declare -A CONFIG_TARGETS=()
MODIFIED_FILES=()
INSTALLATION_MODE=""

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

create_backup() {
    local file="$1"
    local backup_file="${file}.tkr-node-backup.$(date +%Y%m%d_%H%M%S)"

    if [[ "$BACKUP_ENABLED" == "true" && -f "$file" ]]; then
        if [[ "$DRY_RUN" == "false" ]]; then
            cp "$file" "$backup_file"
            log SUCCESS "Backup created: $backup_file"
        else
            log INFO "Would create backup: $backup_file"
        fi
        return 0
    fi
    return 1
}

is_node_options_configured() {
    local file="$1"
    [[ -f "$file" ]] && grep -q "$TKR_NODE_MARKER_START" "$file"
}

# ==============================================================================
# ENVIRONMENT DETECTION
# ==============================================================================

detect_shell_environments() {
    log DEBUG "Detecting shell environments for NODE_OPTIONS setup..."

    # Shell RC files that might set NODE_OPTIONS
    local shell_files=(
        "$HOME/.bashrc"
        "$HOME/.zshrc"
        "$HOME/.config/fish/config.fish"
        "$HOME/.profile"
        "$HOME/.bash_profile"
        "$HOME/.zprofile"
    )

    for file in "${shell_files[@]}"; do
        if [[ -f "$file" ]]; then
            CONFIG_TARGETS["shell:$file"]="shell"
            log DEBUG "Found shell config: $file"
        fi
    done
}

detect_package_json_projects() {
    log DEBUG "Detecting package.json files for project-specific NODE_OPTIONS..."

    if [[ "$GLOBAL_INSTALL" == "true" ]]; then
        log DEBUG "Skipping package.json detection (global install mode)"
        return
    fi

    # Look for package.json in current project
    if [[ -f "$PROJECT_ROOT/package.json" ]]; then
        CONFIG_TARGETS["package:$PROJECT_ROOT/package.json"]="package"
        log DEBUG "Found project package.json: $PROJECT_ROOT/package.json"
    fi

    # Look for package.json in current directory if different
    local current_package="$(pwd)/package.json"
    if [[ -f "$current_package" && "$current_package" != "$PROJECT_ROOT/package.json" ]]; then
        CONFIG_TARGETS["package:$current_package"]="package"
        log DEBUG "Found current directory package.json: $current_package"
    fi
}

detect_existing_node_options() {
    log DEBUG "Checking for existing NODE_OPTIONS configurations..."

    # Check environment
    if [[ -n "${NODE_OPTIONS:-}" ]]; then
        log INFO "Current NODE_OPTIONS: $NODE_OPTIONS"

        if echo "$NODE_OPTIONS" | grep -q "auto-init-enhanced.js"; then
            log WARN "TKR logging already configured in current NODE_OPTIONS"
        fi
    fi

    # Check if any target files already have TKR NODE_OPTIONS
    for target in "${!CONFIG_TARGETS[@]}"; do
        local file="${target#*:}"
        if is_node_options_configured "$file"; then
            log WARN "TKR NODE_OPTIONS already configured in: $file"
        fi
    done
}

# ==============================================================================
# NODE_OPTIONS GENERATION
# ==============================================================================

generate_node_options_value() {
    local auto_init_path="$PROJECT_ROOT/.context-kit/logging-client/src/auto-init-enhanced.js"

    # Make path relative if it's within home directory
    local relative_path="$auto_init_path"
    if [[ "$auto_init_path" == "$HOME"* ]]; then
        relative_path="\$HOME${auto_init_path#$HOME}"
    fi

    # Generate the require statement
    echo "--require $relative_path"
}

generate_shell_node_options() {
    local shell_type="$1"
    local auto_init_path="$PROJECT_ROOT/.context-kit/logging-client/src/auto-init-enhanced.js"
    local node_options_value="$(generate_node_options_value)"

    case "$shell_type" in
        "fish")
            cat << EOF
$TKR_NODE_MARKER_START
# TKR Context Kit - NODE_OPTIONS for automatic logging
# Auto-generated on $(date)

# Check if auto-init script exists
if test -f "$auto_init_path"
    # Append to existing NODE_OPTIONS or create new
    if set -q NODE_OPTIONS
        set -gx NODE_OPTIONS "\$NODE_OPTIONS $node_options_value"
    else
        set -gx NODE_OPTIONS "$node_options_value"
    end
end
$TKR_NODE_MARKER_END
EOF
            ;;
        *)
            # bash/zsh compatible
            cat << EOF
$TKR_NODE_MARKER_START
# TKR Context Kit - NODE_OPTIONS for automatic logging
# Auto-generated on $(date)

# Check if auto-init script exists
if [[ -f "$auto_init_path" ]]; then
    # Append to existing NODE_OPTIONS or create new
    if [[ -n "\${NODE_OPTIONS:-}" ]]; then
        export NODE_OPTIONS="\$NODE_OPTIONS $node_options_value"
    else
        export NODE_OPTIONS="$node_options_value"
    fi
fi
$TKR_NODE_MARKER_END
EOF
            ;;
    esac
}

generate_package_json_scripts() {
    local package_file="$1"
    local node_options_value="$(generate_node_options_value)"

    log DEBUG "Analyzing package.json: $package_file"

    if [[ ! -f "$package_file" ]]; then
        log ERROR "Package file not found: $package_file"
        return 1
    fi

    # Read current package.json
    local package_content="$(cat "$package_file")"

    # Check if it has scripts section
    if ! echo "$package_content" | grep -q '"scripts"'; then
        log WARN "No scripts section found in $package_file"
        return 1
    fi

    log INFO "Package.json modification suggestions for $package_file:"
    log INFO "Add NODE_OPTIONS='$node_options_value' to your script commands"
    log INFO "Example:"
    log INFO "  \"dev\": \"NODE_OPTIONS='$node_options_value' node server.js\""
    log INFO "  \"start\": \"NODE_OPTIONS='$node_options_value' npm run build && node dist/server.js\""

    return 0
}

# ==============================================================================
# INSTALLATION FUNCTIONS
# ==============================================================================

install_to_shell_file() {
    local file="$1"
    local shell_type="$2"

    log INFO "Installing NODE_OPTIONS to $file ($shell_type)..."

    # Check if already configured
    if is_node_options_configured "$file"; then
        if [[ "$FORCE_INSTALL" == "true" ]]; then
            log WARN "NODE_OPTIONS already configured in $file - forcing reinstall"
            remove_from_shell_file "$file"
        else
            log WARN "NODE_OPTIONS already configured in $file - skipping (use --force to override)"
            return 0
        fi
    fi

    # Create backup
    create_backup "$file"

    # Generate configuration
    local config_content="$(generate_shell_node_options "$shell_type")"

    if [[ "$DRY_RUN" == "false" ]]; then
        # Append to file
        echo "" >> "$file"
        echo "$config_content" >> "$file"
        log SUCCESS "NODE_OPTIONS configuration added to $file"
        MODIFIED_FILES+=("$file")
    else
        log INFO "Would add NODE_OPTIONS configuration to $file"
        log DEBUG "Configuration content:"
        echo "$config_content" | sed 's/^/  /'
    fi
}

remove_from_shell_file() {
    local file="$1"

    if [[ ! -f "$file" ]] || ! is_node_options_configured "$file"; then
        return 0
    fi

    log DEBUG "Removing existing NODE_OPTIONS configuration from $file"

    if [[ "$DRY_RUN" == "false" ]]; then
        local temp_file="$(mktemp)"
        sed "/$TKR_NODE_MARKER_START/,/$TKR_NODE_MARKER_END/d" "$file" > "$temp_file"
        mv "$temp_file" "$file"
        log DEBUG "Removed existing NODE_OPTIONS configuration from $file"
    fi
}

handle_package_json() {
    local package_file="$1"

    log INFO "Handling package.json: $package_file"

    # For package.json, we provide guidance rather than automatic modification
    generate_package_json_scripts "$package_file"

    log INFO "Manual package.json modification required"
    log INFO "Alternatively, consider using shell-level NODE_OPTIONS instead"
}

# ==============================================================================
# VALIDATION AND VERIFICATION
# ==============================================================================

validate_environment() {
    log INFO "Validating NODE_OPTIONS installation environment..."

    # Check if auto-init script exists
    local auto_init="$PROJECT_ROOT/.context-kit/logging-client/src/auto-init-enhanced.js"
    if [[ ! -f "$auto_init" ]]; then
        log ERROR "Auto-init script not found: $auto_init"
        log ERROR "Please ensure Wave 1 logging components are installed"
        exit 1
    fi

    # Check if script is readable
    if [[ ! -r "$auto_init" ]]; then
        log ERROR "Auto-init script is not readable: $auto_init"
        exit 1
    fi

    # Verify Node.js is available
    if ! command -v node >/dev/null 2>&1; then
        log WARN "Node.js not found in PATH - NODE_OPTIONS may not be effective"
        log INFO "Please ensure Node.js is installed and available"
    else
        local node_version="$(node --version 2>/dev/null || echo "unknown")"
        log SUCCESS "Node.js detected: $node_version"
    fi

    log SUCCESS "Environment validation passed"
}

test_node_options() {
    log INFO "Testing NODE_OPTIONS configuration..."

    local auto_init="$PROJECT_ROOT/.context-kit/logging-client/src/auto-init-enhanced.js"
    local node_options_value="$(generate_node_options_value)"

    if [[ "$DRY_RUN" == "true" ]]; then
        log INFO "Would test with: NODE_OPTIONS='$node_options_value' node -e 'console.log(\"test\")'"
        return 0
    fi

    # Test the configuration
    log DEBUG "Testing: NODE_OPTIONS='$node_options_value' node -e 'console.log(\"NODE_OPTIONS test\")'"

    if NODE_OPTIONS="$node_options_value" node -e 'console.log("NODE_OPTIONS test successful")' 2>/dev/null; then
        log SUCCESS "NODE_OPTIONS configuration test passed"
    else
        log ERROR "NODE_OPTIONS configuration test failed"
        log ERROR "Please check the auto-init script and Node.js installation"
        return 1
    fi
}

# ==============================================================================
# INSTALLATION ORCHESTRATION
# ==============================================================================

determine_installation_mode() {
    local shell_count=0
    local package_count=0

    for target in "${!CONFIG_TARGETS[@]}"; do
        case "$target" in
            shell:*) ((shell_count++)) ;;
            package:*) ((package_count++)) ;;
        esac
    done

    if [[ "$GLOBAL_INSTALL" == "true" ]]; then
        INSTALLATION_MODE="global"
        log INFO "Installation mode: Global (shell-level NODE_OPTIONS)"
    elif [[ $package_count -gt 0 ]] && [[ $shell_count -gt 0 ]]; then
        INSTALLATION_MODE="hybrid"
        log INFO "Installation mode: Hybrid (shell + package.json guidance)"
    elif [[ $package_count -gt 0 ]]; then
        INSTALLATION_MODE="package"
        log INFO "Installation mode: Package-specific (package.json guidance)"
    else
        INSTALLATION_MODE="shell"
        log INFO "Installation mode: Shell-level NODE_OPTIONS"
    fi
}

run_installation() {
    log INFO "Starting NODE_OPTIONS installation..."

    # Detection phase
    detect_shell_environments
    detect_package_json_projects
    detect_existing_node_options

    # Determine installation strategy
    determine_installation_mode

    if [[ ${#CONFIG_TARGETS[@]} -eq 0 ]]; then
        log ERROR "No valid configuration targets found"
        log INFO "Please ensure you have shell configuration files or package.json"
        exit 1
    fi

    # Installation phase
    local installed_count=0

    for target in "${!CONFIG_TARGETS[@]}"; do
        local file="${target#*:}"
        local type="${CONFIG_TARGETS[$target]}"

        case "$type" in
            "shell")
                local shell_type="bash"

                # Determine shell type from filename
                if [[ "$file" == *"zsh"* ]]; then
                    shell_type="zsh"
                elif [[ "$file" == *"fish"* ]]; then
                    shell_type="fish"
                fi

                install_to_shell_file "$file" "$shell_type"
                ((installed_count++))
                ;;
            "package")
                handle_package_json "$file"
                ;;
        esac
    done

    log SUCCESS "Installation process complete"

    # Test configuration if shell files were modified
    if [[ ${#MODIFIED_FILES[@]} -gt 0 ]]; then
        test_node_options
    fi
}

# ==============================================================================
# COMMAND LINE PARSING
# ==============================================================================

show_help() {
    cat << EOF
TKR NODE_OPTIONS Configuration Script

USAGE:
    $0 [options]

OPTIONS:
    -h, --help          Show this help message
    -f, --force         Force installation even if already configured
    -g, --global        Install globally (shell-level) even if package.json exists
    -n, --dry-run       Show what would be done without making changes
    -v, --verbose       Enable verbose logging
    --no-backup         Skip creating backup files

ENVIRONMENT VARIABLES:
    TKR_FORCE_INSTALL     Force installation (true/false, default: false)
    TKR_GLOBAL_INSTALL    Install globally (true/false, default: false)
    TKR_INSTALL_VERBOSE   Enable verbose logging (true/false, default: false)
    TKR_INSTALL_DRY_RUN   Run without making changes (true/false, default: false)
    TKR_BACKUP_ENABLED    Create backup files (true/false, default: true)

INSTALLATION MODES:
    Shell-level    : Adds NODE_OPTIONS to shell RC files (recommended for development)
    Package-level  : Provides guidance for modifying package.json scripts
    Hybrid         : Combines both approaches with user guidance

EXAMPLES:
    $0                    # Auto-detect best installation mode
    $0 --global           # Force shell-level installation
    $0 --dry-run          # Preview changes without installing
    $0 --force            # Reinstall even if already configured

The script will:
1. Detect available shell configurations and package.json files
2. Choose the most appropriate installation method
3. Configure NODE_OPTIONS to automatically load TKR logging
4. Test the configuration to ensure it works
5. Provide usage instructions

For package.json integration, manual script modification is recommended:
    "dev": "NODE_OPTIONS='--require ./.context-kit/logging-client/src/auto-init-enhanced.js' node server.js"

EOF
}

# Parse command line arguments
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
        -g|--global)
            GLOBAL_INSTALL=true
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
    log INFO "TKR NODE_OPTIONS Configuration v$SCRIPT_VERSION"

    # Validate environment
    validate_environment

    # Run installation
    run_installation

    # Generate usage instructions
    echo
    echo "🔄 NEXT STEPS:"
    echo "=============="

    if [[ ${#MODIFIED_FILES[@]} -gt 0 ]]; then
        echo "1. Restart your terminal or source your RC files:"
        for file in "${MODIFIED_FILES[@]}"; do
            echo "   source $file"
        done
        echo "2. Run Node.js applications to see automatic logging"
        echo "3. Check logs at: http://localhost:42001"
    else
        echo "1. Manually configure package.json scripts as shown above"
        echo "2. Run your applications with the modified scripts"
        echo "3. Check logs at: http://localhost:42001"
    fi

    echo "4. Verify installation: .context-kit/scripts/logging/verify-installation.sh"

    if [[ "$DRY_RUN" == "true" ]]; then
        log INFO "Dry run complete - no changes made"
        log INFO "Run without --dry-run to apply changes"
    fi
}

# Run main function
main "$@"