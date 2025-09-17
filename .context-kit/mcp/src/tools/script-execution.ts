import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import { glob } from 'glob';
import { MCPServerConfig, ToolDefinition, ToolResponse, ScriptExecutionConfig, ScriptInfo } from '../types.js';

export function setupScriptExecutionTools(
  config: MCPServerConfig,
  toolHandlers: Map<string, (args: any) => Promise<ToolResponse>>
): ToolDefinition[] {
  const projectRoot = config.projectRoot || process.cwd();

  const tools: ToolDefinition[] = [
    {
      name: 'run_script',
      description: 'Execute an npm script in a project module',
      inputSchema: {
        type: 'object',
        properties: {
          module: { 
            type: 'string', 
            description: 'Module directory (e.g., "knowledge-graph", "mcp")' 
          },
          script: { 
            type: 'string', 
            description: 'npm script name (e.g., "dev", "build", "test")' 
          },
          args: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Additional arguments to pass to the script'
          }
        },
        required: ['module', 'script']
      }
    },
    {
      name: 'list_available_scripts',
      description: 'List all available npm scripts across project modules',
      inputSchema: {
        type: 'object',
        properties: {
          module: { 
            type: 'string', 
            description: 'Specific module to list scripts for (optional)' 
          }
        }
      }
    },
    {
      name: 'check_ports',
      description: 'Check port availability in the 42xxx range',
      inputSchema: {
        type: 'object',
        properties: {
          ports: { 
            type: 'array', 
            items: { type: 'number' },
            description: 'Specific ports to check (optional)' 
          }
        }
      }
    }
  ];

  // Register tool handlers
  toolHandlers.set('run_script', async (args) => {
    const { module, script, args: scriptArgs = [] } = args;
    
    try {
      const result = await executeScript({
        module,
        script,
        args: scriptArgs,
        workingDirectory: projectRoot
      });

      return {
        content: [
          {
            type: 'text',
            text: `Script execution completed:\n\nModule: ${module}\nScript: ${script}\nExit Code: ${result.exitCode}\n\nOutput:\n${result.output}\n\nErrors:\n${result.error}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Script execution failed: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  });

  toolHandlers.set('list_available_scripts', async (args) => {
    const { module } = args;
    
    try {
      const scripts = await listAvailableScripts(projectRoot, module);
      
      let output = 'Available npm scripts:\n\n';
      scripts.forEach(script => {
        output += `${script.module}:\n`;
        output += `  ${script.name}: ${script.command}\n`;
        if (script.description) {
          output += `    Description: ${script.description}\n`;
        }
        output += '\n';
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
            text: `Failed to list scripts: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  });

  toolHandlers.set('check_ports', async (args) => {
    const { ports = [42001, 42002, 42003, 42004, 42005] } = args;
    
    try {
      const portStatus = await checkPorts(ports);
      
      let output = 'Port availability (42xxx range):\n\n';
      portStatus.forEach(({ port, available, process }) => {
        output += `Port ${port}: ${available ? '✅ Available' : '❌ In use'}\n`;
        if (process) {
          output += `  Used by: ${process}\n`;
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
            text: `Failed to check ports: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  });

  return tools;
}

async function executeScript(config: ScriptExecutionConfig): Promise<{
  exitCode: number;
  output: string;
  error: string;
}> {
  const { module, script, args = [], workingDirectory = process.cwd() } = config;
  
  // Construct the working directory for the module
  const moduleDir = join(workingDirectory, '_project', module);
  
  return new Promise((resolve, reject) => {
    const child = spawn('npm', ['run', script, ...args], {
      cwd: moduleDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
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
      reject(new Error(`Failed to execute script: ${err.message}`));
    });

    // Set timeout to prevent hanging
    setTimeout(() => {
      child.kill();
      reject(new Error('Script execution timed out after 5 minutes'));
    }, 5 * 60 * 1000);
  });
}

async function listAvailableScripts(projectRoot: string, specificModule?: string): Promise<ScriptInfo[]> {
  const scripts: ScriptInfo[] = [];
  
  // Find all package.json files in _project subdirectories
  const pattern = specificModule 
    ? `.context-kit/${specificModule}/package.json`
    : '.context-kit/*/package.json';
    
  const packageJsonFiles = await glob(pattern, { cwd: projectRoot });
  
  for (const packageJsonPath of packageJsonFiles) {
    try {
      const fullPath = join(projectRoot, packageJsonPath);
      const packageJson = JSON.parse(readFileSync(fullPath, 'utf-8'));
      const moduleName = packageJsonPath.split('/')[1]; // Extract module name
      
      if (packageJson.scripts) {
        Object.entries(packageJson.scripts).forEach(([scriptName, command]) => {
          scripts.push({
            module: moduleName,
            name: scriptName,
            command: command as string,
            description: packageJson.description
          });
        });
      }
    } catch (error) {
      console.error(`Failed to read ${packageJsonPath}:`, error);
    }
  }
  
  return scripts;
}

async function checkPorts(ports: number[]): Promise<Array<{
  port: number;
  available: boolean;
  process?: string;
}>> {
  const results = [];
  
  for (const port of ports) {
    try {
      const result = await checkSinglePort(port);
      results.push(result);
    } catch (error) {
      results.push({
        port,
        available: false,
        process: `Error checking port: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }
  
  return results;
}

function checkSinglePort(port: number): Promise<{
  port: number;
  available: boolean;
  process?: string;
}> {
  return new Promise((resolve) => {
    const { spawn } = require('child_process');
    
    // Use lsof to check if port is in use (Unix/macOS)
    const child = spawn('lsof', ['-i', `:${port}`], { stdio: 'pipe' });
    
    let output = '';
    
    child.stdout?.on('data', (data: Buffer) => {
      output += data.toString();
    });
    
    child.on('close', (code: number) => {
      if (code === 0 && output.trim()) {
        // Port is in use
        const lines = output.split('\n');
        const processLine = lines[1]; // First data line after header
        const process = processLine ? processLine.split(/\s+/)[0] : 'Unknown process';
        
        resolve({
          port,
          available: false,
          process
        });
      } else {
        // Port is available
        resolve({
          port,
          available: true
        });
      }
    });
    
    child.on('error', () => {
      // If lsof fails, assume port is available
      resolve({
        port,
        available: true
      });
    });
  });
}