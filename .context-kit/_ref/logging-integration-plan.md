# 📋 **Terminal & Browser Logging Integration Plan**

## **Executive Summary**
Implement automatic log capture from both browser console and terminal commands with minimal user configuration, using a layered approach that respects developer workflows while providing comprehensive logging coverage.

---

## **🎯 Phase 1: NODE_OPTIONS Integration**
*Timeline: Week 1*

### **Objective**
Enable automatic Node.js console capture with zero code changes.

### **Implementation**
1. **Enhance `auto-init.js`** in logging-client:
   - Smart detection of process type (dev server, test runner, build tool)
   - Automatic filtering of node_modules and build tool noise
   - Service name detection from package.json
   - Respect log level environment variables

2. **Setup Script Enhancement**:
   ```bash
   # Add to setup script
   echo 'export NODE_OPTIONS="--require $HOME/.context-kit/logging-client/auto-init"' >> ~/.context-kit/env
   echo "Source this file to enable logging: source ~/.context-kit/env"
   ```

3. **Smart Filtering**:
   - Skip npm/yarn internal messages
   - Detect and tag process types (dev-server, test, build)
   - Batch logs to reduce network overhead
   - Respect `TKR_LOG_LEVEL` environment variable

### **User Experience**
```bash
# One-time setup
source ~/.context-kit/env

# Now ALL Node.js processes log automatically
npm run dev  # Logs captured
npm test     # Logs captured
node app.js  # Logs captured
```

---

## **🌐 Phase 2: Browser Console Integration**
*Timeline: Week 2*

### **Objective**
Automatically inject logging client into browser with passthrough to preserve DevTools experience.

### **A. Vite Plugin**

**File**: `.context-kit/plugins/vite-plugin-tkr-logging.js`

```javascript
export default function tkrLoggingPlugin() {
  return {
    name: 'tkr-logging',

    // Inject script into HTML
    transformIndexHtml(html) {
      if (process.env.NODE_ENV !== 'development') return html;

      return html.replace(
        '</head>',
        `<script>
          (function() {
            // Load logging client from knowledge-graph service
            const script = document.createElement('script');
            script.src = 'http://localhost:42003/api/logging-client.js';
            script.async = true;
            document.head.appendChild(script);
          })();
        </script></head>`
      );
    },

    // Serve the client script
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/tkr-logging-status') {
          res.end(JSON.stringify({ enabled: true, service: 'vite-dev' }));
        } else {
          next();
        }
      });
    }
  };
}
```

**Auto-Installation**:
```javascript
// In setup script, detect vite.config.js and add:
import tkrLogging from './.context-kit/plugins/vite-plugin-tkr-logging.js';

export default {
  plugins: [
    tkrLogging(),
    // ... other plugins
  ]
}
```

### **B. Webpack Plugin**

**File**: `.context-kit/plugins/webpack-plugin-tkr-logging.js`

Similar approach using `HtmlWebpackPlugin` hooks.

### **C. Browser Logging Client**

**Key Features**:
- **Full Passthrough**: Console output appears exactly as normal
- **Stack Trace Preservation**: Using Proxy to maintain correct line numbers
- **Smart Batching**: Queue logs and send in batches
- **Performance Aware**: Stop logging if it impacts performance
- **Session Tracking**: Correlate logs within browser sessions

```javascript
// Browser client (served by knowledge-graph)
(function() {
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug
  };

  // Override with passthrough
  ['log', 'info', 'warn', 'error', 'debug'].forEach(level => {
    console[level] = new Proxy(originalConsole[level], {
      apply(target, thisArg, args) {
        // Send to logging service (async, non-blocking)
        sendToLoggingService(level, args, {
          url: window.location.href,
          timestamp: Date.now(),
          sessionId: getSessionId()
        });

        // ALWAYS call original - preserves DevTools experience
        return Reflect.apply(target, thisArg, args);
      }
    });
  });

  // Also capture unhandled errors
  window.addEventListener('error', (event) => {
    sendToLoggingService('error', [event.message], {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    });
  });
})();
```

---

## **📟 Phase 3: Terminal Shell Integration**
*Timeline: Week 2-3*

### **Objective**
Capture terminal commands and output with project-aware activation.

