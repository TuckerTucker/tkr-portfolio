export interface ServiceConfig {
  name: string;
  baseUrl: string;
  port: number;
  enabled: boolean;
  healthEndpoint?: string;
  timeout?: number;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface HealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  lastChecked: number;
  responseTime?: number;
  details?: Record<string, any>;
}

export interface ServiceRegistry {
  [serviceName: string]: ServiceConfig;
}