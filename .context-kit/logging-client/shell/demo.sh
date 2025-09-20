#!/bin/bash
# TKR Context Kit - Shell Logging Demo
# Demonstrates key features of the terminal logging system

echo "=== TKR Context Kit Shell Logging Demo ==="
echo

# Source the logging system
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/tkr-logging.sh"

echo "1. Project Detection:"
echo "   Current directory: $PWD"
if tkr_should_log; then
    echo "   ✓ Logging is ACTIVE (found .context-kit)"
else
    echo "   ✗ Logging is DISABLED (no .context-kit found)"
fi
echo

echo "2. Configuration:"
echo "   Endpoint: $TKR_LOG_ENDPOINT"
echo "   Log Level: $TKR_LOG_LEVEL"
echo "   Batch Size: $TKR_LOG_BATCH_SIZE"
echo "   Session ID: $TKR_LOG_SESSION_ID"
echo

echo "3. Prompt Indicator:"
indicator=$(tkr_prompt_indicator)
if [[ -n "$indicator" ]]; then
    echo "   Indicator: $indicator (logging active)"
else
    echo "   Indicator: (none - logging inactive)"
fi
echo

echo "4. Manual Logging:"
echo "   Sending test logs..."
tkr_send_log "INFO" "Demo started" "shell-demo" "test"
tkr_send_log "WARN" "This is a warning message" "shell-demo" "test"
tkr_send_log "ERROR" "This is an error message" "shell-demo" "test"
echo "   ✓ Logs queued for batch submission"
echo

echo "5. Pipe Logging:"
echo "   Testing pipe functionality..."
echo "Hello from pipe demo" | tkr_log_pipe "shell-demo" "pipe-test"
echo "   ✓ Pipe logging completed"
echo

echo "6. Batch Status:"
echo "   Current batch count: $TKR_LOG_BATCH_COUNT logs"
echo "   Batch size limit: $TKR_LOG_BATCH_SIZE logs"
echo

echo "7. Manual Flush:"
echo "   Flushing batch..."
tkr_flush_batch
echo "   ✓ Batch flushed"
echo

echo "=== Demo Complete ==="
echo "The logging system is now active and ready to capture commands."
echo "Try running monitored commands like: npm, yarn, git, node"