#!/usr/bin/env bash
# TKR Context Kit - Build Tool Detection Script
# Automatically detects project build tools and suggests appropriate plugin setup
# Usage: ./detect-build-tool.sh [project-dir]

set -euo pipefail

# Script metadata
SCRIPT_NAME="detect-build-tool"
SCRIPT_VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Configuration
PROJECT_DIR="${1:-$(pwd)}"
VERBOSE="${TKR_DETECT_VERBOSE:-false}"
DRY_RUN="${TKR_DETECT_DRY_RUN:-false}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RESET='\033[0m'

# Detection results structure (compatible with bash 3.x+)
DETECTED_TOOLS=""
DETECTED_CONFIGS=""
PLUGIN_RECOMMENDATIONS=""

# Helper functions for pseudo-associative arrays (bash 3.x compatible)
set_detected_config() {
    local key="$1"
    local value="$2"
    DETECTED_CONFIGS="$DETECTED_CONFIGS${DETECTED_CONFIGS:+ }$key:$value"
}

get_detected_config() {
    local key="$1"
    echo "$DETECTED_CONFIGS" | tr ' ' '\n' | grep "^$key:" | cut -d: -f2- | head -1
}

set_plugin_recommendation() {
    local key="$1"
    local value="$2"
    PLUGIN_RECOMMENDATIONS="$PLUGIN_RECOMMENDATIONS${PLUGIN_RECOMMENDATIONS:+ }$key:$value"
}

get_plugin_recommendation() {
    local key="$1"
    echo "$PLUGIN_RECOMMENDATIONS" | tr ' ' '\n' | grep "^$key:" | cut -d: -f2- | head -1
}

add_detected_tool() {
    local tool="$1"
    DETECTED_TOOLS="$DETECTED_TOOLS${DETECTED_TOOLS:+ }$tool"
}

has_detected_tool() {
    local tool="$1"
    echo "$DETECTED_TOOLS" | grep -q "\b$tool\b"
}

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

check_file_exists() {
    local file_path="$1"
    [[ -f "$PROJECT_DIR/$file_path" ]]
}

check_dir_exists() {
    local dir_path="$1"
    [[ -d "$PROJECT_DIR/$dir_path" ]]
}

get_file_content() {
    local file_path="$1"
    if check_file_exists "$file_path"; then
        cat "$PROJECT_DIR/$file_path"
    fi
}

# ==============================================================================
# BUILD TOOL DETECTION FUNCTIONS
# ==============================================================================

detect_vite() {
    log DEBUG "Detecting Vite configuration..."

    local vite_config=""
    local package_json_content=""
    local has_vite_dep=false

    # Check for Vite configuration files
    for config_file in "vite.config.js" "vite.config.ts" "vite.config.mjs" "vite.config.cjs"; do
        if check_file_exists "$config_file"; then
            vite_config="$config_file"
            set_detected_config "vite" "$config_file"
            log DEBUG "Found Vite config: $config_file"
            break
        fi
    done

    # Check package.json for Vite dependency
    if check_file_exists "package.json"; then
        package_json_content="$(get_file_content "package.json")"
        if echo "$package_json_content" | grep -q '"vite"'; then
            has_vite_dep=true
            log DEBUG "Found Vite dependency in package.json"
        fi
    fi

    # Determine Vite usage
    if [[ -n "$vite_config" ]] || [[ "$has_vite_dep" == true ]]; then
        add_detected_tool "vite"

        # Generate plugin recommendation
        local plugin_path="$SCRIPT_DIR/../plugins/vite/index.js"
        set_plugin_recommendation "vite" "Import and configure TKR Logging Vite plugin in $vite_config"

        log SUCCESS "Vite detected - Configuration: ${vite_config:-package.json}"
        return 0
    fi

    return 1
}

detect_webpack() {
    log DEBUG "Detecting Webpack configuration..."

    local webpack_config=""
    local package_json_content=""
    local has_webpack_dep=false

    # Check for Webpack configuration files
    for config_file in "webpack.config.js" "webpack.config.ts" "webpack.config.babel.js" "webpack.config.prod.js" "webpack.config.dev.js"; do
        if check_file_exists "$config_file"; then
            webpack_config="$config_file"
            set_detected_config "webpack" "$config_file"
            log DEBUG "Found Webpack config: $config_file"
            break
        fi
    done

    # Check package.json for Webpack dependency
    if check_file_exists "package.json"; then
        package_json_content="$(get_file_content "package.json")"
        if echo "$package_json_content" | grep -q '"webpack"'; then
            has_webpack_dep=true
            log DEBUG "Found Webpack dependency in package.json"
        fi
    fi

    # Determine Webpack usage
    if [[ -n "$webpack_config" ]] || [[ "$has_webpack_dep" == true ]]; then
        add_detected_tool "webpack"

        # Generate plugin recommendation
        local plugin_path="$SCRIPT_DIR/../plugins/webpack/index.js"
        set_plugin_recommendation "webpack" "Import and configure TKR Logging Webpack plugin in $webpack_config"

        log SUCCESS "Webpack detected - Configuration: ${webpack_config:-package.json}"
        return 0
    fi

    return 1
}

