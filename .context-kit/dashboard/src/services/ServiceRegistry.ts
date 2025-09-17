import { ServiceConfig, ServiceRegistry as ServiceRegistryType, HealthStatus } from '../types/services';
import { BaseService } from './BaseService';

export class ServiceRegistry {
  private services: Map<string, BaseService> = new Map();
  private configs: ServiceRegistryType = {};
  private healthStatuses: Map<string, HealthStatus> = new Map();

  constructor() {
    this.loadDefaultConfigs();
  }

  private loadDefaultConfigs() {
    this.configs = {
      'knowledge-graph': {
        name: 'Knowledge Graph',
        baseUrl: 'http://localhost:42003',
        port: 42003,
        enabled: true,
        healthEndpoint: '/health',
        timeout: 5000,
      },
      'logging': {
        name: 'Logging Service',
        baseUrl: 'http://localhost:42003',
        port: 42003,
        enabled: true,
        healthEndpoint: '/logs/health',
        timeout: 5000,
      },
      'mcp-tools': {
        name: 'MCP Tools',
        baseUrl: 'http://localhost:42003',
        port: 42003,
        enabled: true,
        healthEndpoint: '/mcp/health',
        timeout: 5000,
      },
    };
  }

  registerService<T extends BaseService>(
    serviceName: string,
    service: T,
    config?: Partial<ServiceConfig>
  ): void {
    if (config) {
      this.configs[serviceName] = { ...this.configs[serviceName], ...config };
    }
    this.services.set(serviceName, service);
  }

  getService<T extends BaseService>(serviceName: string): T | null {
    return (this.services.get(serviceName) as T) || null;
  }

  getAllServices(): BaseService[] {
    return Array.from(this.services.values());
  }

  getServiceNames(): string[] {
    return Array.from(this.services.keys());
  }

  getConfig(serviceName: string): ServiceConfig | null {
    return this.configs[serviceName] || null;
  }

  getAllConfigs(): ServiceRegistryType {
    return { ...this.configs };
  }

  async initializeAll(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    
    for (const [serviceName, service] of this.services) {
      try {
        const success = await service.initialize();
        results.set(serviceName, success);
      } catch (error) {
        console.error(`Failed to initialize service ${serviceName}:`, error);
        results.set(serviceName, false);
      }
    }

    return results;
  }

  async checkAllHealth(): Promise<Map<string, HealthStatus>> {
    const healthResults = new Map<string, HealthStatus>();

    for (const [serviceName, service] of this.services) {
      try {
        const health = await service.checkHealth();
        healthResults.set(serviceName, health);
        this.healthStatuses.set(serviceName, health);
      } catch (error) {
        const errorHealth: HealthStatus = {
          service: serviceName,
          status: 'offline',
          lastChecked: Date.now(),
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        };
        healthResults.set(serviceName, errorHealth);
        this.healthStatuses.set(serviceName, errorHealth);
      }
    }

    return healthResults;
  }

  getHealthStatus(serviceName: string): HealthStatus | null {
    return this.healthStatuses.get(serviceName) || null;
  }

  getAllHealthStatuses(): HealthStatus[] {
    return Array.from(this.healthStatuses.values());
  }

  async disconnectAll(): Promise<void> {
    for (const [serviceName, service] of this.services) {
      try {
        await service.disconnect();
      } catch (error) {
        console.error(`Failed to disconnect service ${serviceName}:`, error);
      }
    }
  }

  updateConfig(serviceName: string, config: Partial<ServiceConfig>): void {
    if (this.configs[serviceName]) {
      this.configs[serviceName] = { ...this.configs[serviceName], ...config };
    }
  }

  enableService(serviceName: string): void {
    this.updateConfig(serviceName, { enabled: true });
  }

  disableService(serviceName: string): void {
    this.updateConfig(serviceName, { enabled: false });
  }
}