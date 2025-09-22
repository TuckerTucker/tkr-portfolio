/**
 * Example Vite configuration with TKR Logging Plugin
 */

import { defineConfig } from 'vite';
import tkrLogging from './index.js';

export default defineConfig({
  plugins: [
    // Basic usage - zero config, works in development only
    tkrLogging(),

    // Advanced usage with custom configuration
    // tkrLogging({
    //   enabled: process.env.NODE_ENV === 'development',
    //   clientUrl: 'http://localhost:42003/api/logging-client.js',
    //   injectPosition: 'head-end'
    // }),

    // Other plugins...
  ],

  // Development server configuration
  server: {
    port: 3000,
    host: 'localhost'
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});

/**
 * Alternative configurations:
 */

// For custom logging service URL:
// tkrLogging({
//   clientUrl: 'http://custom-host:42003/api/logging-client.js'
// })

// For body injection:
// tkrLogging({
//   injectPosition: 'body-end'
// })

// For production logging (not recommended):
// tkrLogging({
//   enabled: true // Will inject in all builds
// })