#!/bin/bash
# TKR Context Kit - Installation Verification Script
# Comprehensive validation of all logging components and integrations
# Usage: ./verify-installation.sh [options]

set -euo pipefail

# Script metadata
SCRIPT_NAME="verify-installation"
SCRIPT_VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../" && pwd)"

# Configuration
VERBOSE="${TKR_VERIFY_VERBOSE:-false}"
DETAILED="${TKR_VERIFY_DETAILED:-false}"
QUICK_MODE="${TKR_VERIFY_QUICK:-false}"
REPORT_FILE="${TKR_VERIFY_REPORT:-}"

# Test results tracking
declare -A TEST_RESULTS=()
declare -A TEST_DETAILS=()
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# Test categories
WAVE1_COMPONENTS=(
    "shell-script"
    "browser-client"
    "vite-plugin"
    "webpack-plugin"
    "logging-client"
    "backend-api"
)

WAVE2_INTEGRATIONS=(
    "terminal-integration"
    "node-options-config"
    "build-tool-detection"
)

SYSTEM_SERVICES=(
    "knowledge-graph-api"
    "dashboard-service"
    "logging-endpoints"
)

# ==============================================================================
# UTILITY FUNCTIONS
# ==============================================================================

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp="$(date '+%H:%M:%S')"

    case "$level" in
        INFO)  echo -e "${BLUE}[$timestamp INFO]${RESET} $message" ;;
        WARN)  echo -e "${YELLOW}[$timestamp WARN]${RESET} $message" ;;
        ERROR) echo -e "${RED}[$timestamp ERROR]${RESET} $message" >&2 ;;
        SUCCESS) echo -e "${GREEN}[$timestamp SUCCESS]${RESET} $message" ;;
        DEBUG) [[ "$VERBOSE" == "true" ]] && echo -e "${CYAN}[$timestamp DEBUG]${RESET} $message" ;;
        TEST) echo -e "${BOLD}[$timestamp TEST]${RESET} $message" ;;
    esac
}

# Test execution framework
run_test() {
    local test_name="$1"
    local test_function="$2"
    local test_category="${3:-general}"

    ((TOTAL_TESTS++))

    log TEST "Running: $test_name"

    local start_time="$(date +%s%N)"
    local result="UNKNOWN"
    local details=""

    # Execute test function
    if $test_function details; then
        result="PASS"
        ((PASSED_TESTS++))
        log SUCCESS "$test_name: PASSED"
    else
        result="FAIL"
        ((FAILED_TESTS++))
        log ERROR "$test_name: FAILED"
    fi

    local end_time="$(date +%s%N)"
    local duration="$(( (end_time - start_time) / 1000000 ))" # Convert to milliseconds

    # Store results
    TEST_RESULTS["$test_name"]="$result"
    TEST_DETAILS["$test_name"]="$details (${duration}ms)"

    [[ "$DETAILED" == "true" ]] && [[ -n "$details" ]] && log DEBUG "$test_name details: $details"

    return $([ "$result" == "PASS" ] && echo 0 || echo 1)
}

skip_test() {
    local test_name="$1"
    local reason="$2"

    ((TOTAL_TESTS++))
    ((SKIPPED_TESTS++))

    TEST_RESULTS["$test_name"]="SKIP"
    TEST_DETAILS["$test_name"]="$reason"

    log WARN "$test_name: SKIPPED ($reason)"
}

# ==============================================================================
# WAVE 1 COMPONENT TESTS
# ==============================================================================