### **File Structure**
```
.context-kit/shell/
  ├── tkr-logging.sh        # Main logging script
  ├── install.sh            # Installation helper
  └── uninstall.sh          # Clean removal
```

### **Main Logging Script**
**File**: `.context-kit/shell/tkr-logging.sh`

```bash
#!/bin/bash
# tkr-context-kit Terminal Logging
# Version: 1.0.0

# Configuration
TKR_LOGGING_VERSION="1.0.0"
TKR_LOG_ENDPOINT="${TKR_LOG_ENDPOINT:-http://localhost:42003/api/logs}"
TKR_LOG_BATCH_SIZE="${TKR_LOG_BATCH_SIZE:-10}"
TKR_LOG_BUFFER=""
TKR_LOG_COUNT=0

# Check if we should log (only in context-kit projects)
tkr_should_log() {
  [[ -d .context-kit ]] || [[ -d ../.context-kit ]] || [[ -d ../../.context-kit ]]
}

# Send logs to service
tkr_send_log() {
  local level="$1"
  local message="$2"
  local service="${3:-terminal}"

  if ! tkr_should_log; then
    return 0
  fi

  # Add to buffer
  local log_entry=$(cat <<EOF
{
  "level": "$level",
  "message": "$message",
  "service": "$service",
  "component": "$(basename $PWD)",
  "metadata": {
    "cwd": "$PWD",
    "user": "$USER",
    "shell": "$SHELL"
  }
}
EOF
)

  # Send immediately for errors, batch others
  if [[ "$level" == "ERROR" ]] || [[ $TKR_LOG_COUNT -ge $TKR_LOG_BATCH_SIZE ]]; then
    curl -s -X POST "$TKR_LOG_ENDPOINT" \
      -H "Content-Type: application/json" \
      -d "$log_entry" 2>/dev/null &
    TKR_LOG_COUNT=0
  else
    TKR_LOG_BUFFER="$TKR_LOG_BUFFER$log_entry,"
    ((TKR_LOG_COUNT++))
  fi
}

# Pipe helper for command output
tkr_log_pipe() {
  local service="$1"
  while IFS= read -r line; do
    echo "$line"  # PASSTHROUGH - user sees output normally
    tkr_send_log "INFO" "$line" "$service"
  done
}

# Smart command wrappers (only if in project)
npm() {
  if tkr_should_log; then
    tkr_send_log "INFO" "Running: npm $*" "npm"
    command npm "$@" 2>&1 | tkr_log_pipe "npm"
    return ${PIPESTATUS[0]}
  else
    command npm "$@"
  fi
}

yarn() {
  if tkr_should_log; then
    tkr_send_log "INFO" "Running: yarn $*" "yarn"
    command yarn "$@" 2>&1 | tkr_log_pipe "yarn"
    return ${PIPESTATUS[0]}
  else
    command yarn "$@"
  fi
}

git() {
  if tkr_should_log; then
    tkr_send_log "INFO" "Running: git $*" "git"
    command git "$@" 2>&1 | tkr_log_pipe "git"
    return ${PIPESTATUS[0]}
  else
    command git "$@"
  fi
}

# Optional: Prompt indicator
tkr_prompt_indicator() {
  if tkr_should_log; then
    echo "📡"  # Small indicator that logging is active
  fi
}

# Optional: Add to prompt (user can add to PS1 if desired)
# PS1='$(tkr_prompt_indicator) \w $ '
```

### **Installation Script**
**File**: `.context-kit/scripts/enable-terminal-logging`

