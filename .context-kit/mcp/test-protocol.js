#!/usr/bin/env node

/**
 * Test the MCP protocol to understand the correct format
 */

import { spawn } from 'child_process';

function createRequest(method, params = {}) {
  return JSON.stringify({
    jsonrpc: '2.0',
    id: Math.floor(Math.random() * 1000),
    method: method,
    params: params
  }) + '\n';
}

async function testProtocol() {
  console.log('🔍 Testing MCP Protocol');
  console.log('=======================');

  const server = spawn('node', ['dist/server.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  server.stderr.on('data', (data) => {
    console.log('Server:', data.toString().trim());
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('\n1. Listing available tools...');
  server.stdin.write(createRequest('tools/list'));

  let responses = 0;
  server.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`\n📥 Response ${++responses}:`);

    try {
      const response = JSON.parse(output);
      if (response.result && response.result.tools) {
        const tools = response.result.tools;
        console.log(`Found ${tools.length} tools:`);
        const searchTool = tools.find(t => t.name === 'search_entities');
        if (searchTool) {
          console.log('✅ search_entities tool found!');
          console.log('Tool definition:', JSON.stringify(searchTool, null, 2));
        } else {
          console.log('❌ search_entities tool not found');
          console.log('Available tools:', tools.map(t => t.name).join(', '));
        }
      } else if (response.error) {
        console.log('❌ Error:', response.error);
      }
    } catch (e) {
      console.log('Raw response:', output.substring(0, 500));
    }

    if (responses >= 1) {
      server.kill();
      process.exit(0);
    }
  });

  // Timeout
  setTimeout(() => {
    console.log('⏰ Timeout');
    server.kill();
    process.exit(1);
  }, 10000);
}

testProtocol().catch(console.error);