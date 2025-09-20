# TKR Logging Webpack Plugin

A production-ready Webpack plugin that automatically injects the TKR browser logging client into development builds using HtmlWebpackPlugin integration.

## Features

- 🔧 **Seamless Integration**: Works with existing HtmlWebpackPlugin configurations
- 🛡️ **Development-Only**: Automatically disabled in production builds
- 🎯 **Chunk-Specific**: Target specific chunks for injection
- 🚀 **Zero Configuration**: Works out of the box with sensible defaults
- 📦 **Multiple HTML Support**: Handles multiple HTML entry points
- ⚡ **Performance Optimized**: Async and deferred script loading
- 🔍 **Debug Mode**: Detailed logging for troubleshooting

## Installation

The plugin is included in the TKR Context Kit. No separate installation required.

## Basic Usage

Add to your `webpack.config.js`:

```javascript
const TkrLoggingPlugin = require('./.context-kit/plugins/webpack/index.js');

module.exports = {
  mode: 'development',
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
    new TkrLoggingPlugin()
  ]
};
```

## Configuration Options

```javascript
new TkrLoggingPlugin({
  // Enable/disable the plugin (default: development mode only)
  enabled: process.env.NODE_ENV === 'development',

  // URL of the logging client script
  clientUrl: 'http://localhost:42003/api/logging-client.js',

  // Which chunks to inject logging into
  chunks: ['main'],

  // Script loading behavior
  injectAsync: true,  // Add async attribute
  defer: true,        // Add defer attribute

  // Debug mode for plugin development
  debug: false
})
```

## Advanced Configuration

### Chunk-Specific Injection

Target specific webpack chunks:

```javascript
new TkrLoggingPlugin({
  chunks: ['main', 'vendor'] // Only inject into these chunks
})
```

### Multiple HTML Files

The plugin automatically handles multiple HTML files created by HtmlWebpackPlugin:

```javascript
module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.html',
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      filename: 'admin.html',
      template: 'src/admin.html',
      chunks: ['admin']
    }),
    new TkrLoggingPlugin({
      chunks: ['main', 'admin'] // Inject into both
    })
  ]
};
```

### Debug Mode

Enable debug mode to see detailed logging:

```javascript
new TkrLoggingPlugin({
  debug: true
})
```

## Optional Webpack Loader

For module-level injection (advanced use case):

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
          {
            loader: './.context-kit/plugins/webpack/loader.js',
            options: {
              enabled: process.env.NODE_ENV === 'development',
              autoInit: true,
              debugMode: false
            }
          }
        ]
      }
    ]
  }
};
```

## Error Handling

The plugin gracefully handles common issues:

- **Missing HtmlWebpackPlugin**: Shows warning with installation instructions
- **Invalid Configuration**: Validates options and provides clear error messages
- **Script Load Failures**: Adds error handlers to injected script tags
- **Multiple Injection**: Prevents duplicate script injection

## How It Works

1. **Plugin Registration**: Hooks into Webpack's compilation process
2. **Mode Detection**: Only activates in development mode
3. **HtmlWebpackPlugin Integration**: Uses `beforeEmit` hook to modify HTML
4. **Script Injection**: Injects script tag into `<head>` section
5. **Chunk Filtering**: Respects chunk configuration for targeted injection

## Troubleshooting

### Plugin Not Working

1. Ensure HtmlWebpackPlugin is installed and configured
2. Check that you're in development mode
3. Enable debug mode to see detailed logs
4. Verify the logging service is running on port 42003

### Script Not Loading

1. Check that the logging service is accessible
2. Verify the `clientUrl` configuration
3. Check browser developer tools for network errors
4. Ensure firewall/proxy settings allow localhost connections

### Performance Impact

The plugin adds minimal overhead:
- Only active in development mode
- Async script loading prevents blocking
- Single script injection per HTML file

## Integration with TKR Context Kit

This plugin is part of the comprehensive TKR Context Kit logging system:

- **Browser Client**: Captures logs in the browser
- **Knowledge Graph**: Stores and analyzes logs
- **Dashboard**: Visualizes logs and metrics
- **Shell Integration**: Captures terminal output
- **Node.js Integration**: Captures server-side logs

## API Reference

### TkrLoggingPlugin(options)

Creates a new plugin instance.

**Parameters:**
- `options` (Object): Configuration options

**Options:**
- `enabled` (Boolean): Enable/disable plugin
- `clientUrl` (String): Logging client script URL
- `chunks` (Array): Target chunk names
- `injectAsync` (Boolean): Add async attribute
- `defer` (Boolean): Add defer attribute
- `debug` (Boolean): Enable debug logging

### TkrLoggingPlugin.validateOptions(options)

Validates configuration options.

**Parameters:**
- `options` (Object): Options to validate

**Returns:**
- Array of error messages (empty if valid)

### TkrLoggingPlugin.create(options)

Factory method with validation.

**Parameters:**
- `options` (Object): Configuration options

**Returns:**
- TkrLoggingPlugin instance

**Throws:**
- Error if options are invalid

## License

MIT License - See main project for details.