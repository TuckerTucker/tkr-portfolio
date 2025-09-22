/**
 * Test HTML Plugin Hooks functionality
 *
 * Run with: node test-html-hooks.js
 */

const {
  injectLoggingScript,
  shouldInjectForChunks,
  createScriptTag,
  injectScriptIntoHtml,
  validateHtmlStructure,
  createSecureScriptTag
} = require('./html-plugin-hooks');

console.log('🧪 Testing HTML Plugin Hooks...\n');

// Test 1: Script tag creation
console.log('Test 1: Script tag creation');
const options1 = {
  clientUrl: 'http://localhost:42003/api/logging-client.js',
  injectAsync: true,
  defer: true
};
const scriptTag1 = createScriptTag(options1);
const expectedScript1 = '<script src="http://localhost:42003/api/logging-client.js" async defer onerror="console.warn(\'TKR Logging client failed to load\')"></script>';
if (scriptTag1 === expectedScript1) {
  console.log('✅ Script tag created correctly');
} else {
  console.log('❌ Script tag creation failed');
  console.log('   Expected:', expectedScript1);
  console.log('   Got:', scriptTag1);
}

// Test 2: Secure script tag creation
console.log('\nTest 2: Secure script tag creation');
const secureScript = createSecureScriptTag(options1);
if (secureScript.includes('async') && secureScript.includes('defer') && secureScript.includes('onerror')) {
  console.log('✅ Secure script tag created correctly');
} else {
  console.log('❌ Secure script tag creation failed');
  console.log('   Got:', secureScript);
}

// Test 3: HTML injection into head
console.log('\nTest 3: HTML injection into head');
const html1 = `
<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
</head>
<body>
  <div id="app"></div>
</body>
</html>
`.trim();

const scriptTag2 = '<script src="test.js"></script>';
const injectedHtml1 = injectScriptIntoHtml(html1, scriptTag2, options1);

if (injectedHtml1.includes('<script src="test.js"></script>') && injectedHtml1.includes('</head>')) {
  console.log('✅ Script injected into head correctly');
} else {
  console.log('❌ Script injection into head failed');
  console.log('   Result:', injectedHtml1);
}

// Test 4: HTML injection fallback to body
console.log('\nTest 4: HTML injection fallback to body');
const html2 = `
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
</body>
</html>
`.trim();

const injectedHtml2 = injectScriptIntoHtml(html2, scriptTag2, options1);

if (injectedHtml2.includes('<script src="test.js"></script>') && injectedHtml2.includes('</body>')) {
  console.log('✅ Script injected into body correctly (fallback)');
} else {
  console.log('❌ Script injection into body failed');
  console.log('   Result:', injectedHtml2);
}

// Test 5: Chunk filtering
console.log('\nTest 5: Chunk filtering');

// Test with matching chunks
const htmlOptions1 = { chunks: ['main', 'app'] };
const targetChunks1 = ['main'];
const shouldInject1 = shouldInjectForChunks(htmlOptions1, targetChunks1);

if (shouldInject1) {
  console.log('✅ Chunk filtering working - should inject when chunks match');
} else {
  console.log('❌ Chunk filtering failed - should inject when chunks match');
}

// Test with non-matching chunks
const htmlOptions2 = { chunks: ['vendor'] };
const targetChunks2 = ['main'];
const shouldInject2 = shouldInjectForChunks(htmlOptions2, targetChunks2);

if (!shouldInject2) {
  console.log('✅ Chunk filtering working - should not inject when chunks don\'t match');
} else {
  console.log('❌ Chunk filtering failed - should not inject when chunks don\'t match');
}

// Test with 'all' chunks
const htmlOptions3 = { chunks: 'all' };
const targetChunks3 = ['main'];
const shouldInject3 = shouldInjectForChunks(htmlOptions3, targetChunks3);

if (shouldInject3) {
  console.log('✅ Chunk filtering working - should inject when chunks is "all"');
} else {
  console.log('❌ Chunk filtering failed - should inject when chunks is "all"');
}

// Test 6: HTML structure validation
console.log('\nTest 6: HTML structure validation');

const validHtml = `
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body><div id="app"></div></body>
</html>
`.trim();

const isValid1 = validateHtmlStructure(validHtml, 'TestPlugin');
if (isValid1) {
  console.log('✅ Valid HTML structure correctly identified');
} else {
  console.log('❌ Valid HTML structure validation failed');
}

const invalidHtml = '<div>Invalid HTML</div>';
const isValid2 = validateHtmlStructure(invalidHtml, 'TestPlugin');
if (!isValid2) {
  console.log('✅ Invalid HTML structure correctly identified');
} else {
  console.log('❌ Invalid HTML structure validation failed');
}

// Test 7: Full injection simulation
console.log('\nTest 7: Full injection simulation');

const mockData = {
  html: `
<!DOCTYPE html>
<html>
<head>
  <title>Test App</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
  `.trim(),
  plugin: {
    options: {
      chunks: ['main']
    }
  }
};

const mockOptions = {
  clientUrl: 'http://localhost:42003/api/logging-client.js',
  chunks: ['main'],
  debug: false
};

const result = injectLoggingScript(mockData, mockOptions, 'TestPlugin');

if (result.includes('http://localhost:42003/api/logging-client.js') &&
    result.includes('</head>') &&
    result !== mockData.html) {
  console.log('✅ Full injection simulation successful');
} else {
  console.log('❌ Full injection simulation failed');
  console.log('   Original length:', mockData.html.length);
  console.log('   Result length:', result.length);
  console.log('   Contains script URL:', result.includes('http://localhost:42003/api/logging-client.js'));
}

// Test 8: Prevent duplicate injection
console.log('\nTest 8: Prevent duplicate injection');

const htmlWithScript = `
<!DOCTYPE html>
<html>
<head>
  <title>Test App</title>
  <script src="http://localhost:42003/api/logging-client.js"></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>
`.trim();

const mockDataWithScript = {
  html: htmlWithScript,
  plugin: {
    options: {
      chunks: ['main']
    }
  }
};

const resultNoDuplicate = injectLoggingScript(mockDataWithScript, mockOptions, 'TestPlugin');

if (resultNoDuplicate === htmlWithScript) {
  console.log('✅ Duplicate injection prevention working');
} else {
  console.log('❌ Duplicate injection prevention failed');
}

console.log('\n🎉 HTML Plugin Hooks tests completed!');