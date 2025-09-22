#!/bin/bash
# TKR Context Kit - Build Tool Detection Script (Simplified)
# Automatically detects project build tools and suggests appropriate plugin setup
# Usage: ./detect-build-tool-simple.sh [project-dir]

set -euo pipefail

# Script metadata
SCRIPT_NAME="detect-build-tool"
SCRIPT_VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Configuration
PROJECT_DIR="${1:-$(pwd)}"
VERBOSE="${TKR_DETECT_VERBOSE:-false}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RESET='\033[0m'

# Detection results
DETECTED_TOOLS=()
DETECTED_COUNT=0

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

check_file_exists() {
    local file_path="$1"
    [[ -f "$PROJECT_DIR/$file_path" ]]
}

check_dir_exists() {
    local dir_path="$1"
    [[ -d "$PROJECT_DIR/$dir_path" ]]
}

# ==============================================================================
# BUILD TOOL DETECTION FUNCTIONS
# ==============================================================================

detect_vite() {
    log DEBUG "Detecting Vite configuration..."

    local vite_config=""
    local has_vite_dep=false

    # Check for Vite configuration files
    for config_file in "vite.config.js" "vite.config.ts" "vite.config.mjs" "vite.config.cjs"; do
        if check_file_exists "$config_file"; then
            vite_config="$config_file"
            break
        fi
    done

    # Check package.json for Vite dependency
    if check_file_exists "package.json"; then
        if grep -q '"vite"' "$PROJECT_DIR/package.json" 2>/dev/null; then
            has_vite_dep=true
        fi
    fi

    # Determine Vite usage
    if [[ -n "$vite_config" ]] || [[ "$has_vite_dep" == true ]]; then
        DETECTED_TOOLS+=("vite")
        ((DETECTED_COUNT++))
        log SUCCESS "✅ Vite detected - Configuration: ${vite_config:-package.json}"
        return 0
    fi

    return 1
}

detect_webpack() {
    log DEBUG "Detecting Webpack configuration..."

    local webpack_config=""
    local has_webpack_dep=false

    # Check for Webpack configuration files
    for config_file in "webpack.config.js" "webpack.config.ts" "webpack.config.babel.js"; do
        if check_file_exists "$config_file"; then
            webpack_config="$config_file"
            break
        fi
    done

    # Check package.json for Webpack dependency
    if check_file_exists "package.json"; then
        if grep -q '"webpack"' "$PROJECT_DIR/package.json" 2>/dev/null; then
            has_webpack_dep=true
        fi
    fi

    # Determine Webpack usage
    if [[ -n "$webpack_config" ]] || [[ "$has_webpack_dep" == true ]]; then
        DETECTED_TOOLS+=("webpack")
        ((DETECTED_COUNT++))
        log SUCCESS "✅ Webpack detected - Configuration: ${webpack_config:-package.json}"
        return 0
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
            break
        fi
    done

    # Check package.json for Next.js dependency
    if check_file_exists "package.json"; then
        if grep -q '"next"' "$PROJECT_DIR/package.json" 2>/dev/null; then
            has_next_dep=true
        fi
    fi

    if [[ -n "$nextjs_config" ]] || [[ "$has_next_dep" == true ]]; then
        DETECTED_TOOLS+=("nextjs")
        ((DETECTED_COUNT++))
        log SUCCESS "✅ Next.js detected - Configuration: ${nextjs_config:-package.json}"
        return 0
    fi

    return 1
}

detect_create_react_app() {
    log DEBUG "Detecting Create React App..."

    if check_file_exists "package.json"; then
        if grep -q '"react-scripts"' "$PROJECT_DIR/package.json" 2>/dev/null; then
            DETECTED_TOOLS+=("create-react-app")
            ((DETECTED_COUNT++))
            log SUCCESS "✅ Create React App detected"
            return 0
        fi
    fi

    return 1
}

detect_node_js() {
    log DEBUG "Detecting Node.js project..."

    local is_node_project=false

    # Check for package.json
    if check_file_exists "package.json"; then
        is_node_project=true
    fi

    # Check for common Node.js files
    for file in "server.js" "app.js" "index.js" "main.js"; do
        if check_file_exists "$file"; then
            is_node_project=true
            break
        fi
    done

    if [[ "$is_node_project" == true ]]; then
        DETECTED_TOOLS+=("nodejs")
        ((DETECTED_COUNT++))
        log SUCCESS "✅ Node.js project detected"
        return 0
    fi

    return 1
}

detect_typescript() {
    log DEBUG "Detecting TypeScript..."

    local has_typescript=false

    # Check for TypeScript configuration
    if check_file_exists "tsconfig.json"; then
        has_typescript=true
    fi

    # Check package.json for TypeScript dependency
    if check_file_exists "package.json"; then
        if grep -q '"typescript"' "$PROJECT_DIR/package.json" 2>/dev/null; then
            has_typescript=true
        fi
    fi

    if [[ "$has_typescript" == true ]]; then
        DETECTED_TOOLS+=("typescript")
        ((DETECTED_COUNT++))
        log SUCCESS "✅ TypeScript detected"
        return 0
    fi

    return 1
}

