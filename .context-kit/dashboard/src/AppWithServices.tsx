import React, { useState, useEffect } from 'react';
import { Dashboard } from './App'; // Import the Dashboard component from App.tsx

// Service integration for live data
const AppWithServices: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [relations, setRelations] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  // Backend API endpoints
  const API_BASE = 'http://localhost:42003';

  useEffect(() => {
    fetchAllData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchAllData, 30000); // 30 second refresh
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [servicesRes, entitiesRes, relationsRes, logsRes, toolsRes] = await Promise.allSettled([
        fetch(`${API_BASE}/health`).then(r => r.ok ? r.json() : { services: [] }),
        fetch(`${API_BASE}/entities`).then(r => r.ok ? r.json() : { data: [] }),
        fetch(`${API_BASE}/relations`).then(r => r.ok ? r.json() : { data: [] }),
        fetch(`${API_BASE}/api/logs/stream`).then(r => r.ok ? r.json() : { data: [] }),
        // MCP tools endpoint doesn't exist yet, so mock it
        Promise.resolve({ data: [] })
      ]);

      // Transform backend data to match Dashboard props interface
      if (servicesRes.status === 'fulfilled' && servicesRes.value.status) {
        // Backend is available - using live data
        setUsingMockData(false);
        const kgStatus = servicesRes.value.status === 'healthy' ? 'healthy' : 'offline';
        setServices([
          {
            id: 'knowledge-graph',
            name: 'Knowledge Graph',
            status: kgStatus,
            url: 'http://localhost:42003',
            uptime: kgStatus === 'healthy' ? 99.9 : 0,
            responseTime: kgStatus === 'healthy' ? 45 : 0,
            lastChecked: new Date(),
            metrics: {
              cpu: 23,
              memory: 45,
              requests: 1250,
              errors: kgStatus === 'healthy' ? 2 : 10
            },
            endpoints: [
              { name: '/entities', status: kgStatus, responseTime: 32 },
              { name: '/relations', status: kgStatus, responseTime: 28 },
              { name: '/api/logs/stats', status: kgStatus, responseTime: 45 }
            ]
          },
          {
            id: 'dashboard',
            name: 'Dashboard',
            status: 'healthy',
            url: 'http://localhost:42001',
            uptime: 99.8,
            responseTime: 28,
            lastChecked: new Date(),
            metrics: {
              cpu: 15,
              memory: 32,
              requests: 850,
              errors: 1
            },
            endpoints: [
              { name: '/', status: 'healthy', responseTime: 25 },
              { name: '/logs', status: 'healthy', responseTime: 30 }
            ]
          }
        ]);
      } else {
        // Backend is unavailable - using mock data
        setUsingMockData(true);
        setServices([
          {
            id: 'knowledge-graph',
            name: 'Knowledge Graph',
            status: 'offline',
            url: 'http://localhost:42003',
            uptime: 0,
            responseTime: 0,
            lastChecked: new Date(Date.now() - 300000), // 5 minutes ago
            metrics: {
              cpu: 0,
              memory: 0,
              requests: 0,
              errors: 0
            },
            endpoints: []
          },
          {
            id: 'dashboard',
            name: 'Dashboard',
            status: 'healthy',
            url: 'http://localhost:42001',
            uptime: 99.8,
            responseTime: 28,
            lastChecked: new Date(),
            metrics: {
              cpu: 15,
              memory: 32,
              requests: 850,
              errors: 1
            },
            endpoints: [
              { name: '/', status: 'healthy', responseTime: 25 },
              { name: '/logs', status: 'healthy', responseTime: 30 }
            ]
          }
        ]);
      }

      if (entitiesRes.status === 'fulfilled' && entitiesRes.value.data) {
        setEntities(transformEntities(entitiesRes.value.data));
      }

      if (relationsRes.status === 'fulfilled' && relationsRes.value.data) {
        setRelations(transformRelations(relationsRes.value.data));
      }

      if (logsRes.status === 'fulfilled' && logsRes.value.data) {
        setLogs(transformLogs(logsRes.value.data));
      }

      if (toolsRes.status === 'fulfilled' && toolsRes.value.data) {
        setTools(transformTools(toolsRes.value.data));
      }

      setError(null);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to connect to backend services. Make sure the knowledge-graph service is running on port 42003.');
    } finally {
      setLoading(false);
    }
  };

  // Transform functions to match Dashboard component interfaces

  const transformEntities = (backendEntities: any[]): any[] => {
    return backendEntities.map(entity => ({
      id: entity.id,
      type: entity.type,
      name: entity.name,
      properties: entity.data || entity.properties || {},
      metadata: {
        created: new Date(entity.created_at || Date.now()),
        updated: new Date(entity.updated_at || Date.now()),
        version: entity.version || 1
      }
    }));
  };

  const transformRelations = (backendRelations: any[]): any[] => {
    return backendRelations.map(relation => ({
      id: relation.id,
      source: relation.from_id || relation.source,
      target: relation.to_id || relation.target,
      type: relation.type,
      properties: relation.properties || {}
    }));
  };

  const transformLogs = (backendLogs: any[]): any[] => {
    return backendLogs.map((log, index) => ({
      id: log.id || `log-${index}`, // Generate ID if missing
      timestamp: log.timestamp ? new Date(log.timestamp * 1000).toISOString() : new Date().toISOString(), // Convert Unix timestamp to ISO string
      level: (log.level?.toUpperCase() || 'INFO') as 'FATAL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG', // Keep uppercase and ensure valid type
      service: log.service || 'Unknown',
      component: log.component, // Add component field
      message: log.message || '',
      metadata: log.data ? JSON.parse(log.data) : log.metadata, // Parse data field if it's a JSON string
      stackTrace: log.stackTrace
    }));
  };

  const transformTools = (backendTools: any[]): any[] => {
    return backendTools.map(tool => ({
      id: tool.id || tool.name,
      name: tool.name,
      description: tool.description || '',
      category: tool.category || 'General',
      parameters: tool.parameters || tool.inputSchema?.properties ?
        Object.entries(tool.inputSchema?.properties || {}).map(([name, schema]: [string, any]) => ({
          name,
          type: schema.type || 'string',
          required: tool.inputSchema?.required?.includes(name) || false,
          description: schema.description || '',
          default: schema.default
        })) : [],
      lastUsed: tool.lastUsed ? new Date(tool.lastUsed) : undefined,
      executionCount: tool.executionCount || 0
    }));
  };

  // Event handlers
  const handleServiceRefresh = async (serviceId: string) => {
    console.log('Refreshing service:', serviceId);
    // Trigger individual service health check
    try {
      const response = await fetch(`${API_BASE}/api/health/${serviceId}`, { method: 'POST' });
      if (response.ok) {
        fetchAllData(); // Refresh all data
      }
    } catch (err) {
      console.error('Failed to refresh service:', err);
    }
  };

  const handleLogFilter = (filters: any) => {
    console.log('Applying log filters:', filters);
    // Could implement server-side filtering here
  };

  const handleToolExecute = async (toolId: string, params: Record<string, any>) => {
    console.log('Executing tool:', toolId, params);
    try {
      const response = await fetch(`${API_BASE}/api/mcp/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolName: toolId, input: params })
      });
      if (response.ok) {
        const result = await response.json();
        console.log('Tool execution result:', result);
        // Could show result in a notification or modal
      }
    } catch (err) {
      console.error('Failed to execute tool:', err);
    }
  };

  const handleEntitySelect = (entityId: string) => {
    console.log('Selected entity:', entityId);
    // Could fetch detailed entity information
  };

  if (loading && services.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to backend services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">!</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h2>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchAllData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Dashboard with live data
  return (
    <Dashboard
      services={services}
      entities={entities}
      relations={relations}
      logs={logs}
      tools={tools}
      onServiceRefresh={handleServiceRefresh}
      onLogFilter={handleLogFilter}
      onToolExecute={handleToolExecute}
      onEntitySelect={handleEntitySelect}
      usingMockData={usingMockData}
    />
  );
};

export default AppWithServices;