test_shell_script() {
    local details_ref="$1"
    local shell_script="$PROJECT_ROOT/.context-kit/shell/tkr-logging.sh"

    # Check if file exists
    if [[ ! -f "$shell_script" ]]; then
        eval "$details_ref='Shell script not found'"
        return 1
    fi

    # Check if executable
    if [[ ! -x "$shell_script" ]]; then
        eval "$details_ref='Shell script not executable'"
        return 1
    fi

    # Check if config file exists
    local config_script="$PROJECT_ROOT/.context-kit/shell/config.sh"
    if [[ ! -f "$config_script" ]]; then
        eval "$details_ref='Config script not found'"
        return 1
    fi

    # Test basic syntax
    if ! bash -n "$shell_script" 2>/dev/null; then
        eval "$details_ref='Syntax errors in shell script'"
        return 1
    fi

    # Test if functions are defined (basic smoke test)
    local temp_script="$(mktemp)"
    cat << 'EOF' > "$temp_script"
source "$1"
if declare -f tkr_should_log >/dev/null && \
   declare -f tkr_send_log >/dev/null && \
   declare -f tkr_log_pipe >/dev/null; then
    echo "SUCCESS"
else
    echo "MISSING_FUNCTIONS"
fi
EOF

    local test_result="$(bash "$temp_script" "$shell_script" 2>/dev/null || echo "ERROR")"
    rm -f "$temp_script"

    if [[ "$test_result" == "SUCCESS" ]]; then
        eval "$details_ref='Shell functions available and syntax valid'"
        return 0
    else
        eval "$details_ref='Shell functions missing or syntax invalid'"
        return 1
    fi
}