detect_create_react_app() {
    log DEBUG "Detecting Create React App..."

    if check_file_exists "package.json"; then
        local package_json_content="$(get_file_content "package.json")"
        if echo "$package_json_content" | grep -q '"react-scripts"'; then
            add_detected_tool "create-react-app"
            set_plugin_recommendation "create-react-app" "Use CRACO or eject to add TKR Logging Webpack plugin"
            log SUCCESS "Create React App detected"
            return 0
        fi
    fi

    return 1
}

detect_next_js() {
    log DEBUG "Detecting Next.js..."

    local nextjs_config=""
    local has_next_dep=false

    # Check for Next.js configuration
    for config_file in "next.config.js" "next.config.mjs" "next.config.ts"; do
        if check_file_exists "$config_file"; then
            nextjs_config="$config_file"
            set_detected_config "nextjs" "$config_file"
            break
        fi
    done

    # Check package.json for Next.js dependency
    if check_file_exists "package.json"; then
        local package_json_content="$(get_file_content "package.json")"
        if echo "$package_json_content" | grep -q '"next"'; then
            has_next_dep=true
        fi
    fi

    if [[ -n "$nextjs_config" ]] || [[ "$has_next_dep" == true ]]; then
        add_detected_tool "nextjs"
        set_plugin_recommendation "nextjs" "Configure TKR Logging Webpack plugin in Next.js config webpack function"
        log SUCCESS "Next.js detected - Configuration: ${nextjs_config:-package.json}"
        return 0
    fi

    return 1
}

detect_node_js() {
    log DEBUG "Detecting Node.js project..."

    local is_node_project=false

    # Check for package.json
    if check_file_exists "package.json"; then
        is_node_project=true
        set_detected_config "nodejs" "package.json"
    fi

    # Check for common Node.js files
    for file in "server.js" "app.js" "index.js" "main.js"; do
        if check_file_exists "$file"; then
            is_node_project=true
            local existing_config="$(get_detected_config "nodejs")"
            set_detected_config "nodejs" "${existing_config}${existing_config:+ }$file"
            break
        fi
    done

    if [[ "$is_node_project" == true ]]; then
        add_detected_tool "nodejs"
        set_plugin_recommendation "nodejs" "Use NODE_OPTIONS to require auto-init enhanced logging client"
        log SUCCESS "Node.js project detected"
        return 0
    fi

    return 1
}

detect_typescript() {
    log DEBUG "Detecting TypeScript..."

    local ts_config=""
    local has_ts_dep=false

    # Check for TypeScript configuration
    if check_file_exists "tsconfig.json"; then
        ts_config="tsconfig.json"
        set_detected_config "typescript" "tsconfig.json"
    fi

    # Check package.json for TypeScript dependency
    if check_file_exists "package.json"; then
        local package_json_content="$(get_file_content "package.json")"
        if echo "$package_json_content" | grep -q '"typescript"'; then
            has_ts_dep=true
        fi
    fi

    if [[ -n "$ts_config" ]] || [[ "$has_ts_dep" == true ]]; then
        add_detected_tool "typescript"
        set_plugin_recommendation "typescript" "TypeScript detected - logging client supports TS out of the box"
        log SUCCESS "TypeScript detected"
        return 0
    fi

    return 1
}

# ==============================================================================
# MAIN DETECTION LOGIC
# ==============================================================================

run_detection() {
    log INFO "Detecting build tools in: $PROJECT_DIR"

    # Verify project directory exists
    if [[ ! -d "$PROJECT_DIR" ]]; then
        log ERROR "Project directory does not exist: $PROJECT_DIR"
        exit 1
    fi

    # Check if it's a context-kit project
    if check_dir_exists ".context-kit"; then
        log INFO "Context Kit project detected"
    else
        log WARN "Not a Context Kit project - logging setup may require additional configuration"
    fi

    # Run all detection functions
    local detected_count=0

    # Build tools (order matters - more specific first)
    if detect_create_react_app; then ((detected_count++)); fi
    if detect_next_js; then ((detected_count++)); fi
    if detect_vite; then ((detected_count++)); fi
    if detect_webpack; then ((detected_count++)); fi

    # Language/runtime
    if detect_typescript; then ((detected_count++)); fi
    if detect_node_js; then ((detected_count++)); fi

    if [[ $detected_count -eq 0 ]]; then
        log WARN "No supported build tools detected"
        log INFO "Manual setup may be required - this is not an error for multi-module projects"
        log INFO "Terminal logging and Node.js options can still be configured"
    else
        log INFO "Detection complete: $detected_count tools found"
    fi

    return 0
}