```bash
#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTEXT_KIT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
SHELL_DIR="$HOME/.context-kit/shell"
LOGGING_SCRIPT="$SHELL_DIR/tkr-logging.sh"

# Detect user shell
detect_shell() {
  if [[ -n "$BASH_VERSION" ]]; then
    echo "bash"
    echo "$HOME/.bashrc"
  elif [[ -n "$ZSH_VERSION" ]]; then
    echo "zsh"
    echo "$HOME/.zshrc"
  else
    echo "unknown"
    echo ""
  fi
}

# Create shell directory and copy script
install_logging_script() {
  echo "📦 Installing terminal logging script..."

  mkdir -p "$SHELL_DIR"
  cp "$CONTEXT_KIT_DIR/shell/tkr-logging.sh" "$LOGGING_SCRIPT"
  chmod +x "$LOGGING_SCRIPT"

  echo "✅ Logging script installed to $LOGGING_SCRIPT"
}

# Add source line to RC file
add_to_rc() {
  local rc_file="$1"

  if [[ ! -f "$rc_file" ]]; then
    echo "⚠️  RC file not found: $rc_file"
    return 1
  fi

  # Check if already installed
  if grep -q "tkr-context-kit-logging" "$rc_file"; then
    echo "ℹ️  Terminal logging already installed in $rc_file"
    return 0
  fi

  # Add with clear markers
  cat >> "$rc_file" << 'EOF'

# tkr-context-kit-logging - START
# Terminal logging for context-kit projects
if [[ -f "$HOME/.context-kit/shell/tkr-logging.sh" ]]; then
  source "$HOME/.context-kit/shell/tkr-logging.sh"
fi
# tkr-context-kit-logging - END
EOF

  echo "✅ Added terminal logging to $rc_file"
}

# Main installation
main() {
  echo "🚀 Installing tkr-context-kit terminal logging"
  echo ""

  # Detect shell
  read shell_type rc_file < <(detect_shell)

  if [[ "$shell_type" == "unknown" ]]; then
    echo "❌ Unable to detect shell type"
    exit 1
  fi

  echo "📝 Detected shell: $shell_type"
  echo "📝 RC file: $rc_file"
  echo ""

  # Ask for confirmation
  read -p "Install terminal logging for $shell_type? [y/N]: " confirm
  if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "❌ Installation cancelled"
    exit 0
  fi

  # Install
  install_logging_script
  add_to_rc "$rc_file"

  echo ""
  echo "✅ Terminal logging successfully installed!"
  echo ""
  echo "Next steps:"
  echo "  1. Restart your terminal, or"
  echo "  2. Run: source $rc_file"
  echo ""
  echo "Terminal logging will activate automatically in context-kit projects."
  echo "Look for 📡 in your prompt when logging is active."
  echo ""
  echo "To uninstall later, run:"
  echo "  .context-kit/scripts/disable-terminal-logging"
}

main "$@"
```

### **Uninstall Script**
**File**: `.context-kit/scripts/disable-terminal-logging`

```bash
#!/bin/bash

# Remove from RC files
for rc_file in "$HOME/.bashrc" "$HOME/.zshrc" "$HOME/.bash_profile"; do
  if [[ -f "$rc_file" ]]; then
    # Remove between markers
    sed -i.backup '/# tkr-context-kit-logging - START/,/# tkr-context-kit-logging - END/d' "$rc_file"
    echo "✅ Removed from $rc_file"
  fi
done

# Remove script files
rm -rf "$HOME/.context-kit/shell"
echo "✅ Removed logging scripts"
echo ""
echo "Terminal logging has been disabled."
echo "Restart your terminal for changes to take effect."
```

---

## **📦 Integration with Setup Script**

**Update main `setup` script:**

```bash
# Add to setup script
echo ""
echo "📟 Terminal Logging Setup"
echo "Would you like to enable terminal command logging? [y/N]: "
read -r enable_terminal

if [[ "$enable_terminal" == "y" || "$enable_terminal" == "Y" ]]; then
  "$CONTEXT_KIT_DIR/scripts/enable-terminal-logging"
fi

echo ""
echo "🌐 Browser Logging Setup"
echo "Detecting project configuration..."

if [[ -f "vite.config.js" || -f "vite.config.ts" ]]; then
  echo "✅ Vite detected - logging plugin will be available"
  echo "   Add to vite.config: import tkrLogging from './.context-kit/plugins/vite-plugin-tkr-logging'"
elif [[ -f "webpack.config.js" ]]; then
  echo "✅ Webpack detected - logging plugin will be available"
  echo "   Add to webpack.config: const TkrLoggingPlugin = require('./.context-kit/plugins/webpack-plugin-tkr-logging')"
fi
```

---

## **🎯 Success Metrics**

### **Week 1 Goals**
- ✅ NODE_OPTIONS working for Node.js processes
- ✅ Terminal logging script created and tested
- ✅ Installation/uninstallation scripts working