test_browser_client() {
    local details_ref="$1"
    local browser_dir="$PROJECT_ROOT/.context-kit/browser-client"

    if [[ ! -d "$browser_dir" ]]; then
        eval "$details_ref='Browser client directory not found'"
        return 1
    fi

    # Check for key files
    local required_files=("tkr-logging-client.js" "package.json")
    local missing_files=()

    for file in "${required_files[@]}"; do
        if [[ ! -f "$browser_dir/$file" ]]; then
            missing_files+=("$file")
        fi
    done

    if [[ ${#missing_files[@]} -gt 0 ]]; then
        eval "$details_ref='Missing files: ${missing_files[*]}'"
        return 1
    fi

    # Test if JavaScript is syntactically valid
    local js_file="$browser_dir/tkr-logging-client.js"
    if command -v node >/dev/null 2>&1; then
        if ! node -c "$js_file" 2>/dev/null; then
            eval "$details_ref='JavaScript syntax errors'"
            return 1
        fi
    fi

    eval "$details_ref='Browser client files present and valid'"
    return 0
}

test_vite_plugin() {
    local details_ref="$1"
    local plugin_dir="$PROJECT_ROOT/.context-kit/plugins/vite"

    if [[ ! -d "$plugin_dir" ]]; then
        eval "$details_ref='Vite plugin directory not found'"
        return 1
    fi

    # Check for plugin files
    local required_files=("index.js" "package.json")
    local missing_files=()

    for file in "${required_files[@]}"; do
        if [[ ! -f "$plugin_dir/$file" ]]; then
            missing_files+=("$file")
        fi
    done

    if [[ ${#missing_files[@]} -gt 0 ]]; then
        eval "$details_ref='Missing files: ${missing_files[*]}'"
        return 1
    fi

    # Test JavaScript syntax if Node.js available
    if command -v node >/dev/null 2>&1; then
        if ! node -c "$plugin_dir/index.js" 2>/dev/null; then
            eval "$details_ref='Plugin JavaScript syntax errors'"
            return 1
        fi
    fi

    eval "$details_ref='Vite plugin files present and valid'"
    return 0
}

test_webpack_plugin() {
    local details_ref="$1"
    local plugin_dir="$PROJECT_ROOT/.context-kit/plugins/webpack"

    if [[ ! -d "$plugin_dir" ]]; then
        eval "$details_ref='Webpack plugin directory not found'"
        return 1
    fi

    # Check for plugin files
    local required_files=("index.js" "package.json")
    local missing_files=()

    for file in "${required_files[@]}"; do
        if [[ ! -f "$plugin_dir/$file" ]]; then
            missing_files+=("$file")
        fi
    done

    if [[ ${#missing_files[@]} -gt 0 ]]; then
        eval "$details_ref='Missing files: ${missing_files[*]}'"
        return 1
    fi

    # Test JavaScript syntax if Node.js available
    if command -v node >/dev/null 2>&1; then
        if ! node -c "$plugin_dir/index.js" 2>/dev/null; then
            eval "$details_ref='Plugin JavaScript syntax errors'"
            return 1
        fi
    fi

    eval "$details_ref='Webpack plugin files present and valid'"
    return 0
}

test_logging_client() {
    local details_ref="$1"
    local client_dir="$PROJECT_ROOT/.context-kit/logging-client/src"

    if [[ ! -d "$client_dir" ]]; then
        eval "$details_ref='Logging client directory not found'"
        return 1
    fi

    # Check for key client files
    local required_files=("auto-init-enhanced.js" "batch-manager.js" "process-detector.js")
    local missing_files=()

    for file in "${required_files[@]}"; do
        if [[ ! -f "$client_dir/$file" ]]; then
            missing_files+=("$file")
        fi
    done

    if [[ ${#missing_files[@]} -gt 0 ]]; then
        eval "$details_ref='Missing files: ${missing_files[*]}'"
        return 1
    fi

    # Test auto-init syntax if Node.js available
    if command -v node >/dev/null 2>&1; then
        local auto_init="$client_dir/auto-init-enhanced.js"
        if ! node -c "$auto_init" 2>/dev/null; then
            eval "$details_ref='Auto-init JavaScript syntax errors'"
            return 1
        fi
    fi

    eval "$details_ref='Logging client files present and valid'"
    return 0
}

test_backend_api() {
    local details_ref="$1"
    local kg_dir="$PROJECT_ROOT/.context-kit/knowledge-graph"

    if [[ ! -d "$kg_dir" ]]; then
        eval "$details_ref='Knowledge graph directory not found'"
        return 1
    fi

    # Check for API source files
    if [[ ! -d "$kg_dir/src/api" ]]; then
        eval "$details_ref='API source directory not found'"
        return 1
    fi

    # In quick mode, just check file existence
    if [[ "$QUICK_MODE" == "true" ]]; then
        eval "$details_ref='Backend API directory structure present'"
        return 0
    fi

    # Check if TypeScript compiles (if available)
    if command -v npx >/dev/null 2>&1 && [[ -f "$kg_dir/package.json" ]]; then
        cd "$kg_dir"
        if npx tsc --noEmit 2>/dev/null; then
            eval "$details_ref='TypeScript compilation successful'"
            return 0
        else
            eval "$details_ref='TypeScript compilation errors'"
            return 1
        fi
    fi

    eval "$details_ref='Backend API structure present (no TypeScript check)'"
    return 0
}

# ==============================================================================
# WAVE 2 INTEGRATION TESTS
# ==============================================================================

test_terminal_integration() {
    local details_ref="$1"

    # Check if shell RC files have TKR markers
    local tkr_marker="# >>> TKR Context Kit Logging Initialize >>>"
    local found_integration=false
    local integration_files=()

    # Common shell RC files
    local rc_files=(
        "$HOME/.bashrc"
        "$HOME/.zshrc"
        "$HOME/.config/fish/config.fish"
        "$HOME/.profile"
        "$HOME/.bash_profile"
    )

    for rc_file in "${rc_files[@]}"; do
        if [[ -f "$rc_file" ]] && grep -q "$tkr_marker" "$rc_file" 2>/dev/null; then
            found_integration=true
            integration_files+=("$(basename "$rc_file")")
        fi
    done

    if [[ "$found_integration" == true ]]; then
        eval "$details_ref='Terminal integration found in: ${integration_files[*]}'"
        return 0
    else
        eval "$details_ref='No terminal integration found in shell RC files'"
        return 1
    fi
}

test_node_options_config() {
    local details_ref="$1"

    # Check if NODE_OPTIONS contains TKR logging
    if [[ -n "${NODE_OPTIONS:-}" ]] && echo "$NODE_OPTIONS" | grep -q "auto-init-enhanced.js"; then
        eval "$details_ref='NODE_OPTIONS configured in current environment'"
        return 0
    fi

    # Check if shell RC files have NODE_OPTIONS configuration
    local node_marker="# >>> TKR Context Kit NODE_OPTIONS >>>"
    local found_config=false
    local config_files=()

    local rc_files=(
        "$HOME/.bashrc"
        "$HOME/.zshrc"
        "$HOME/.config/fish/config.fish"
        "$HOME/.profile"
    )

    for rc_file in "${rc_files[@]}"; do
        if [[ -f "$rc_file" ]] && grep -q "$node_marker" "$rc_file" 2>/dev/null; then
            found_config=true
            config_files+=("$(basename "$rc_file")")
        fi
    done

    if [[ "$found_config" == true ]]; then
        eval "$details_ref='NODE_OPTIONS configuration found in: ${config_files[*]}'"
        return 0
    else
        eval "$details_ref='No NODE_OPTIONS configuration found'"
        return 1
    fi
}

test_build_tool_detection() {
    local details_ref="$1"
    local detect_script="$SCRIPT_DIR/detect-build-tool.sh"

    if [[ ! -f "$detect_script" ]]; then
        eval "$details_ref='Build tool detection script not found'"
        return 1
    fi

    if [[ ! -x "$detect_script" ]]; then
        eval "$details_ref='Build tool detection script not executable'"
        return 1
    fi

    # Test script execution (dry run)
    if TKR_DETECT_DRY_RUN=true "$detect_script" "$PROJECT_ROOT" >/dev/null 2>&1; then
        eval "$details_ref='Build tool detection script executes successfully'"
        return 0
    else
        eval "$details_ref='Build tool detection script execution failed'"
        return 1
    fi
}

# ==============================================================================
# SYSTEM SERVICE TESTS
# ==============================================================================

test_knowledge_graph_api() {
    local details_ref="$1"

    if [[ "$QUICK_MODE" == "true" ]]; then
        skip_test "knowledge-graph-api" "Quick mode enabled"
        return 0
    fi

    # Test if service is running
    local api_url="http://localhost:42003/health"

    if command -v curl >/dev/null 2>&1; then
        if curl -s --connect-timeout 3 "$api_url" >/dev/null 2>&1; then
            eval "$details_ref='Knowledge Graph API responding on port 42003'"
            return 0
        else
            eval "$details_ref='Knowledge Graph API not responding on port 42003'"
            return 1
        fi
    else
        eval "$details_ref='Cannot test API (curl not available)'"
        return 1
    fi
}

test_dashboard_service() {
    local details_ref="$1"

    if [[ "$QUICK_MODE" == "true" ]]; then
        skip_test "dashboard-service" "Quick mode enabled"
        return 0
    fi

    # Test if dashboard is accessible
    local dashboard_url="http://localhost:42001"

    if command -v curl >/dev/null 2>&1; then
        if curl -s --connect-timeout 3 "$dashboard_url" >/dev/null 2>&1; then
            eval "$details_ref='Dashboard service responding on port 42001'"
            return 0
        else
            eval "$details_ref='Dashboard service not responding on port 42001'"
            return 1
        fi
    else
        eval "$details_ref='Cannot test dashboard (curl not available)'"
        return 1
    fi
}

test_logging_endpoints() {
    local details_ref="$1"

    if [[ "$QUICK_MODE" == "true" ]]; then
        skip_test "logging-endpoints" "Quick mode enabled"
        return 0
    fi

    # Test logging API endpoints
    local log_endpoint="http://localhost:42003/api/logs"

    if command -v curl >/dev/null 2>&1; then
        # Test with a simple GET request (should return logs or empty array)
        local response="$(curl -s --connect-timeout 3 "$log_endpoint" 2>/dev/null || echo "")"

        if [[ -n "$response" ]]; then
            eval "$details_ref='Logging API endpoint responding'"
            return 0
        else
            eval "$details_ref='Logging API endpoint not responding'"
            return 1
        fi
    else
        eval "$details_ref='Cannot test logging endpoints (curl not available)'"
        return 1
    fi
}

# ==============================================================================
# TEST ORCHESTRATION
# ==============================================================================

run_wave1_tests() {
    log INFO "Running Wave 1 component tests..."

    run_test "Shell Script" test_shell_script "wave1"
    run_test "Browser Client" test_browser_client "wave1"
    run_test "Vite Plugin" test_vite_plugin "wave1"
    run_test "Webpack Plugin" test_webpack_plugin "wave1"
    run_test "Logging Client" test_logging_client "wave1"
    run_test "Backend API" test_backend_api "wave1"
}

run_wave2_tests() {
    log INFO "Running Wave 2 integration tests..."

    run_test "Terminal Integration" test_terminal_integration "wave2"
    run_test "NODE_OPTIONS Config" test_node_options_config "wave2"
    run_test "Build Tool Detection" test_build_tool_detection "wave2"
}

run_system_tests() {
    log INFO "Running system service tests..."

    run_test "Knowledge Graph API" test_knowledge_graph_api "system"
    run_test "Dashboard Service" test_dashboard_service "system"
    run_test "Logging Endpoints" test_logging_endpoints "system"
}

# ==============================================================================
# REPORTING
# ==============================================================================

generate_summary_report() {
    echo
    echo "═══════════════════════════════════════════════════════════════════"
    echo "🔍 TKR LOGGING INSTALLATION VERIFICATION REPORT"
    echo "═══════════════════════════════════════════════════════════════════"
    echo "Generated: $(date)"
    echo "Project: $PROJECT_ROOT"
    echo "Script: $SCRIPT_NAME v$SCRIPT_VERSION"
    echo

    # Overall status
    local overall_status="✅ HEALTHY"
    if [[ $FAILED_TESTS -gt 0 ]]; then
        overall_status="❌ ISSUES FOUND"
    elif [[ $SKIPPED_TESTS -gt 0 ]] && [[ $PASSED_TESTS -eq 0 ]]; then
        overall_status="⚠️  INCOMPLETE"
    fi

    echo "📊 OVERALL STATUS: $overall_status"
    echo
    echo "📈 TEST SUMMARY:"
    echo "   Total Tests:  $TOTAL_TESTS"
    echo "   Passed:       $PASSED_TESTS"
    echo "   Failed:       $FAILED_TESTS"
    echo "   Skipped:      $SKIPPED_TESTS"
    echo

    # Detailed results by category
    echo "🔬 DETAILED RESULTS:"
    echo

    echo "Wave 1 Components:"
    for component in "${WAVE1_COMPONENTS[@]}"; do
        local test_name=""
        case "$component" in
            "shell-script") test_name="Shell Script" ;;
            "browser-client") test_name="Browser Client" ;;
            "vite-plugin") test_name="Vite Plugin" ;;
            "webpack-plugin") test_name="Webpack Plugin" ;;
            "logging-client") test_name="Logging Client" ;;
            "backend-api") test_name="Backend API" ;;
        esac

        if [[ -n "${TEST_RESULTS[$test_name]:-}" ]]; then
            local result="${TEST_RESULTS[$test_name]}"
            local icon="❓"
            case "$result" in
                "PASS") icon="✅" ;;
                "FAIL") icon="❌" ;;
                "SKIP") icon="⏭️" ;;
            esac
            echo "   $icon $test_name: $result"
            [[ "$DETAILED" == "true" ]] && echo "      ${TEST_DETAILS[$test_name]}"
        fi
    done

    echo
    echo "Wave 2 Integrations:"
    for integration in "${WAVE2_INTEGRATIONS[@]}"; do
        local test_name=""
        case "$integration" in
            "terminal-integration") test_name="Terminal Integration" ;;
            "node-options-config") test_name="NODE_OPTIONS Config" ;;
            "build-tool-detection") test_name="Build Tool Detection" ;;
        esac

        if [[ -n "${TEST_RESULTS[$test_name]:-}" ]]; then
            local result="${TEST_RESULTS[$test_name]}"
            local icon="❓"
            case "$result" in
                "PASS") icon="✅" ;;
                "FAIL") icon="❌" ;;
                "SKIP") icon="⏭️" ;;
            esac
            echo "   $icon $test_name: $result"
            [[ "$DETAILED" == "true" ]] && echo "      ${TEST_DETAILS[$test_name]}"
        fi
    done

    echo
    echo "System Services:"
    for service in "${SYSTEM_SERVICES[@]}"; do
        local test_name=""
        case "$service" in
            "knowledge-graph-api") test_name="Knowledge Graph API" ;;
            "dashboard-service") test_name="Dashboard Service" ;;
            "logging-endpoints") test_name="Logging Endpoints" ;;
        esac

        if [[ -n "${TEST_RESULTS[$test_name]:-}" ]]; then
            local result="${TEST_RESULTS[$test_name]}"
            local icon="❓"
            case "$result" in
                "PASS") icon="✅" ;;
                "FAIL") icon="❌" ;;
                "SKIP") icon="⏭️" ;;
            esac
            echo "   $icon $test_name: $result"
            [[ "$DETAILED" == "true" ]] && echo "      ${TEST_DETAILS[$test_name]}"
        fi
    done

    # Recommendations
    echo
    echo "💡 RECOMMENDATIONS:"

    if [[ $FAILED_TESTS -gt 0 ]]; then
        echo "   🔧 Address failed tests before using the logging system"
        echo "   📋 Check individual test details above for specific issues"
    fi

    if [[ "${TEST_RESULTS["Terminal Integration"]:-}" == "FAIL" ]]; then
        echo "   🖥️  Run: .context-kit/scripts/logging/enable-terminal.sh"
    fi

    if [[ "${TEST_RESULTS["NODE_OPTIONS Config"]:-}" == "FAIL" ]]; then
        echo "   ⚙️  Run: .context-kit/scripts/logging/enable-node-options.sh"
    fi

    if [[ "${TEST_RESULTS["Knowledge Graph API"]:-}" == "FAIL" ]]; then
        echo "   🗄️  Start knowledge graph service: cd .context-kit/knowledge-graph && npm run dev:api"
    fi

    if [[ "${TEST_RESULTS["Dashboard Service"]:-}" == "FAIL" ]]; then
        echo "   📊 Start dashboard service: cd .context-kit/dashboard && npm run dev"
    fi

    if [[ $PASSED_TESTS -gt 0 ]] && [[ $FAILED_TESTS -eq 0 ]]; then
        echo "   🎉 All tests passed! Your TKR logging system is ready to use"
        echo "   🌐 Access dashboard at: http://localhost:42001"
        echo "   📝 Test logging by running commands in your terminal"
    fi

    echo
    echo "═══════════════════════════════════════════════════════════════════"
}

