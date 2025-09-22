#!/usr/bin/env node

/**
 * Debug server to test tool registration
 */

import { ProjectKitMCPServer } from './dist/server.js';

class DebugMCPServer extends ProjectKitMCPServer {
  constructor() {
    super({
      databasePath: '../knowledge-graph/knowledge-graph.db',
      projectRoot: process.cwd()
    });

    console.error('Debug: Server initialized');

    // Add debugging to see what tools get registered
    const originalSet = this.toolHandlers.set.bind(this.toolHandlers);
    this.toolHandlers.set = function(key, value) {
      console.error(`Debug: Registering tool handler: ${key}`);
      return originalSet(key, value);
    };

    console.error(`Debug: Tool handlers size before setup: ${this.toolHandlers.size}`);
  }
}

const server = new DebugMCPServer();

process.on('SIGINT', async () => {
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await server.stop();
  process.exit(0);
});

server.start().catch(console.error);