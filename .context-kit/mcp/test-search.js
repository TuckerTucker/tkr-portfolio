#!/usr/bin/env node

/**
 * Test script for MCP server search_entities functionality
 * Tests wildcard queries, empty strings, and regular search queries
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPTestClient {
  constructor() {
    this.requestId = 1;
    this.responses = new Map();
  }

  async startServer() {
    console.log('Starting MCP server...');

    this.serverProcess = spawn('node', ['dist/server.js'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.serverProcess.stderr.on('data', (data) => {
      console.log('Server stderr:', data.toString());
    });

    this.serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      try {
        const lines = output.trim().split('\n');
        for (const line of lines) {
          if (line.trim()) {
            const response = JSON.parse(line);
            if (response.id) {
              this.responses.set(response.id, response);
            }
          }
        }
      } catch (e) {
        console.error('Failed to parse server response:', e.message);
        console.error('Raw output:', output);
      }
    });

    // Wait a moment for server to start
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async sendRequest(method, params = {}) {
    const request = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method: method,
      params: params
    };

    console.log(`\n📤 Sending request:`, JSON.stringify(request, null, 2));

    this.serverProcess.stdin.write(JSON.stringify(request) + '\n');

    // Wait for response
    const startTime = Date.now();
    while (!this.responses.has(request.id) && Date.now() - startTime < 10000) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const response = this.responses.get(request.id);
    if (response) {
      console.log(`📥 Received response:`, JSON.stringify(response, null, 2));
      this.responses.delete(request.id);
      return response;
    } else {
      throw new Error(`No response received for request ${request.id}`);
    }
  }

  async testWildcardSearch() {
    console.log('\n🔍 Testing wildcard search with "*"...');
    try {
      const response = await this.sendRequest('tools/call', {
        name: 'search_entities',
        arguments: { query: '*', limit: 5 }
      });

      if (response.error) {
        console.error('❌ Wildcard search failed:', response.error);
        return false;
      } else {
        console.log('✅ Wildcard search succeeded');
        return true;
      }
    } catch (error) {
      console.error('❌ Wildcard search error:', error.message);
      return false;
    }
  }

  async testEmptyStringSearch() {
    console.log('\n🔍 Testing empty string search...');
    try {
      const response = await this.sendRequest('tools/call', {
        name: 'search_entities',
        arguments: { query: '', limit: 5 }
      });

      if (response.error) {
        console.error('❌ Empty string search failed:', response.error);
        return false;
      } else {
        console.log('✅ Empty string search succeeded');
        return true;
      }
    } catch (error) {
      console.error('❌ Empty string search error:', error.message);
      return false;
    }
  }

  async testRegularSearch() {
    console.log('\n🔍 Testing regular search query...');
    try {
      const response = await this.sendRequest('tools/call', {
        name: 'search_entities',
        arguments: { query: 'component', limit: 5 }
      });

      if (response.error) {
        console.error('❌ Regular search failed:', response.error);
        return false;
      } else {
        console.log('✅ Regular search succeeded');
        return true;
      }
    } catch (error) {
      console.error('❌ Regular search error:', error.message);
      return false;
    }
  }

  async listTools() {
    console.log('\n📋 Listing available tools...');
    try {
      const response = await this.sendRequest('tools/list');

      if (response.error) {
        console.error('❌ Failed to list tools:', response.error);
        return false;
      } else {
        console.log('✅ Tools listed successfully');
        const tools = response.result?.tools || [];
        const searchTool = tools.find(tool => tool.name === 'search_entities');
        if (searchTool) {
          console.log('✅ search_entities tool found');
          return true;
        } else {
          console.error('❌ search_entities tool not found');
          return false;
        }
      }
    } catch (error) {
      console.error('❌ List tools error:', error.message);
      return false;
    }
  }

  async stopServer() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  async runTests() {
    try {
      await this.startServer();

      console.log('🧪 Starting MCP Server Search Tests');
      console.log('=====================================');

      const results = {
        listTools: await this.listTools(),
        wildcardSearch: await this.testWildcardSearch(),
        emptyStringSearch: await this.testEmptyStringSearch(),
        regularSearch: await this.testRegularSearch()
      };

      console.log('\n📊 Test Results Summary:');
      console.log('=========================');
      Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
      });

      const allPassed = Object.values(results).every(Boolean);
      console.log(`\n🎯 Overall: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);

      return allPassed;
    } finally {
      await this.stopServer();
    }
  }
}

// Run the tests
const client = new MCPTestClient();
client.runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});