/**
 * Auto-initialization for tkr-context-kit logging (ESM version)
 * This file automatically enables console capture when imported anywhere in your project
 */

import { createAutoTkrLogger } from './dist/index.mjs';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { cwd } from 'process';

// Auto-detect service name from package.json or use default
let serviceName = 'UnknownService';
try {
  // Look for package.json starting from current directory
  let currentDir = cwd();
  while (currentDir !== dirname(currentDir)) {
    const packagePath = join(currentDir, 'package.json');
    if (existsSync(packagePath)) {
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
      serviceName = packageJson.name || 'UnknownService';
      break;
    }
    currentDir = dirname(currentDir);
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

export default logger;