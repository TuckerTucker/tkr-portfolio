# TKR Context Kit - Shell Logging System

A complete terminal logging system that captures command output with project-aware activation. This system only activates in directories containing `.context-kit`, ensuring logging is contextual and relevant.

## Features

- **Project-Aware Activation**: Only logs in directories with `.context-kit`
- **Command Output Capture**: Captures stdout/stderr while preserving user experience
- **Batch Processing**: Groups logs to minimize network overhead
- **Exit Code Preservation**: Maintains command success/failure status
- **Shell Agnostic**: Works with bash and zsh
- **Graceful Degradation**: Continues working when logging service is offline
- **Real-time Streaming**: Option to stream logs via WebSocket
- **Zero Configuration**: Works out of the box with sensible defaults

## Quick Start

### 1. Installation

```bash
# Source the logging system in your shell profile
echo 'source ~/.context-kit/shell/tkr-logging.sh' >> ~/.bashrc
# or for zsh
echo 'source ~/.context-kit/shell/tkr-logging.sh' >> ~/.zshrc

# Reload your shell
source ~/.bashrc  # or ~/.zshrc
```

### 2. Basic Usage

```bash
# Navigate to a project with .context-kit
cd your-project-with-context-kit

# Commands are automatically logged
npm install
git status
yarn build

# Manual logging
tkr_send_log "INFO" "Custom log message" "my-service"

# Pipe output through logging
echo "Hello World" | tkr_log_pipe

# Check if logging is active
if tkr_should_log; then
    echo "Logging is active!"
fi

# Show prompt indicator
echo "$(tkr_prompt_indicator) $ "
```

### 3. Configuration

Set environment variables to customize behavior:

```bash
# Logging endpoint
export TKR_LOG_ENDPOINT="http://localhost:42003/api/logs"

# Log level (DEBUG, INFO, WARN, ERROR, FATAL)
export TKR_LOG_LEVEL="INFO"

# Batch size (1-100)
export TKR_LOG_BATCH_SIZE=10

# Commands to monitor
export TKR_LOG_MONITORED_COMMANDS="npm yarn git node tsx"

# Enable debug output
export TKR_LOG_DEBUG=true
```

## Architecture

### Components

1. **`config.sh`** - Configuration management and validation
2. **`tkr-logging.sh`** - Main logging engine with command wrappers
3. **`README.md`** - This documentation

### Data Flow

```
Command Execution → Output Capture → Log Batching → HTTP Submission
       ↓                ↓              ↓             ↓
   User sees        Preserved      Grouped for    Sent to
   normal output    formatting     efficiency     backend
```

### Project Detection

The system looks for `.context-kit` directory in the current path hierarchy:

```
/home/user/projects/my-app/         # ✓ Logging active
├── .context-kit/                   #   Found here
├── src/                            # ✓ Logging active
│   └── components/                 #   Inherited
└── docs/                           # ✓ Logging active
                                    #   Inherited

/home/user/other-project/           # ✗ No logging
├── package.json                    #   No .context-kit
└── src/                            #   found
```

## Configuration Reference

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TKR_LOG_ENABLED` | `true` | Master switch for logging |
| `TKR_LOG_ENDPOINT` | `http://localhost:42003/api/logs` | HTTP endpoint |
| `TKR_LOG_LEVEL` | `INFO` | Minimum log level to capture |
| `TKR_LOG_BATCH_SIZE` | `10` | Logs per batch (1-100) |
| `TKR_LOG_FLUSH_INTERVAL` | `5000` | Batch flush interval (ms) |
| `TKR_LOG_PROJECT_ONLY` | `true` | Only log in .context-kit projects |
| `TKR_LOG_SHOW_INDICATOR` | `true` | Show prompt indicator |
| `TKR_LOG_MONITORED_COMMANDS` | `npm yarn git node tsx ts-node` | Commands to wrap |
| `TKR_LOG_DEBUG` | `false` | Enable debug output |
| `TKR_LOG_HTTP_TIMEOUT` | `5` | HTTP request timeout (seconds) |
| `TKR_LOG_MAX_RETRIES` | `3` | Maximum retry attempts |

### Log Levels

- **DEBUG** - Detailed diagnostic information
- **INFO** - General information about program execution
- **WARN** - Warning messages for potentially harmful situations
- **ERROR** - Error events that allow application to continue
- **FATAL** - Critical errors that may cause termination

### Monitored Commands

By default, these commands are monitored and logged:

- `npm` - Node package manager
- `yarn` - Alternative package manager
- `git` - Version control
- `node` - Node.js runtime
- `tsx` - TypeScript execution
- `ts-node` - TypeScript execution

## API Reference

### Functions

#### `tkr_should_log`

Check if logging should be active in the current directory.

```bash
if tkr_should_log; then
    echo "Logging is active"
fi
```

**Returns**: Exit code 0 if logging should be active, 1 otherwise.

#### `tkr_send_log <level> <message> [service] [component]`

Send a single log entry.

```bash
tkr_send_log "INFO" "Application started" "my-app" "main"
tkr_send_log "ERROR" "Database connection failed"
```

**Parameters**:
- `level` - Log level (DEBUG, INFO, WARN, ERROR, FATAL)
- `message` - Log message (max 10,000 chars)
- `service` - Service name (optional, default: "shell")
- `component` - Component name (optional, default: "")

#### `tkr_log_pipe [service] [component]`

Pipe command output through logging system.

```bash
echo "Processing..." | tkr_log_pipe "my-service"
cat large-file.log | tkr_log_pipe "log-processor" "reader"
```