save_report() {
    if [[ -n "$REPORT_FILE" ]]; then
        log INFO "Saving report to: $REPORT_FILE"
        generate_summary_report > "$REPORT_FILE"
        log SUCCESS "Report saved"
    fi
}

# ==============================================================================
# COMMAND LINE PARSING
# ==============================================================================

show_help() {
    cat << EOF
TKR Installation Verification Script

USAGE:
    $0 [options]

OPTIONS:
    -h, --help          Show this help message
    -v, --verbose       Enable verbose logging
    -d, --detailed      Show detailed test results and timings
    -q, --quick         Skip network tests (faster execution)
    -r, --report FILE   Save detailed report to file

ENVIRONMENT VARIABLES:
    TKR_VERIFY_VERBOSE    Enable verbose logging (true/false, default: false)
    TKR_VERIFY_DETAILED   Show detailed results (true/false, default: false)
    TKR_VERIFY_QUICK      Skip network tests (true/false, default: false)
    TKR_VERIFY_REPORT     Report file path

TEST CATEGORIES:
    Wave 1 Components     - Core logging system files and plugins
    Wave 2 Integrations   - Shell and Node.js integrations
    System Services       - Running services and API endpoints

EXAMPLES:
    $0                    # Run all tests with standard output
    $0 --quick            # Skip service connectivity tests
    $0 --detailed         # Show comprehensive test details
    $0 --report report.txt # Save detailed report to file

EXIT CODES:
    0 - All tests passed
    1 - One or more tests failed
    2 - Critical system error

The verification script checks:
✅ Wave 1 component files and syntax
✅ Wave 2 integration configurations
✅ System service availability
✅ API endpoint connectivity
✅ Shell integration status

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -d|--detailed)
            DETAILED=true
            shift
            ;;
        -q|--quick)
            QUICK_MODE=true
            shift
            ;;
        -r|--report)
            REPORT_FILE="$2"
            shift 2
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
    log INFO "TKR Installation Verification v$SCRIPT_VERSION"
    log INFO "Project root: $PROJECT_ROOT"

    if [[ "$QUICK_MODE" == "true" ]]; then
        log INFO "Quick mode enabled - skipping network tests"
    fi

    # Run test suites
    run_wave1_tests
    run_wave2_tests

    if [[ "$QUICK_MODE" != "true" ]]; then
        run_system_tests
    fi

    # Generate and display report
    generate_summary_report

    # Save report if requested
    save_report

    # Exit with appropriate code
    if [[ $FAILED_TESTS -gt 0 ]]; then
        log ERROR "Verification completed with failures"
        exit 1
    elif [[ $PASSED_TESTS -eq 0 ]]; then
        log WARN "No tests passed - check your installation"
        exit 2
    else
        log SUCCESS "Verification completed successfully"
        exit 0
    fi
}

# Run main function
main "$@"