import { BaseService } from './BaseService';
import { ServiceConfig, ServiceResponse } from '../types/services';

export interface Node {
  id: string;
  type: string;
  data: {
    label: string;
    icon?: string;
    description?: string;
    [key: string]: any;
  };
  position: {
    x: number;
    y: number;
  };
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  data?: {
    [key: string]: any;
  };
}

export interface FlowData {
  nodes: Node[];
  edges: Edge[];
}

export interface Entity {
  id: string;
  type: string;
  name: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface Relation {
  id: string;
  from_id: string;
  to_id: string;
  type: string;
  properties: Record<string, any>;
  created_at: string;
}

export interface KnowledgeGraphStats {
  totalEntities: number;
  totalRelations: number;
  entityTypes: Record<string, number>;
  relationTypes: Record<string, number>;
}

export class KnowledgeGraphService extends BaseService {
  private useLiveData: boolean = true;

  constructor(config: ServiceConfig) {
    super(config);
  }

  async initialize(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      this.isConnected = health.status === 'healthy';
      return this.isConnected;
    } catch (error) {
      console.warn('Knowledge Graph service not available, using mock data');
      this.useLiveData = false;
      return true;
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
  }

  async getEntities(): Promise<ServiceResponse<Entity[]>> {
    if (!this.useLiveData) {
      return {
        success: true,
        data: this.getMockEntities(),
        timestamp: Date.now(),
      };
    }

    return this.makeRequest<Entity[]>('/api/entities');
  }

  async getRelations(): Promise<ServiceResponse<Relation[]>> {
    if (!this.useLiveData) {
      return {
        success: true,
        data: this.getMockRelations(),
        timestamp: Date.now(),
      };
    }

    return this.makeRequest<Relation[]>('/api/relations');
  }

  async getFlowData(flowType: 'full' | 'module' = 'full'): Promise<ServiceResponse<FlowData>> {
    if (!this.useLiveData) {
      return {
        success: true,
        data: this.getMockFlowData(flowType),
        timestamp: Date.now(),
      };
    }

    return this.makeRequest<FlowData>(`/api/flow/${flowType}`);
  }

  async getStats(): Promise<ServiceResponse<KnowledgeGraphStats>> {
    if (!this.useLiveData) {
      return {
        success: true,
        data: this.getMockStats(),
        timestamp: Date.now(),
      };
    }

    return this.makeRequest<KnowledgeGraphStats>('/api/stats');
  }

  async searchEntities(query: string): Promise<ServiceResponse<Entity[]>> {
    if (!this.useLiveData) {
      const mockEntities = this.getMockEntities();
      const filtered = mockEntities.filter(entity =>
        entity.name.toLowerCase().includes(query.toLowerCase()) ||
        entity.type.toLowerCase().includes(query.toLowerCase())
      );
      return {
        success: true,
        data: filtered,
        timestamp: Date.now(),
      };
    }

    return this.makeRequest<Entity[]>(`/api/entities/search?q=${encodeURIComponent(query)}`);
  }

  private getMockEntities(): Entity[] {
    return [
      {
        id: '1',
        type: 'module',
        name: 'Dashboard',
        data: { description: 'Main dashboard module' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
      },
      {
        id: '2',
        type: 'component',
        name: 'Header',
        data: { description: 'Navigation header component' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
      },
      {
        id: '3',
        type: 'service',
        name: 'KnowledgeGraphService',
        data: { description: 'Service for accessing knowledge graph data' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
      },
    ];
  }

  private getMockRelations(): Relation[] {
    return [
      {
        id: '1',
        from_id: '1',
        to_id: '2',
        type: 'contains',
        properties: {},
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        from_id: '2',
        to_id: '3',
        type: 'uses',
        properties: {},
        created_at: new Date().toISOString(),
      },
    ];
  }

  private getMockFlowData(_flowType: 'full' | 'module'): FlowData {
    const nodes: Node[] = [
      {
        id: '1',
        type: 'module',
        data: {
          label: 'Dashboard',
          icon: '📊',
          description: 'Main dashboard module',
        },
        position: { x: 250, y: 100 },
      },
      {
        id: '2',
        type: 'component',
        data: {
          label: 'Header',
          icon: '🏗️',
          description: 'Navigation header component',
        },
        position: { x: 100, y: 250 },
      },
      {
        id: '3',
        type: 'service',
        data: {
          label: 'KnowledgeGraphService',
          icon: '⚙️',
          description: 'Knowledge graph data service',
        },
        position: { x: 400, y: 250 },
      },
    ];

    const edges: Edge[] = [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'contains',
        label: 'contains',
      },
      {
        id: 'e2-3',
        source: '2',
        target: '3',
        type: 'uses',
        label: 'uses',
      },
    ];

    return { nodes, edges };
  }

  private getMockStats(): KnowledgeGraphStats {
    return {
      totalEntities: 3,
      totalRelations: 2,
      entityTypes: {
        module: 1,
        component: 1,
        service: 1,
      },
      relationTypes: {
        contains: 1,
        uses: 1,
      },
    };
  }
}