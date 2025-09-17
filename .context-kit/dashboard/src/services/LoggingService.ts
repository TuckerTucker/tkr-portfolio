import { BaseService } from './BaseService';
import { ServiceConfig, ServiceResponse } from '../types/services';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'FATAL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  service: string;
  component?: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface LogQueryOptions {
  service?: string;
  level?: string;
  timeWindow?: number;
  limit?: number;
  search?: string;
  startTime?: string;
  endTime?: string;
}

export interface LogStats {
  totalLogs: number;
  logsByLevel: Record<string, number>;
  logsByService: Record<string, number>;
  errorCount: number;
  recentErrors: LogEntry[];
}

export interface ServiceHealthInfo {
  service: string;
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  lastLog: string;
  errorRate: number;
  logCount: number;
}

export class LoggingService extends BaseService {
  private useLiveData: boolean = true;
  private wsConnection: WebSocket | null = null;

  constructor(config: ServiceConfig) {
    super(config);
  }

  async initialize(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      this.isConnected = health.status === 'healthy';
      return this.isConnected;
    } catch (error) {
      console.warn('Logging service not available, using mock data');
      this.useLiveData = false;
      return true;
    }
  }

  async disconnect(): Promise<void> {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.isConnected = false;
  }

  async getLogs(options: LogQueryOptions = {}): Promise<ServiceResponse<LogEntry[]>> {
    if (!this.useLiveData) {
      return {
        success: true,
        data: this.getMockLogs(options),
        timestamp: Date.now(),
      };
    }

    const params = new URLSearchParams();
    if (options.service) params.set('service', options.service);
    if (options.level) params.set('level', options.level);
    if (options.timeWindow) params.set('timeWindow', options.timeWindow.toString());
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.search) params.set('search', options.search);
    if (options.startTime) params.set('startTime', options.startTime);
    if (options.endTime) params.set('endTime', options.endTime);

    return this.makeRequest<LogEntry[]>(`/api/logs?${params.toString()}`);
  }

  async getLogStats(): Promise<ServiceResponse<LogStats>> {
    if (!this.useLiveData) {
      return {
        success: true,
        data: this.getMockStats(),
        timestamp: Date.now(),
      };
    }

    return this.makeRequest<LogStats>('/api/logs/stats');
  }

  async getServiceHealth(): Promise<ServiceResponse<ServiceHealthInfo[]>> {
    if (!this.useLiveData) {
      return {
        success: true,
        data: this.getMockServiceHealth(),
        timestamp: Date.now(),
      };
    }

    return this.makeRequest<ServiceHealthInfo[]>('/api/logs/health');
  }

  async getRecentErrors(limit: number = 10): Promise<ServiceResponse<LogEntry[]>> {
    if (!this.useLiveData) {
      const mockLogs = this.getMockLogs({ level: 'ERROR', limit });
      return {
        success: true,
        data: mockLogs,
        timestamp: Date.now(),
      };
    }

    return this.makeRequest<LogEntry[]>(`/api/logs/errors?limit=${limit}`);
  }

  async streamLogs(
    options: LogQueryOptions,
    onMessage: (log: LogEntry) => void,
    onError?: (error: Error) => void
  ): Promise<WebSocket | null> {
    if (!this.useLiveData) {
      // Simulate streaming with mock data
      const mockLogs = this.getMockLogs(options);
      let index = 0;
      const interval = setInterval(() => {
        if (index < mockLogs.length) {
          onMessage(mockLogs[index]);
          index++;
        } else {
          clearInterval(interval);
        }
      }, 1000);
      return null;
    }

    try {
      const params = new URLSearchParams();
      if (options.service) params.set('service', options.service);
      if (options.level) params.set('level', options.level);
      if (options.limit) params.set('limit', options.limit?.toString() || '100');

      this.wsConnection = await this.makeWebSocketConnection(`/api/logs/stream?${params.toString()}`);
      
      if (this.wsConnection) {
        this.wsConnection.onmessage = (event) => {
          try {
            const log = JSON.parse(event.data) as LogEntry;
            onMessage(log);
          } catch (error) {
            console.error('Failed to parse log message:', error);
          }
        };

        this.wsConnection.onerror = (_event) => {
          const error = new Error('WebSocket error occurred');
          onError?.(error);
        };

        this.wsConnection.onclose = () => {
          this.isConnected = false;
        };
      }

      return this.wsConnection;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown WebSocket error');
      onError?.(errorObj);
      return null;
    }
  }

  private getMockLogs(options: LogQueryOptions = {}): LogEntry[] {
    const now = new Date();
    const services = ['Dashboard', 'Knowledge Graph', 'MCP Server', 'Logging Service'];
    const components = ['App', 'Header', 'ServiceRegistry', 'BaseService', 'EntityHandler', 'LogViewer'];
    const levels: LogEntry['level'][] = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
    
    const messages = [
      'Application started successfully',
      'Component mounted and initialized',
      'Processing request',
      'Database query executed',
      'User authentication completed',
      'High memory usage detected',
      'Connection pool status check',
      'Failed to fetch data: Network timeout',
      'Request processed successfully',
      'Cache hit for user preferences',
      'Validation completed',
      'Background task scheduled',
      'Configuration loaded',
      'Session expired, redirecting to login',
      'Rate limit exceeded for user',
      'Backup process initiated'
    ];

    const logs: LogEntry[] = [];
    const limit = options.limit || 50;
    const timeWindow = options.timeWindow || 3600; // 1 hour default

    for (let i = 0; i < limit; i++) {
      const timeOffset = Math.random() * timeWindow * 1000; // Random within time window
      const timestamp = new Date(now.getTime() - timeOffset).toISOString();
      const service = services[Math.floor(Math.random() * services.length)];
      const component = components[Math.floor(Math.random() * components.length)];
      const level = levels[Math.floor(Math.random() * levels.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];

      // Apply filters
      if (options.service && service !== options.service) continue;
      if (options.level && level !== options.level) continue;
      if (options.search && !message.toLowerCase().includes(options.search.toLowerCase())) continue;

      logs.push({
        id: `log-${i}`,
        timestamp,
        level,
        service,
        component,
        message,
        metadata: {
          requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
          userId: Math.random() > 0.7 ? `user-${Math.floor(Math.random() * 1000)}` : undefined,
        },
      });
    }

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private getMockStats(): LogStats {
    const recentErrors = this.getMockLogs({ level: 'ERROR', limit: 5 });
    
    return {
      totalLogs: 1247,
      logsByLevel: {
        DEBUG: 523,
        INFO: 445,
        WARN: 189,
        ERROR: 78,
        FATAL: 12,
      },
      logsByService: {
        'Dashboard': 312,
        'Knowledge Graph': 398,
        'MCP Server': 287,
        'Logging Service': 250,
      },
      errorCount: 90,
      recentErrors,
    };
  }

  private getMockServiceHealth(): ServiceHealthInfo[] {
    return [
      {
        service: 'Dashboard',
        status: 'healthy',
        lastLog: new Date(Date.now() - 30000).toISOString(),
        errorRate: 0.02,
        logCount: 312,
      },
      {
        service: 'Knowledge Graph',
        status: 'healthy',
        lastLog: new Date(Date.now() - 15000).toISOString(),
        errorRate: 0.01,
        logCount: 398,
      },
      {
        service: 'MCP Server',
        status: 'degraded',
        lastLog: new Date(Date.now() - 120000).toISOString(),
        errorRate: 0.08,
        logCount: 287,
      },
      {
        service: 'Logging Service',
        status: 'healthy',
        lastLog: new Date(Date.now() - 5000).toISOString(),
        errorRate: 0.03,
        logCount: 250,
      },
    ];
  }
}