### **Week 2 Goals**
- ✅ Vite plugin implemented and tested
- ✅ Webpack plugin implemented and tested
- ✅ Browser client with passthrough working
- ✅ Terminal logging integrated with setup

### **Week 3 Goals**
- ✅ Full integration testing
- ✅ Performance optimization
- ✅ Documentation complete
- ✅ Multi-shell support verified

---

## **📊 Expected Outcome**

### **For Developers**
1. **Zero to minimal configuration** - Works out of the box
2. **Preserved workflows** - Console and terminal work exactly as before
3. **Project-aware** - Only active in context-kit projects
4. **Easy removal** - Clean uninstall if needed

### **For the Platform**
1. **Comprehensive coverage** - Captures browser, Node.js, and terminal
2. **Centralized logging** - All logs flow to dashboard
3. **Rich metadata** - Context about where/when/how logs originated
4. **Performance aware** - Batching and smart filtering

### **Key Differentiator**
Unlike other logging solutions that require explicit imports or configuration, this approach provides **automatic, transparent, passthrough logging** that respects developer workflows while providing comprehensive observability.

---

## **🔑 Key Design Principles**

### **1. Passthrough First**
- Console output appears exactly as normal in browser DevTools
- Terminal output displays unchanged to the user
- Logging is an addition, not a replacement

### **2. Project-Aware Activation**
- Only activates in directories with `.context-kit`
- Respects project boundaries
- No global system changes without consent

### **3. Progressive Enhancement**
- Level 0: Manual import (current state)
- Level 1: NODE_OPTIONS for Node.js
- Level 2: Build tool plugins for browser
- Level 3: Shell integration for terminal
- Level 4: Full automatic capture

### **4. Developer Respect**
- Ask permission before modifying RC files
- Clear uninstall path
- No hidden behavior
- Performance conscious

### **5. Rich Metadata**
- Capture context (URL, file, line, cwd)
- Session correlation
- Service identification
- Error stack traces

---

## **📚 Implementation Notes**

### **Browser Considerations**
- Must preserve stack traces and line numbers
- Use Proxy pattern for clean interception
- Batch logs to avoid network overhead
- Handle offline scenarios gracefully

### **Terminal Considerations**
- Preserve exit codes with PIPESTATUS
- Handle interactive prompts properly
- Don't log sensitive data (passwords)
- Work with common shells (bash, zsh, fish)

### **NODE_OPTIONS Considerations**
- Filter out build tool noise
- Handle child processes correctly
- Respect existing NODE_OPTIONS
- Work with different package managers

### **Performance Targets**
- < 1ms overhead per log call
- Batch size of 10-50 logs
- Maximum 100KB buffer
- Automatic backoff under load

---

## **🚀 Rollout Strategy**

### **Phase 1: Alpha Testing** (Week 1)
- Internal testing with team
- Focus on NODE_OPTIONS integration
- Gather feedback on terminal script

### **Phase 2: Beta Release** (Week 2)
- Release to select projects
- Add Vite/Webpack plugins
- Monitor performance impact

### **Phase 3: General Availability** (Week 3)
- Full documentation
- Video tutorials
- Integration with setup script
- Support for major frameworks

### **Phase 4: Enhancement** (Ongoing)
- Add more build tool plugins
- Support additional shells
- Enhanced filtering options
- Performance optimizations

---

## **📈 Measuring Success**

### **Technical Metrics**
- Coverage: % of logs captured vs manual
- Performance: Overhead < 1% CPU
- Reliability: < 0.1% dropped logs
- Compatibility: Works with 90% of projects

### **Developer Metrics**
- Setup time: < 30 seconds
- Learning curve: Immediate productivity
- Satisfaction: No workflow disruption
- Adoption: 80% of projects use it

### **Platform Metrics**
- Log volume: 10x increase in captured logs
- Issue detection: 50% faster problem identification
- Context quality: Rich metadata on every log
- Dashboard usage: 3x increase in engagement

---

## **🔗 Related Documentation**
- [Logging Client API Reference](./logging-client-api.md)
- [Dashboard Integration Guide](./dashboard-integration.md)
- [Knowledge Graph Architecture](./knowledge-graph-architecture.md)
- [Service Orchestration](./service-orchestration.md)