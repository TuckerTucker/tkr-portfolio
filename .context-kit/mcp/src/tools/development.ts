import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';
import { MCPServerConfig, ToolDefinition, ToolResponse } from '../types.js';

// Global registry for running processes
const runningProcesses = new Map<string, ChildProcess>();

export function setupDevelopmentTools(
  config: MCPServerConfig,
  toolHandlers: Map<string, (args: any) => Promise<ToolResponse>>
): ToolDefinition[] {
  const projectRoot = config.projectRoot || process.cwd();

  const tools: ToolDefinition[] = [
    {
      name: 'start_dev_server',
      description: 'Start the UI development server',
      inputSchema: {
        type: 'object',
        properties: {
          module: { 
            type: 'string', 
            description: 'Module to start dev server for',
            default: 'knowledge-graph'
          },
          port: { 
            type: 'number', 
            description: 'Port to run on (optional)' 
          },
          detached: { 
            type: 'boolean', 
            description: 'Run in detached mode',
            default: true
          }
        }
      }
    },
    {
      name: 'build_ui',
      description: 'Build production UI assets',
      inputSchema: {
        type: 'object',
        properties: {
          module: { 
            type: 'string', 
            description: 'Module to build',
            default: 'knowledge-graph'
          }
        }
      }
    },
    {
      name: 'run_tests',
      description: 'Execute test suites',
      inputSchema: {
        type: 'object',
        properties: {
          module: { 
            type: 'string', 
            description: 'Module to test',
            default: 'knowledge-graph'
          },
          watch: { 
            type: 'boolean', 
            description: 'Run tests in watch mode',
            default: false
          },
          coverage: { 
            type: 'boolean', 
            description: 'Generate coverage report',
            default: false
          }
        }
      }
    },
    {
      name: 'stop_services',
      description: 'Stop running development services',
      inputSchema: {
        type: 'object',
        properties: {
          service: { 
            type: 'string', 
            description: 'Specific service to stop (optional)' 
          }
        }
      }
    },
    {
      name: 'service_status',
      description: 'Check status of running development services',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    }
  ];

  // Register tool handlers
  toolHandlers.set('start_dev_server', async (args) => {
    const { module = 'knowledge-graph', port, detached = true } = args;
    
    try {
      const serviceKey = `dev-server-${module}`;
      
      // Check if already running
      if (runningProcesses.has(serviceKey)) {
        return {
          content: [
            {
              type: 'text',
              text: `Development server for ${module} is already running`
            }
          ]
        };
      }

      const result = await startDevServer(projectRoot, module, port, detached);
      
      if (detached && result.process) {
        runningProcesses.set(serviceKey, result.process);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Development server started for ${module}\n\n${result.output}\n\n${detached ? 'Running in detached mode. Use stop_services to stop.' : 'Process completed.'}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to start dev server: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  });

  toolHandlers.set('build_ui', async (args) => {
    const { module = 'knowledge-graph' } = args;
    
    try {
      const result = await buildUI(projectRoot, module);

      return {
        content: [
          {
            type: 'text',
            text: `Build completed for ${module}:\n\nExit Code: ${result.exitCode}\n\nOutput:\n${result.output}\n\nErrors:\n${result.error}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Build failed: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  });

  toolHandlers.set('run_tests', async (args) => {
    const { module = 'knowledge-graph', watch = false, coverage = false } = args;
    
    try {
      const result = await runTests(projectRoot, module, { watch, coverage });

      return {
        content: [
          {
            type: 'text',
            text: `Tests completed for ${module}:\n\nExit Code: ${result.exitCode}\n\nOutput:\n${result.output}\n\nErrors:\n${result.error}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Tests failed: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  });

  toolHandlers.set('stop_services', async (args) => {
    const { service } = args;
    
    try {
      const stopped = await stopServices(service);
      
      let output = 'Service stop results:\n\n';
      stopped.forEach(({ service, success, message }) => {
        output += `${service}: ${success ? '✅ Stopped' : '❌ Failed'}\n`;
        if (message) {
          output += `  ${message}\n`;
        }
      });

      return {
        content: [
          {
            type: 'text',
            text: output
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to stop services: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  });

  toolHandlers.set('service_status', async (args) => {
    try {
      const status = getServiceStatus();
      
      let output = 'Running development services:\n\n';
      if (status.length === 0) {
        output += 'No services currently running\n';
      } else {
        status.forEach(({ service, pid, status: serviceStatus }) => {
          output += `${service}: ${serviceStatus} (PID: ${pid})\n`;
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: output
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to get service status: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  });

  return tools;
}

async function startDevServer(
  projectRoot: string, 
  module: string, 
  port?: number, 
  detached: boolean = true
): Promise<{ output: string; process?: ChildProcess }> {
  const moduleDir = join(projectRoot, '_project', module);
  
  // Determine the dev script command
  let script = 'dev:ui'; // Default for knowledge-graph
  if (module === 'mcp') {
    script = 'dev';
  }
  
  const args = ['run', script];
  if (port) {
    args.push('--', '--port', port.toString());
  }

  if (detached) {
    // Start in detached mode
    const child = spawn('npm', args, {
      cwd: moduleDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true
    });

    // Give it a moment to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    let output = `Started development server for ${module}`;
    if (port) {
      output += ` on port ${port}`;
    }
    output += '\n\nServer is running in background mode.';

    return { output, process: child };
  } else {
    // Run synchronously
    return new Promise((resolve, reject) => {
      const child = spawn('npm', args, {
        cwd: moduleDir,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let error = '';

      child.stdout?.on('data', (data) => {
        output += data.toString();
      });

      child.stderr?.on('data', (data) => {
        error += data.toString();
      });

      child.on('close', (code) => {
        resolve({ output: output + error });
      });

      child.on('error', (err) => {
        reject(new Error(`Failed to start dev server: ${err.message}`));
      });
    });
  }
}

async function buildUI(projectRoot: string, module: string): Promise<{
  exitCode: number;
  output: string;
  error: string;
}> {
  const moduleDir = join(projectRoot, '_project', module);
  
  return new Promise((resolve, reject) => {
    const child = spawn('npm', ['run', 'build:ui'], {
      cwd: moduleDir,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let error = '';

    child.stdout?.on('data', (data) => {
      output += data.toString();
    });

    child.stderr?.on('data', (data) => {
      error += data.toString();
    });

    child.on('close', (code) => {
      resolve({
        exitCode: code || 0,
        output,
        error
      });
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to build UI: ${err.message}`));
    });
  });
}

async function runTests(
  projectRoot: string, 
  module: string, 
  options: { watch?: boolean; coverage?: boolean }
): Promise<{
  exitCode: number;
  output: string;
  error: string;
}> {
  const moduleDir = join(projectRoot, '_project', module);
  
  let script = 'test';
  if (options.watch) {
    script = 'test:watch';
  } else if (options.coverage) {
    script = 'test:coverage';
  }
  
  return new Promise((resolve, reject) => {
    const child = spawn('npm', ['run', script], {
      cwd: moduleDir,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let error = '';

    child.stdout?.on('data', (data) => {
      output += data.toString();
    });

    child.stderr?.on('data', (data) => {
      error += data.toString();
    });

    child.on('close', (code) => {
      resolve({
        exitCode: code || 0,
        output,
        error
      });
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to run tests: ${err.message}`));
    });
  });
}

async function stopServices(specificService?: string): Promise<Array<{
  service: string;
  success: boolean;
  message?: string;
}>> {
  const results = [];
  
  if (specificService) {
    // Stop specific service
    const process = runningProcesses.get(specificService);
    if (process) {
      try {
        process.kill();
        runningProcesses.delete(specificService);
        results.push({ service: specificService, success: true });
      } catch (error) {
        results.push({ 
          service: specificService, 
          success: false, 
          message: error instanceof Error ? error.message : String(error)
        });
      }
    } else {
      results.push({ 
        service: specificService, 
        success: false, 
        message: 'Service not found or not running'
      });
    }
  } else {
    // Stop all services
    for (const [serviceName, process] of runningProcesses.entries()) {
      try {
        process.kill();
        runningProcesses.delete(serviceName);
        results.push({ service: serviceName, success: true });
      } catch (error) {
        results.push({ 
          service: serviceName, 
          success: false, 
          message: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }
  
  return results;
}

function getServiceStatus(): Array<{
  service: string;
  pid: number;
  status: string;
}> {
  const status = [];
  
  for (const [serviceName, process] of runningProcesses.entries()) {
    status.push({
      service: serviceName,
      pid: process.pid || 0,
      status: process.killed ? 'stopped' : 'running'
    });
  }
  
  return status;
}