/**
 * HTML transformation logic for injecting browser logging client
 */

/**
 * Creates a script tag for the logging client
 * @param {string} clientUrl - URL to the logging client script
 * @returns {string} HTML script tag
 */
function createLoggingScript(clientUrl) {
  return `<script
    src="${clientUrl}"
    data-tkr-logging="true"
    onerror="console.warn('TKR Logging: Client not available at ${clientUrl}')"
    async
  ></script>`;
}

/**
 * Injects script at specified position in HTML
 * @param {string} html - Original HTML content
 * @param {string} script - Script tag to inject
 * @param {string} position - Where to inject (head-start, head-end, body-start, body-end)
 * @returns {string} Modified HTML
 */
function injectScript(html, script, position = 'head-end') {
  try {
    switch (position) {
      case 'head-start':
        return html.replace(/(<head[^>]*>)/i, `$1\n  ${script}`);

      case 'head-end':
        return html.replace(/(<\/head>)/i, `  ${script}\n$1`);

      case 'body-start':
        return html.replace(/(<body[^>]*>)/i, `$1\n  ${script}`);

      case 'body-end':
        return html.replace(/(<\/body>)/i, `  ${script}\n$1`);

      default:
        // Fallback to head-end
        return html.replace(/(<\/head>)/i, `  ${script}\n$1`);
    }
  } catch (error) {
    console.warn('TKR Logging Plugin: Failed to inject script into HTML:', error.message);
    return html; // Return original HTML on error
  }
}

/**
 * Transforms HTML to include logging client script
 * @param {string} html - Original HTML content
 * @param {Object} options - Injection options
 * @param {string} options.clientUrl - URL to logging client
 * @param {string} options.injectPosition - Where to inject script
 * @param {boolean} options.enabled - Whether injection is enabled
 * @returns {string} Modified HTML
 */
export function transformIndexHtml(html, options = {}) {
  const {
    clientUrl = 'http://localhost:42003/api/logging-client.js',
    injectPosition = 'head-end',
    enabled = true
  } = options;

  // Skip injection if disabled
  if (!enabled) {
    return html;
  }

  // Validate HTML structure
  if (!html.includes('<head') || !html.includes('<body')) {
    console.warn('TKR Logging Plugin: HTML appears to be malformed, skipping injection');
    return html;
  }

  // Check if already injected
  if (html.includes('data-tkr-logging="true"')) {
    console.log('TKR Logging Plugin: Script already injected, skipping');
    return html;
  }

  const script = createLoggingScript(clientUrl);
  const transformedHtml = injectScript(html, script, injectPosition);

  console.log('TKR Logging Plugin: Injected logging client script');
  return transformedHtml;
}

/**
 * Validates injection position
 * @param {string} position - Position to validate
 * @returns {boolean} Whether position is valid
 */
export function isValidPosition(position) {
  const validPositions = ['head-start', 'head-end', 'body-start', 'body-end'];
  return validPositions.includes(position);
}

/**
 * Gets default configuration for HTML injection
 * @returns {Object} Default options
 */
export function getDefaultOptions() {
  return {
    clientUrl: 'http://localhost:42003/api/logging-client.js',
    injectPosition: 'head-end',
    enabled: process.env.NODE_ENV === 'development'
  };
}