# ==============================================================================
# RECOMMENDATIONS GENERATION
# ==============================================================================

generate_recommendations() {
    echo
    echo "🔧 TKR LOGGING SETUP RECOMMENDATIONS"
    echo "=================================="

    if [[ $DETECTED_COUNT -eq 0 ]]; then
        echo
        echo "❌ No supported build tools detected"
        echo "Manual setup may be required"
        return
    fi

    echo
    echo "📦 Detected Tools: ${DETECTED_TOOLS[*]}"
    echo

    # Generate specific recommendations for each detected tool
    for tool in "${DETECTED_TOOLS[@]}"; do
        case "$tool" in
            "vite")
                echo "⚡ Vite Plugin Setup:"
                echo "   1. Add to your vite.config.js:"
                echo "      import tkrLogging from './.context-kit/logging-client/plugins/vite/index.js';"
                echo "      export default { plugins: [tkrLogging()] }"
                echo
                ;;
            "webpack")
                echo "📦 Webpack Plugin Setup:"
                echo "   1. Add to your webpack.config.js:"
                echo "      const TkrLogging = require('./.context-kit/logging-client/plugins/webpack/index.js');"
                echo "      module.exports = { plugins: [new TkrLogging()] }"
                echo
                ;;
            "nextjs")
                echo "⚛️  Next.js Setup:"
                echo "   1. Configure in next.config.js webpack function"
                echo "   2. Use TKR Webpack plugin in development mode"
                echo
                ;;
            "create-react-app")
                echo "⚛️  Create React App Setup:"
                echo "   1. Use CRACO to add TKR Webpack plugin"
                echo "   2. Or eject and modify webpack config"
                echo
                ;;
            "nodejs")
                echo "🟢 Node.js Setup:"
                echo "   1. Use NODE_OPTIONS: .context-kit/logging-client/installation-scripts/enable-node-options.sh"
                echo "   2. Or add to package.json scripts:"
                echo "      \"dev\": \"NODE_OPTIONS='--require ./.context-kit/logging-client/src/auto-init-enhanced.js' node server.js\""
                echo
                ;;
            "typescript")
                echo "📘 TypeScript:"
                echo "   ✅ TKR logging client supports TypeScript out of the box"
                echo
                ;;
        esac
    done

    echo "🔄 GENERAL SETUP STEPS:"
    echo "1. Enable terminal logging: .context-kit/logging-client/installation-scripts/enable-terminal.sh"
    echo "2. Configure build plugins as shown above"
    echo "3. Verify installation: .context-kit/logging-client/installation-scripts/verify-installation.sh"
    echo "4. Start your development server and check logs at http://localhost:42001"
    echo
}

# ==============================================================================
# MAIN SCRIPT EXECUTION
# ==============================================================================

main() {
    log INFO "TKR Logging Build Tool Detection v$SCRIPT_VERSION"
    log INFO "Scanning project: $PROJECT_DIR"

    # Verify project directory exists
    if [[ ! -d "$PROJECT_DIR" ]]; then
        log ERROR "Project directory does not exist: $PROJECT_DIR"
        exit 1
    fi

    # Change to project directory
    cd "$PROJECT_DIR"

    # Check if it's a context-kit project
    if check_dir_exists ".context-kit"; then
        log INFO "✅ Context Kit project detected"
    else
        log WARN "⚠️  Not a Context Kit project - additional configuration may be required"
    fi

    echo
    log INFO "🔍 Detecting build tools and project configuration..."

    # Run all detection functions (order matters - more specific first)
    detect_create_react_app
    detect_next_js
    detect_vite
    detect_webpack
    detect_typescript
    detect_node_js

    echo
    if [[ $DETECTED_COUNT -gt 0 ]]; then
        log SUCCESS "Detection complete: $DETECTED_COUNT tools found"
        generate_recommendations
    else
        log WARN "No supported build tools detected"
        echo
        echo "💡 MANUAL SETUP OPTIONS:"
        echo "1. For browser projects: Use .context-kit/logging-client/browser/ directly"
        echo "2. For Node.js projects: Use .context-kit/logging-client/installation-scripts/enable-node-options.sh"
        echo "3. For shell integration: Use .context-kit/logging-client/installation-scripts/enable-terminal.sh"
    fi

    echo
    echo "📋 Available Integration Components:"
    echo "   📁 Shell: .context-kit/shell/tkr-logging.sh"
    echo "   🌐 Browser: .context-kit/logging-client/browser/"
    echo "   ⚡ Vite: .context-kit/plugins/vite/"
    echo "   📦 Webpack: .context-kit/plugins/webpack/"
    echo "   🔧 Node.js: .context-kit/logging-client/src/auto-init-enhanced.js"
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

EXAMPLES:
    $0                    # Detect in current directory
    $0 /path/to/project   # Detect in specific directory
    TKR_DETECT_VERBOSE=true $0  # Enable verbose output

EOF
    exit 0
fi

# Run main function
main "$@"