**Parameters**:
- `service` - Service name (optional, default: "shell")
- `component` - Component name (optional, default: "pipe")

#### `tkr_prompt_indicator`

Return prompt indicator if logging is active.

```bash
# Add to your PS1
PS1="$(tkr_prompt_indicator)\$ "

# Or check explicitly
if [[ -n "$(tkr_prompt_indicator)" ]]; then
    echo "Logging indicator: $(tkr_prompt_indicator)"
fi
```

**Returns**: Emoji/text indicator if logging is active, empty string otherwise.

#### `tkr_flush_batch`

Manually flush the current log batch.

```bash
# Force send any pending logs
tkr_flush_batch
```

## Integration Examples

### Shell Prompt Integration

Add logging indicator to your prompt:

```bash
# Bash
PS1="$(tkr_prompt_indicator)\u@\h:\w\$ "

# Zsh
PROMPT="$(tkr_prompt_indicator)%n@%m:%~%# "
```

### Script Integration

```bash
#!/bin/bash
source ~/.context-kit/shell/tkr-logging.sh

# Your script here
if tkr_should_log; then
    tkr_send_log "INFO" "Script started" "my-script"
fi

# Commands are automatically logged
npm run build

if [[ $? -eq 0 ]]; then
    tkr_send_log "INFO" "Build completed successfully" "my-script"
else
    tkr_send_log "ERROR" "Build failed" "my-script"
fi
```

### CI/CD Integration

```bash
# In your CI script
export TKR_LOG_ENABLED=true
export TKR_LOG_ENDPOINT="https://your-logging-service.com/api/logs"
export TKR_LOG_LEVEL="DEBUG"

source .context-kit/shell/tkr-logging.sh

# All commands now logged to your service
npm test
npm run build
npm run deploy
```

## Performance

### Overhead

- **Log Call**: < 1ms per log entry
- **Batch Send**: < 100ms per batch
- **CPU Usage**: < 1% additional
- **Memory**: < 10MB additional
- **Network**: < 10KB/s average

### Optimization

The system uses several techniques to minimize performance impact:

1. **Asynchronous Sending**: HTTP requests happen in background
2. **Batch Processing**: Multiple logs sent together
3. **Local Buffering**: Logs stored locally until batch size reached
4. **Smart Flushing**: Time-based and size-based batch flushing
5. **Command Passthrough**: User sees normal terminal behavior

## Troubleshooting

### Logging Not Working

1. **Check if in project directory**:
   ```bash
   tkr_should_log && echo "Should log" || echo "Should not log"
   ```

2. **Verify endpoint connectivity**:
   ```bash
   curl -s http://localhost:42003/health
   ```

3. **Enable debug mode**:
   ```bash
   export TKR_LOG_DEBUG=true
   source ~/.context-kit/shell/tkr-logging.sh
   ```

4. **Check configuration**:
   ```bash
   echo "Enabled: $TKR_LOG_ENABLED"
   echo "Level: $TKR_LOG_LEVEL"
   echo "Endpoint: $TKR_LOG_ENDPOINT"
   ```

### Commands Not Being Monitored

1. **Check monitored commands list**:
   ```bash
   echo "$TKR_LOG_MONITORED_COMMANDS"
   ```

2. **Verify command wrapper**:
   ```bash
   type npm  # Should show function, not just binary
   ```

3. **Re-initialize logging**:
   ```bash
   source ~/.context-kit/shell/tkr-logging.sh
   ```

### Network Issues

1. **Check endpoint URL**:
   ```bash
   curl -v "$TKR_LOG_ENDPOINT"
   ```

2. **Verify batch endpoint**:
   ```bash
   curl -v "$TKR_LOG_BATCH_ENDPOINT"
   ```

3. **Test with single log**:
   ```bash
   tkr_send_log "INFO" "Test message"
   ```

### Debug Output

Enable debug mode to see internal operations:

```bash
export TKR_LOG_DEBUG=true
export TKR_LOG_DEBUG_FILE="/tmp/tkr-debug.log"

# Watch debug output
tail -f /tmp/tkr-debug.log
```

## Security Considerations

- **Path Validation**: All paths validated to prevent traversal attacks
- **Input Sanitization**: Command arguments and output sanitized for JSON
- **Network Security**: HTTPS supported for secure log transmission
- **Access Control**: Only logs from .context-kit projects (when enabled)
- **Resource Limits**: Batch size and message length limits prevent abuse

## Advanced Configuration

### Custom Command Monitoring

```bash
# Add custom commands to monitor
export TKR_LOG_MONITORED_COMMANDS="$TKR_LOG_MONITORED_COMMANDS docker kubectl"

# Exclude specific patterns
export TKR_LOG_EXCLUDE_PATTERN="node_modules|\.git|temp"
```

### Session Tracking

```bash
# Custom session ID
export TKR_LOG_SESSION_ID="my-custom-session-$(date +%s)"

# Session-based logging
echo "Session: $TKR_LOG_SESSION_ID"
```

### Metadata Enhancement

```bash
# Add custom metadata to logs
tkr_send_log "INFO" "Custom event" "service" "component" '{
    "userId": "user123",
    "feature": "deployment",
    "version": "1.2.3"
}'
```

## Support

- **Issues**: Report bugs via GitHub issues
- **Documentation**: Full docs at `/docs/logging/`
- **API Reference**: OpenAPI spec at `/api/docs`
- **Health Check**: Service status at `http://localhost:42003/health`