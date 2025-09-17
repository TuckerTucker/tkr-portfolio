export type ViewType = 'overview' | 'knowledge-graph' | 'logs' | 'mcp-tools' | 'health';

export type ServiceStatus = 'healthy' | 'degraded' | 'warning' | 'critical' | 'offline';

export interface ServiceHealth {
  service: string;
  status: ServiceStatus;
  lastChecked: number;
  responseTime?: number;
  details?: Record<string, any>;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'knowledge-graph' | 'logging' | 'mcp' | 'development';
  status: ServiceStatus;
  url?: string;
}

export interface DashboardConfig {
  services: {
    knowledgeGraph: {
      apiUrl: string;
      wsUrl: string;
    };
    logging: {
      apiUrl: string;
      wsUrl: string;
    };
    mcp: {
      wsUrl: string;
    };
  };
}