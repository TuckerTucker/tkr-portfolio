/**
 * HTML Plugin Hooks - HtmlWebpackPlugin integration for TkrLoggingPlugin
 *
 * Handles the actual script injection logic using HtmlWebpackPlugin hooks.
 * Supports multiple HTML files and chunk-specific injection.
 *
 * @author Tucker <github.com/tuckertucker>
 * @version 1.0.0
 */

/**
 * Setup HTML plugin hooks for script injection
 */
function setupHtmlPluginHooks(compilation, HtmlWebpackPlugin, options, pluginName) {
  try {
    const hooks = HtmlWebpackPlugin.getHooks(compilation);

    if (!hooks || !hooks.beforeEmit) {
      console.warn(`[${pluginName}] HtmlWebpackPlugin hooks not available`);
      return;
    }

    // Hook into beforeEmit to modify HTML before it's written
    hooks.beforeEmit.tapAsync(pluginName, (data, callback) => {
      try {
        const modifiedHtml = injectLoggingScript(data, options, pluginName);
        data.html = modifiedHtml;
        callback(null, data);
      } catch (error) {
        console.error(`[${pluginName}] Error injecting script:`, error);
        callback(error, data);
      }
    });

    if (options.debug) {
      console.log(`[${pluginName}] Successfully hooked into HtmlWebpackPlugin`);
    }

  } catch (error) {
    console.error(`[${pluginName}] Failed to setup HTML plugin hooks:`, error);
  }
}

/**
 * Inject the logging script into HTML
 */
function injectLoggingScript(data, options, pluginName) {
  // Check if this HTML file should include the logging script
  if (!shouldInjectForChunks(data.plugin.options, options.chunks)) {
    if (options.debug) {
      console.log(`[${pluginName}] Skipping injection for chunks:`, data.plugin.options.chunks);
    }
    return data.html;
  }

  // Check if script is already injected
  if (data.html.includes(options.clientUrl)) {
    if (options.debug) {
      console.log(`[${pluginName}] Script already present, skipping injection`);
    }
    return data.html;
  }

  // Create the script tag
  const scriptTag = createScriptTag(options);

  // Inject the script
  const injectedHtml = injectScriptIntoHtml(data.html, scriptTag, options);

  if (options.debug) {
    console.log(`[${pluginName}] Successfully injected logging script into HTML`);
  }

  return injectedHtml;
}

/**
 * Check if script should be injected based on chunks
 */
function shouldInjectForChunks(htmlPluginOptions, targetChunks) {
  // If no chunks specified in HTML plugin, always inject
  if (!htmlPluginOptions.chunks) {
    return true;
  }

  // If HTML plugin uses 'all', inject
  if (htmlPluginOptions.chunks === 'all') {
    return true;
  }

  // Check if any target chunks are in the HTML plugin's chunks
  if (Array.isArray(htmlPluginOptions.chunks) && Array.isArray(targetChunks)) {
    return htmlPluginOptions.chunks.some(chunk => targetChunks.includes(chunk));
  }

  // Default to inject if we can't determine
  return true;
}

/**
 * Create the script tag for logging client
 */
function createScriptTag(options) {
  const attributes = [];

  // Add async and defer attributes
  if (options.injectAsync) {
    attributes.push('async');
  }
  if (options.defer) {
    attributes.push('defer');
  }

  // Add error handling
  attributes.push('onerror="console.warn(\'TKR Logging client failed to load\')"');

  const attributeString = attributes.length > 0 ? ' ' + attributes.join(' ') : '';

  return `<script src="${options.clientUrl}"${attributeString}></script>`;
}

/**
 * Inject script into HTML at the appropriate location
 */
function injectScriptIntoHtml(html, scriptTag, options) {
  // Try to inject before closing head tag first
  if (html.includes('</head>')) {
    return html.replace('</head>', `  ${scriptTag}\n</head>`);
  }

  // Fallback to before closing body tag
  if (html.includes('</body>')) {
    return html.replace('</body>', `  ${scriptTag}\n</body>`);
  }

  // Fallback to end of HTML
  if (html.includes('</html>')) {
    return html.replace('</html>', `${scriptTag}\n</html>`);
  }

  // Last resort - append to end
  return html + '\n' + scriptTag;
}

/**
 * Advanced injection with position control
 */
function injectAtPosition(html, scriptTag, position) {
  switch (position) {
    case 'head-start':
      return html.replace('<head>', `<head>\n  ${scriptTag}`);

    case 'head-end':
      return html.replace('</head>', `  ${scriptTag}\n</head>`);

    case 'body-start':
      return html.replace('<body>', `<body>\n  ${scriptTag}`);

    case 'body-end':
      return html.replace('</body>', `  ${scriptTag}\n</body>`);

    default:
      // Default to head-end
      return injectScriptIntoHtml(html, scriptTag);
  }
}

/**
 * Validate HTML structure before injection
 */
function validateHtmlStructure(html, pluginName) {
  const hasHtml = html.includes('<html');
  const hasHead = html.includes('<head');
  const hasBody = html.includes('<body');

  if (!hasHtml || !hasHead || !hasBody) {
    console.warn(`[${pluginName}] HTML structure may be incomplete:`, {
      hasHtml,
      hasHead,
      hasBody
    });
  }

  return hasHtml && hasHead && hasBody;
}

/**
 * Create script tag with integrity checking
 */
function createSecureScriptTag(options) {
  let scriptTag = `<script src="${options.clientUrl}"`;

  // Add security attributes
  if (options.clientUrl.startsWith('http://localhost') || options.clientUrl.startsWith('http://127.0.0.1')) {
    // Local development - add basic error handling
    scriptTag += ' onerror="console.warn(\'TKR Logging client failed to load from localhost\')"';
  } else {
    // External URL - add more security
    scriptTag += ' crossorigin="anonymous"';
    scriptTag += ' onerror="console.warn(\'TKR Logging client failed to load\')"';
  }

  // Add async/defer
  if (options.injectAsync) {
    scriptTag += ' async';
  }
  if (options.defer) {
    scriptTag += ' defer';
  }

  scriptTag += '></script>';

  return scriptTag;
}

module.exports = {
  setupHtmlPluginHooks,
  injectLoggingScript,
  shouldInjectForChunks,
  createScriptTag,
  injectScriptIntoHtml,
  injectAtPosition,
  validateHtmlStructure,
  createSecureScriptTag
};