generate_setup_recommendations() {
    log INFO "Generating setup recommendations..."

    echo
    echo "🔧 TKR LOGGING SETUP RECOMMENDATIONS"
    echo "=================================="

    # Build tool specific recommendations
    for tool in $DETECTED_TOOLS; do
        local recommendation="$(get_plugin_recommendation "$tool")"
        if [[ -n "$recommendation" ]]; then
            echo
            echo "📦 $tool:"
            echo "   $recommendation"

            # Add specific configuration examples
            case "$tool" in
                "vite")
                    echo "
   Example vite.config.js:
   import tkrLogging from './.context-kit/plugins/vite/index.js';

   export default {
     plugins: [
       tkrLogging({
         enabled: process.env.NODE_ENV === 'development',
         clientUrl: 'http://localhost:42003/api/logging-client.js'
       })
     ]
   };"
                    ;;
                "webpack")
                    echo "
   Example webpack.config.js:
   const TkrLoggingPlugin = require('./.context-kit/plugins/webpack/index.js');

   module.exports = {
     plugins: [
       new TkrLoggingPlugin({
         enabled: process.env.NODE_ENV === 'development'
       })
     ]
   };"
                    ;;
                "nodejs")
                    echo "
   Add to package.json scripts:
   {
     \"scripts\": {
       \"dev\": \"NODE_OPTIONS='--require ./.context-kit/logging-client/src/auto-init-enhanced.js' node server.js\"
     }
   }"
                    ;;
            esac
        fi
    done

    # General recommendations
    echo
    echo "🔄 GENERAL SETUP STEPS:"
    echo "1. Enable terminal logging: .context-kit/logging-client/installation-scripts/enable-terminal.sh"
    echo "2. Configure build plugins as shown above"
    echo "3. Verify installation: .context-kit/logging-client/installation-scripts/verify-installation.sh"
    echo "4. Start your development server and check logs at http://localhost:42001"

    echo
}

print_detection_summary() {
    echo
    echo "📊 DETECTION SUMMARY"
    echo "==================="

    echo
    echo "Detected Tools:"
    if [[ -n "$DETECTED_TOOLS" ]]; then
        for tool in $DETECTED_TOOLS; do
            local config="$(get_detected_config "$tool")"
            echo "  ✅ $tool (config: ${config:-N/A})"
        done
    else
        echo "  ❌ No supported build tools detected"
    fi

    echo
    echo "Available Integrations:"
    echo "  📁 Shell: .context-kit/logging-client/shell/tkr-logging.sh"
    echo "  🌐 Browser: .context-kit/logging-client/browser/"
    echo "  ⚡ Vite: .context-kit/logging-client/plugins/vite/"
    echo "  📦 Webpack: .context-kit/logging-client/plugins/webpack/"
    echo "  🔧 Node.js: .context-kit/logging-client/src/auto-init-enhanced.js"
}

# ==============================================================================
# MAIN SCRIPT EXECUTION
# ==============================================================================

main() {
    log INFO "TKR Logging Build Tool Detection v$SCRIPT_VERSION"

    # Change to project directory
    cd "$PROJECT_DIR"

    # Run detection (always succeeds now)
    run_detection
    print_detection_summary
    generate_setup_recommendations

    if [[ "$DRY_RUN" == "true" ]]; then
        log INFO "Dry run complete - no changes made"
    fi

    exit 0
}

# Show help if requested
if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
    cat << EOF
TKR Logging Build Tool Detection Script

USAGE:
    $0 [project-dir]

OPTIONS:
    -h, --help          Show this help message
    project-dir         Project directory to analyze (default: current directory)

ENVIRONMENT VARIABLES:
    TKR_DETECT_VERBOSE    Enable verbose logging (true/false, default: false)
    TKR_DETECT_DRY_RUN    Run without making changes (true/false, default: false)

EXAMPLES:
    $0                    # Detect in current directory
    $0 /path/to/project   # Detect in specific directory
    TKR_DETECT_VERBOSE=true $0  # Enable verbose output

EOF
    exit 0
fi

# Run main function
main "$@"