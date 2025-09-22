#!/bin/bash
# TKR Logging Terminal Integration Tests
# Comprehensive testing of shell logging functionality
#
# Tests:
# - Project detection (.context-kit awareness)
# - Configuration loading and validation
# - Log level filtering
# - Batch system functionality
# - Command wrapping and monitoring
# - Performance overhead validation
# - Environment variable handling
# - Shell integration functions

set -euo pipefail

# Colors for test output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$TEST_DIR/../../.." && pwd)"
SHELL_DIR="$PROJECT_ROOT/.context-kit/shell"
TEST_OUTPUT_DIR="$TEST_DIR/output"
TEST_TEMP_DIR="$TEST_DIR/temp"

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0
PERFORMANCE_TESTS_RUN=0

# Setup test environment
setup_test_env() {
    echo -e "${BLUE}Setting up test environment...${NC}"

    # Create output directories
    mkdir -p "$TEST_OUTPUT_DIR" "$TEST_TEMP_DIR"

    # Check if shell components exist
    if [[ ! -f "$SHELL_DIR/tkr-logging.sh" ]]; then
        echo -e "${RED}ERROR: Shell logging script not found at $SHELL_DIR/tkr-logging.sh${NC}"
        exit 1
    fi

    if [[ ! -f "$SHELL_DIR/config.sh" ]]; then
        echo -e "${RED}ERROR: Shell config not found at $SHELL_DIR/config.sh${NC}"
        exit 1
    fi

    # Start mock server for testing (simple Python HTTP server)
    start_mock_server

    echo -e "${GREEN}Test environment ready${NC}"
}

# Start a mock logging server for testing
start_mock_server() {
    local port=42999
    local server_log="$TEST_OUTPUT_DIR/mock-server.log"

    # Kill any existing mock server
    pkill -f "python.*$port" 2>/dev/null || true

    # Start simple HTTP server to capture log submissions
    cat > "$TEST_TEMP_DIR/mock_server.py" << 'EOF'
import json
import http.server
import socketserver
import threading
import sys
from urllib.parse import urlparse, parse_qs

class LoggingHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/logs/batch':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)

            try:
                data = json.loads(post_data.decode('utf-8'))
                # Log received data for test verification
                with open('/tmp/test-logs-received.json', 'a') as f:
                    json.dump(data, f)
                    f.write('\n')

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"status": "success"}')
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(f'{{"error": "{str(e)}"}}'.encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "ok"}')
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass  # Suppress default logging

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 42999
    with socketserver.TCPServer(("", port), LoggingHandler) as httpd:
        httpd.serve_forever()
EOF

    python3 "$TEST_TEMP_DIR/mock_server.py" $port > "$server_log" 2>&1 &
    local server_pid=$!
    echo $server_pid > "$TEST_TEMP_DIR/mock-server.pid"

    # Wait for server to start
    sleep 2

    # Test server is running
    if curl -s "http://localhost:$port/health" > /dev/null; then
        echo "Mock server started on port $port (PID: $server_pid)"
    else
        echo -e "${RED}Failed to start mock server${NC}"
        exit 1
    fi
}

# Stop mock server
stop_mock_server() {
    if [[ -f "$TEST_TEMP_DIR/mock-server.pid" ]]; then
        local pid=$(cat "$TEST_TEMP_DIR/mock-server.pid")
        kill $pid 2>/dev/null || true
        rm -f "$TEST_TEMP_DIR/mock-server.pid"
    fi
    rm -f /tmp/test-logs-received.json
}

