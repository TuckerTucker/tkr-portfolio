# TKR Logging Vite Plugin

Automatically injects the browser logging client into development builds.

## Installation

```javascript
// vite.config.js
import tkrLogging from './.context-kit/plugins/vite/index.js';

export default {
  plugins: [
    tkrLogging(),
    // ... other plugins
  ]
}
```

## Configuration

```javascript
tkrLogging({
  enabled: process.env.NODE_ENV === 'development', // Default
  clientUrl: 'http://localhost:42003/api/logging-client.js', // Default
  injectPosition: 'head-end' // head-start, head-end, body-start, body-end
})
```

## Features

- **Zero-config setup**: Works out of the box in development mode
- **Development-only**: Automatically disabled in production builds
- **Configurable injection**: Choose where to inject the script
- **Health monitoring**: Built-in endpoints for status and health checks
- **Error handling**: Graceful fallbacks when logging service is unavailable
- **Hot reload aware**: Integrates with Vite's HMR system

## Endpoints

When plugin is active, these endpoints are available:

- `/tkr-logging-status` - Plugin status and configuration
- `/tkr-logging-health` - Health check for logging service

## Interface Compliance

This plugin implements the `vitePluginAPI` interface defined in the logging specifications:

- Plugin name: `tkr-logging`
- Configurable client URL with default fallback
- Injection position control
- Development-only activation by default
- Non-blocking script injection with error handling