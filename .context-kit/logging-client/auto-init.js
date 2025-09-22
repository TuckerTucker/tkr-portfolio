/**
 * Auto-initialization for tkr-context-kit logging
 * This file automatically enables console capture when imported anywhere in your project
 */

const { createAutoTkrLogger } = require('./dist/index.js');

// Auto-detect service name from package.json or use default
let serviceName = 'UnknownService';
try {
  const fs = require('fs');
  const path = require('path');
  
  // Look for package.json starting from current directory
  let currentDir = process.cwd();
  while (currentDir !== path.dirname(currentDir)) {
    const packagePath = path.join(currentDir, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      serviceName = packageJson.name || 'UnknownService';
      break;
    }
    currentDir = path.dirname(currentDir);
  }
} catch (error) {
  // Fallback to default name if package.json detection fails
  serviceName = 'AutoDetectedService';
}

// Auto-detect environment
const serviceType = typeof window !== 'undefined' ? 'frontend' : 'backend';

// Create logger with full auto-capture enabled
const logger = createAutoTkrLogger({
  service: serviceName,
  serviceType: serviceType,
  autoCapture: {
    console: true,
    unhandledErrors: true,
    express: serviceType === 'backend',
    react: serviceType === 'frontend'
  }
});

console.log(`🔍 tkr-context-kit logging initialized for "${serviceName}" (${serviceType})`);

module.exports = logger;