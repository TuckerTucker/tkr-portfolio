import { ServiceConfig, ServiceResponse, HealthStatus } from '../types/services';

export abstract class BaseService {
  protected config: ServiceConfig;
  protected isConnected: boolean = false;

  constructor(config: ServiceConfig) {
    this.config = config;
  }

  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ServiceResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const timeout = this.config.timeout || 5000;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: T = await response.json();
      
      return {
        success: true,
        data,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  protected async makeWebSocketConnection(path: string = ''): Promise<WebSocket | null> {
    const wsUrl = `ws://${this.config.baseUrl.replace(/^https?:\/\//, '')}${path}`;
    
    try {
      const ws = new WebSocket(wsUrl);
      return new Promise((resolve, reject) => {
        ws.onopen = () => {
          this.isConnected = true;
          resolve(ws);
        };
        ws.onerror = (error) => {
          this.isConnected = false;
          reject(error);
        };
        setTimeout(() => reject(new Error('WebSocket connection timeout')), 5000);
      });
    } catch (error) {
      console.error(`Failed to connect to WebSocket at ${wsUrl}:`, error);
      return null;
    }
  }

  async checkHealth(): Promise<HealthStatus> {
    const startTime = Date.now();
    const healthEndpoint = this.config.healthEndpoint || '/health';

    try {
      const response = await this.makeRequest(healthEndpoint);
      const responseTime = Date.now() - startTime;

      if (response.success) {
        return {
          service: this.config.name,
          status: 'healthy',
          lastChecked: Date.now(),
          responseTime,
          details: response.data as Record<string, any>,
        };
      } else {
        return {
          service: this.config.name,
          status: 'degraded',
          lastChecked: Date.now(),
          responseTime,
          details: { error: response.error },
        };
      }
    } catch (error) {
      return {
        service: this.config.name,
        status: 'offline',
        lastChecked: Date.now(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  getConfig(): ServiceConfig {
    return { ...this.config };
  }

  isServiceConnected(): boolean {
    return this.isConnected;
  }

  abstract initialize(): Promise<boolean>;
  abstract disconnect(): Promise<void>;
}