# Test helper functions
assert_equals() {
    local expected="$1"
    local actual="$2"
    local test_name="$3"

    TESTS_RUN=$((TESTS_RUN + 1))

    if [[ "$expected" == "$actual" ]]; then
        echo -e "${GREEN}✓ $test_name${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ $test_name${NC}"
        echo -e "  Expected: $expected"
        echo -e "  Actual:   $actual"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

assert_contains() {
    local expected="$1"
    local actual="$2"
    local test_name="$3"

    TESTS_RUN=$((TESTS_RUN + 1))

    if [[ "$actual" == *"$expected"* ]]; then
        echo -e "${GREEN}✓ $test_name${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ $test_name${NC}"
        echo -e "  Expected to contain: $expected"
        echo -e "  Actual:              $actual"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

assert_success() {
    local command="$1"
    local test_name="$2"

    TESTS_RUN=$((TESTS_RUN + 1))

    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ $test_name${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ $test_name${NC}"
        echo -e "  Command failed: $command"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Performance testing helper
measure_performance() {
    local command="$1"
    local test_name="$2"
    local max_time_ms="$3"

    TESTS_RUN=$((TESTS_RUN + 1))
    PERFORMANCE_TESTS_RUN=$((PERFORMANCE_TESTS_RUN + 1))

    local start_time=$(date +%s%N)
    eval "$command"
    local end_time=$(date +%s%N)

    local duration_ns=$((end_time - start_time))
    local duration_ms=$((duration_ns / 1000000))

    if [[ $duration_ms -le $max_time_ms ]]; then
        echo -e "${GREEN}✓ $test_name (${duration_ms}ms)${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ $test_name (${duration_ms}ms > ${max_time_ms}ms)${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Test project detection functionality
test_project_detection() {
    echo -e "\n${BLUE}Testing project detection...${NC}"

    # Create test environment with config
    local test_env="$TEST_TEMP_DIR/test-env"
    mkdir -p "$test_env"

    # Set up test configuration
    export TKR_LOG_ENABLED="true"
    export TKR_LOG_PROJECT_ONLY="true"
    export TKR_LOG_ENDPOINT="http://localhost:42999/api/logs/batch"
    export TKR_LOG_DEBUG="false"

    # Source the shell script in a subshell to test functions
    (
        cd "$test_env"
        source "$SHELL_DIR/config.sh"
        source "$SHELL_DIR/tkr-logging.sh"

        # Test: Should NOT log outside project (no .context-kit)
        result=$(tkr_should_log && echo "true" || echo "false")
        assert_equals "false" "$result" "Should not log outside project directory"

        # Create .context-kit directory
        mkdir -p .context-kit

        # Test: Should log inside project
        result=$(tkr_should_log && echo "true" || echo "false")
        assert_equals "true" "$result" "Should log inside project directory"

        # Test nested directory
        mkdir -p subdir/nested
        cd subdir/nested
        result=$(tkr_should_log && echo "true" || echo "false")
        assert_equals "true" "$result" "Should log in nested project directory"
    )

    # Test with project-only disabled
    export TKR_LOG_PROJECT_ONLY="false"
    (
        cd /tmp
        source "$SHELL_DIR/config.sh"
        source "$SHELL_DIR/tkr-logging.sh"

        result=$(tkr_should_log && echo "true" || echo "false")
        assert_equals "true" "$result" "Should log everywhere when project-only disabled"
    )

    # Test with logging disabled
    export TKR_LOG_ENABLED="false"
    (
        cd "$test_env"
        source "$SHELL_DIR/config.sh"
        source "$SHELL_DIR/tkr-logging.sh"

        result=$(tkr_should_log && echo "true" || echo "false")
        assert_equals "false" "$result" "Should not log when globally disabled"
    )

    # Reset for other tests
    export TKR_LOG_ENABLED="true"
    export TKR_LOG_PROJECT_ONLY="true"
}

# Test log level filtering
test_log_level_filtering() {
    echo -e "\n${BLUE}Testing log level filtering...${NC}"

    # Test different log levels
    local test_env="$TEST_TEMP_DIR/level-test"
    mkdir -p "$test_env/.context-kit"

    (
        cd "$test_env"
        source "$SHELL_DIR/config.sh"
        source "$SHELL_DIR/tkr-logging.sh"

        # Test with INFO level
        export TKR_LOG_LEVEL="INFO"

        # These should be captured
        result=$(tkr_should_capture_level "INFO" && echo "true" || echo "false")
        assert_equals "true" "$result" "Should capture INFO at INFO level"

        result=$(tkr_should_capture_level "WARN" && echo "true" || echo "false")
        assert_equals "true" "$result" "Should capture WARN at INFO level"

        result=$(tkr_should_capture_level "ERROR" && echo "true" || echo "false")
        assert_equals "true" "$result" "Should capture ERROR at INFO level"

        result=$(tkr_should_capture_level "FATAL" && echo "true" || echo "false")
        assert_equals "true" "$result" "Should capture FATAL at INFO level"

        # This should NOT be captured
        result=$(tkr_should_capture_level "DEBUG" && echo "true" || echo "false")
        assert_equals "false" "$result" "Should not capture DEBUG at INFO level"

        # Test with ERROR level
        export TKR_LOG_LEVEL="ERROR"

        result=$(tkr_should_capture_level "INFO" && echo "true" || echo "false")
        assert_equals "false" "$result" "Should not capture INFO at ERROR level"

        result=$(tkr_should_capture_level "ERROR" && echo "true" || echo "false")
        assert_equals "true" "$result" "Should capture ERROR at ERROR level"

        result=$(tkr_should_capture_level "FATAL" && echo "true" || echo "false")
        assert_equals "true" "$result" "Should capture FATAL at ERROR level"
    )
}

# Test batch system functionality
test_batch_system() {
    echo -e "\n${BLUE}Testing batch system...${NC}"

    local test_env="$TEST_TEMP_DIR/batch-test"
    mkdir -p "$test_env/.context-kit"

    # Clear any previous log captures
    rm -f /tmp/test-logs-received.json

    (
        cd "$test_env"
        source "$SHELL_DIR/config.sh"
        source "$SHELL_DIR/tkr-logging.sh"

        # Set small batch size for testing
        export TKR_LOG_BATCH_SIZE="3"
        export TKR_LOG_FLUSH_INTERVAL="1000"

        # Initialize logging system
        tkr_init_logging

        # Add logs to batch (should not flush yet)
        tkr_send_log "INFO" "Test message 1" "test-service"
        tkr_send_log "INFO" "Test message 2" "test-service"

        # Verify batch has entries but hasn't flushed
        assert_equals "2" "$TKR_LOG_BATCH_COUNT" "Batch should have 2 entries"

        # Add third log - should trigger flush
        tkr_send_log "INFO" "Test message 3" "test-service"

        # Give time for background flush
        sleep 1

        # Verify batch was flushed
        assert_equals "0" "$TKR_LOG_BATCH_COUNT" "Batch should be empty after flush"

        # Verify logs were sent to server
        if [[ -f /tmp/test-logs-received.json ]]; then
            local received_count=$(wc -l < /tmp/test-logs-received.json)
            assert_equals "1" "$received_count" "Should have received one batch"
        else
            echo -e "${RED}✗ No logs received by mock server${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    )
}

# Test command wrapping and monitoring
test_command_monitoring() {
    echo -e "\n${BLUE}Testing command monitoring...${NC}"

    local test_env="$TEST_TEMP_DIR/command-test"
    mkdir -p "$test_env/.context-kit"

    # Clear previous logs
    rm -f /tmp/test-logs-received.json

    (
        cd "$test_env"
        source "$SHELL_DIR/config.sh"
        source "$SHELL_DIR/tkr-logging.sh"

        # Set monitored commands
        export TKR_LOG_MONITORED_COMMANDS="echo ls pwd"
        export TKR_LOG_BATCH_SIZE="1"  # Force immediate flush

        # Initialize logging
        tkr_init_logging

        # Test successful command
        echo "test output" > /dev/null

        # Test command with error
        ls /nonexistent-directory >/dev/null 2>&1 || true

        # Give time for logs to be sent
        sleep 2

        # Check that logs were captured
        if [[ -f /tmp/test-logs-received.json ]]; then
            echo -e "${GREEN}✓ Command monitoring captured logs${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${RED}✗ Command monitoring did not capture logs${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi

        TESTS_RUN=$((TESTS_RUN + 1))
    )
}

# Test environment variable handling
test_environment_variables() {
    echo -e "\n${BLUE}Testing environment variable handling...${NC}"

    # Test default values are loaded
    unset TKR_LOG_ENABLED TKR_LOG_LEVEL TKR_LOG_BATCH_SIZE

    (
        source "$SHELL_DIR/config.sh"

        # Check defaults
        assert_equals "true" "$TKR_LOG_ENABLED" "Default TKR_LOG_ENABLED should be true"
        assert_equals "INFO" "$TKR_LOG_LEVEL" "Default TKR_LOG_LEVEL should be INFO"
        assert_equals "10" "$TKR_LOG_BATCH_SIZE" "Default TKR_LOG_BATCH_SIZE should be 10"
    )

    # Test custom values are respected
    export TKR_LOG_ENABLED="false"
    export TKR_LOG_LEVEL="ERROR"
    export TKR_LOG_BATCH_SIZE="20"

    (
        source "$SHELL_DIR/config.sh"

        assert_equals "false" "$TKR_LOG_ENABLED" "Custom TKR_LOG_ENABLED should be respected"
        assert_equals "ERROR" "$TKR_LOG_LEVEL" "Custom TKR_LOG_LEVEL should be respected"
        assert_equals "20" "$TKR_LOG_BATCH_SIZE" "Custom TKR_LOG_BATCH_SIZE should be respected"
    )
}

# Test shell integration functions
test_shell_integration() {
    echo -e "\n${BLUE}Testing shell integration functions...${NC}"

    local test_env="$TEST_TEMP_DIR/integration-test"
    mkdir -p "$test_env/.context-kit"

    (
        cd "$test_env"
        source "$SHELL_DIR/config.sh"
        source "$SHELL_DIR/tkr-logging.sh"

        # Test prompt indicator
        export TKR_LOG_SHOW_INDICATOR="true"
        export TKR_LOG_INDICATOR="🔍"

        result=$(tkr_prompt_indicator)
        assert_equals "🔍" "$result" "Prompt indicator should return configured indicator"

        # Test with indicator disabled
        export TKR_LOG_SHOW_INDICATOR="false"
        result=$(tkr_prompt_indicator)
        assert_equals "" "$result" "Prompt indicator should be empty when disabled"

        # Test log pipe function
        echo "test pipe data" | tkr_log_pipe "test-service" "pipe-component" > /dev/null

        echo -e "${GREEN}✓ Shell integration functions work${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        TESTS_RUN=$((TESTS_RUN + 1))
    )
}

# Test performance requirements
test_performance() {
    echo -e "\n${BLUE}Testing performance requirements...${NC}"

    local test_env="$TEST_TEMP_DIR/perf-test"
    mkdir -p "$test_env/.context-kit"

    (
        cd "$test_env"
        source "$SHELL_DIR/config.sh"
        source "$SHELL_DIR/tkr-logging.sh"

        # Test single log call overhead (< 1ms)
        measure_performance "tkr_send_log 'INFO' 'Performance test' 'perf-service'" \
                          "Single log call performance" 1

        # Test project detection performance (< 1ms)
        measure_performance "tkr_should_log" \
                          "Project detection performance" 1

        # Test log level filtering performance (< 1ms)
        measure_performance "tkr_should_capture_level 'INFO'" \
                          "Log level filtering performance" 1

        # Test batch operations (< 5ms for 10 entries)
        local batch_test="for i in {1..10}; do tkr_send_log 'INFO' 'Batch test $i' 'batch-service'; done"
        measure_performance "$batch_test" \
                          "Batch processing performance" 5
    )
}

# Test configuration validation
test_configuration_validation() {
    echo -e "\n${BLUE}Testing configuration validation...${NC}"

    # Test invalid log level
    export TKR_LOG_LEVEL="INVALID"
    (
        source "$SHELL_DIR/config.sh"
        # Should fallback to INFO
        assert_equals "INFO" "$TKR_LOG_LEVEL" "Invalid log level should fallback to INFO"
    )

    # Test invalid batch size
    export TKR_LOG_BATCH_SIZE="abc"
    (
        source "$SHELL_DIR/config.sh"
        # Should fallback to default
        assert_equals "10" "$TKR_LOG_BATCH_SIZE" "Invalid batch size should fallback to default"
    )

    # Test invalid boolean values
    export TKR_LOG_ENABLED="maybe"
    (
        source "$SHELL_DIR/config.sh"
        # Should be normalized to false for non-true values
        assert_equals "false" "$TKR_LOG_ENABLED" "Invalid boolean should be false"
    )
}

# Test error handling and resilience
test_error_handling() {
    echo -e "\n${BLUE}Testing error handling...${NC}"

    local test_env="$TEST_TEMP_DIR/error-test"
    mkdir -p "$test_env/.context-kit"

    (
        cd "$test_env"

        # Test with unreachable endpoint
        export TKR_LOG_ENDPOINT="http://localhost:99999/api/logs/batch"
        export TKR_LOG_HTTP_TIMEOUT="1"
        export TKR_LOG_MAX_RETRIES="1"

        source "$SHELL_DIR/config.sh"
        source "$SHELL_DIR/tkr-logging.sh"

        # Should not crash when endpoint is unreachable
        tkr_send_log "INFO" "Error test message" "error-service"
        tkr_flush_batch

        echo -e "${GREEN}✓ Error handling - unreachable endpoint${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        TESTS_RUN=$((TESTS_RUN + 1))

        # Test with malformed JSON (should be handled gracefully)
        # This is tested at the HTTP level by the integration tests
    )
}

# Cleanup function
cleanup_tests() {
    echo -e "\n${BLUE}Cleaning up test environment...${NC}"

    # Stop mock server
    stop_mock_server

    # Clean up temp files
    rm -rf "$TEST_TEMP_DIR"
    rm -f /tmp/test-logs-received.json

    # Reset environment variables
    unset TKR_LOG_ENABLED TKR_LOG_LEVEL TKR_LOG_BATCH_SIZE TKR_LOG_PROJECT_ONLY
    unset TKR_LOG_ENDPOINT TKR_LOG_DEBUG TKR_LOG_SHOW_INDICATOR TKR_LOG_INDICATOR
    unset TKR_LOG_MONITORED_COMMANDS TKR_LOG_HTTP_TIMEOUT TKR_LOG_MAX_RETRIES

    echo -e "${GREEN}Cleanup completed${NC}"
}

# Print test results
print_results() {
    echo -e "\n${BLUE}===========================================${NC}"
    echo -e "${BLUE}Terminal Logging Test Results${NC}"
    echo -e "${BLUE}===========================================${NC}"
    echo -e "Total tests run: $TESTS_RUN"
    echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
    echo -e "${RED}Failed: $TESTS_FAILED${NC}"
    echo -e "Performance tests: $PERFORMANCE_TESTS_RUN"

    local success_rate=0
    if [[ $TESTS_RUN -gt 0 ]]; then
        success_rate=$((TESTS_PASSED * 100 / TESTS_RUN))
    fi

    echo -e "Success rate: ${success_rate}%"

    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo -e "\n${GREEN}🎉 All tests passed!${NC}"
        return 0
    else
        echo -e "\n${RED}❌ Some tests failed${NC}"
        return 1
    fi
}

# Main test execution
main() {
    echo -e "${BLUE}TKR Logging Terminal Integration Tests${NC}"
    echo -e "${BLUE}=====================================${NC}"

    # Trap to ensure cleanup on exit
    trap cleanup_tests EXIT

    # Setup
    setup_test_env

    # Run test suites
    test_project_detection
    test_log_level_filtering
    test_batch_system
    test_command_monitoring
    test_environment_variables
    test_shell_integration
    test_configuration_validation
    test_error_handling
    test_performance

    # Print results
    print_results
}

# Run tests if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi