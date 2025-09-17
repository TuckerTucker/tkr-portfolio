export interface MCPServerConfig {
  databasePath?: string;
  projectRoot?: string;
  serverName?: string;
  version?: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

export interface ScriptExecutionConfig {
  module: string;
  script: string;
  args?: string[];
  workingDirectory?: string;
}

export interface ScriptInfo {
  module: string;
  name: string;
  description?: string;
  command: string;
}