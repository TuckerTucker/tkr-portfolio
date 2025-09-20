import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Code,
  Database,
  FileText,
  Filter,
  GitBranch,
  Home,
  Menu,
  Play,
  RefreshCw,
  Search,
  Server,
  Settings,
  Terminal,
  Wrench,
  X,
  ChevronDown,
  ChevronRight,
  Zap,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload,
  Trash2,
  Plus,
  Minus,
} from 'lucide-react';
import clsx from 'clsx';

// TypeScript Interfaces
interface ServiceHealth {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  uptime: number;
  responseTime: number;
  lastChecked: Date;
  metrics: {
    cpu: number;
    memory: number;
    requests: number;
    errors: number;
  };
  endpoints: {
    name: string;
    status: 'healthy' | 'warning' | 'error';
    responseTime: number;
  }[];
}

interface Entity {
  id: string;
  type: string;
  name: string;
  properties: Record<string, any>;
  metadata: {
    created: Date;
    updated: Date;
    version: number;
  };
}

interface Relation {
  id: string;
  source: string;
  target: string;
  type: string;
  properties: Record<string, any>;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warning' | 'error';
  service: string;
  message: string;
  metadata?: Record<string, any>;
  stackTrace?: string;
}

interface MCPTool {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: {
    name: string;
    type: string;
    required: boolean;
    description: string;
    default?: any;
  }[];
  lastUsed?: Date;
  executionCount: number;
}

interface DashboardProps {
  services: ServiceHealth[];
  entities: Entity[];
  relations: Relation[];
  logs: LogEntry[];
  tools: MCPTool[];
  onServiceRefresh?: (serviceId: string) => void;
  onLogFilter?: (filters: LogFilters) => void;
  onToolExecute?: (toolId: string, params: Record<string, any>) => void;
  onEntitySelect?: (entityId: string) => void;
}

interface LogFilters {
  level?: string[];
  service?: string[];
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Custom ReactFlow Node Component
const CustomNode: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 min-w-[200px] hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <div className={clsx(
          'w-8 h-8 rounded-full flex items-center justify-center',
          data.type === 'service' && 'bg-blue-100 text-blue-600',
          data.type === 'database' && 'bg-purple-100 text-purple-600',
          data.type === 'api' && 'bg-green-100 text-green-600',
          data.type === 'user' && 'bg-orange-100 text-orange-600'
        )}>
          {data.type === 'service' && <Server className="w-4 h-4" />}
          {data.type === 'database' && <Database className="w-4 h-4" />}
          {data.type === 'api' && <Code className="w-4 h-4" />}
          {data.type === 'user' && <Activity className="w-4 h-4" />}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{data.label}</h3>
          <p className="text-xs text-gray-500">{data.type}</p>
        </div>
      </div>
      {data.properties && (
        <div className="mt-2 space-y-1">
          {Object.entries(data.properties).slice(0, 3).map(([key, value]) => (
            <div key={key} className="text-xs">
              <span className="text-gray-500">{key}:</span>
              <span className="ml-1 text-gray-700">{String(value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

// Status Badge Component
const StatusBadge: React.FC<{ status: string; size?: 'sm' | 'md' | 'lg' }> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 rounded-full font-medium',
      sizeClasses[size],
      status === 'healthy' && 'bg-green-100 text-green-800',
      status === 'warning' && 'bg-amber-100 text-amber-800',
      status === 'error' && 'bg-red-100 text-red-800',
      status === 'unknown' && 'bg-gray-100 text-gray-800'
    )}>
      <span className={clsx(
        'status-indicator',
        status === 'healthy' && 'status-healthy',
        status === 'warning' && 'status-warning',
        status === 'error' && 'status-error'
      )} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Service Health Card Component
const ServiceHealthCard: React.FC<{
  service: ServiceHealth;
  onRefresh?: () => void;
}> = ({ service, onRefresh }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 card-hover">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={clsx(
            'w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center',
            service.status === 'healthy' && 'bg-green-100 text-green-600',
            service.status === 'warning' && 'bg-amber-100 text-amber-600',
            service.status === 'error' && 'bg-red-100 text-red-600',
            service.status === 'unknown' && 'bg-gray-100 text-gray-600'
          )}>
            <Server className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{service.name}</h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Last checked: {new Date(service.lastChecked).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={service.status} size="sm" />
          <button
            onClick={onRefresh}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Refresh service"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Uptime</p>
          <p className="text-sm sm:text-base font-semibold text-gray-900">{service.uptime}%</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Response</p>
          <p className="text-sm sm:text-base font-semibold text-gray-900">{service.responseTime}ms</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">CPU</p>
          <p className="text-sm sm:text-base font-semibold text-gray-900">{service.metrics.cpu}%</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Memory</p>
          <p className="text-sm sm:text-base font-semibold text-gray-900">{service.metrics.memory}%</p>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-primary hover:text-blue-700 transition-colors"
      >
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        View endpoints ({service.endpoints.length})
      </button>

      {expanded && (
        <div className="mt-4 space-y-2 animate-fade-in">
          {service.endpoints.map((endpoint, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">{endpoint.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">{endpoint.responseTime}ms</span>
                <StatusBadge status={endpoint.status} size="sm" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Log Viewer Component
const LogViewer: React.FC<{
  logs: LogEntry[];
  onFilter?: (filters: LogFilters) => void;
}> = ({ logs, onFilter }) => {
  const [filters, setFilters] = useState<LogFilters>({});
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const levelColors = {
    debug: 'text-gray-600 bg-gray-100',
    info: 'text-blue-600 bg-blue-100',
    warning: 'text-amber-600 bg-amber-100',
    error: 'text-red-600 bg-red-100',
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (filters.level && filters.level.length > 0 && !filters.level.includes(log.level)) {
        return false;
      }
      if (filters.service && filters.service.length > 0 && !filters.service.includes(log.service)) {
        return false;
      }
      if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [logs, filters, searchTerm]);

  const uniqueServices = useMemo(() => {
    return Array.from(new Set(logs.map(log => log.service)));
  }, [logs]);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">System Logs</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-64"
            />
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No logs found</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                <span className={clsx(
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium self-start',
                  levelColors[log.level]
                )}>
                  {log.level.toUpperCase()}
                </span>
                <span className="text-xs font-medium text-gray-700">{log.service}</span>
                <p className="text-sm text-gray-900 flex-1 break-words">{log.message}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Log Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Timestamp</p>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Level</p>
                  <span className={clsx(
                    'inline-flex items-center px-2.5 py-1 rounded text-sm font-medium',
                    levelColors[selectedLog.level]
                  )}>
                    {selectedLog.level.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Service</p>
                  <p className="text-sm text-gray-900">{selectedLog.service}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Message</p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedLog.message}</p>
                </div>
                {selectedLog.metadata && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Metadata</p>
                    <pre className="text-xs bg-gray-100 p-3 rounded-lg overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
                {selectedLog.stackTrace && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Stack Trace</p>
                    <pre className="text-xs bg-gray-100 p-3 rounded-lg overflow-x-auto text-red-600">
                      {selectedLog.stackTrace}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// MCP Tool Card Component
const MCPToolCard: React.FC<{
  tool: MCPTool;
  onExecute?: (params: Record<string, any>) => void;
}> = ({ tool, onExecute }) => {
  const [expanded, setExpanded] = useState(false);
  const [params, setParams] = useState<Record<string, any>>({});
  const [executing, setExecuting] = useState(false);

  const handleExecute = () => {
    setExecuting(true);
    onExecute?.(params);
    setTimeout(() => setExecuting(false), 1000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{tool.name}</h3>
            <p className="text-sm text-gray-500">{tool.category}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Used {tool.executionCount} times</p>
          {tool.lastUsed && (
            <p className="text-xs text-gray-400">
              Last: {new Date(tool.lastUsed).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">{tool.description}</p>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-primary hover:text-blue-700 transition-colors"
      >
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        Parameters ({tool.parameters.length})
      </button>

      {expanded && (
        <div className="mt-4 space-y-4 animate-fade-in">
          {tool.parameters.map((param) => (
            <div key={param.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {param.name}
                {param.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type={param.type === 'number' ? 'number' : 'text'}
                placeholder={param.description}
                value={params[param.name] || param.default || ''}
                onChange={(e) => setParams({ ...params, [param.name]: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">{param.description}</p>
            </div>
          ))}
          <button
            onClick={handleExecute}
            disabled={executing}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {executing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Execute Tool
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

// Knowledge Graph Component
const KnowledgeGraph: React.FC<{
  entities: Entity[];
  relations: Relation[];
  onEntitySelect?: (entityId: string) => void;
}> = ({ entities, relations, onEntitySelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const initialNodes: Node[] = entities.map((entity) => ({
    id: entity.id,
    type: 'custom',
    position: { x: Math.random() * 800, y: Math.random() * 600 },
    data: {
      label: entity.name,
      type: entity.type,
      properties: entity.properties,
    },
  }));

  const initialEdges: Edge[] = relations.map((relation) => ({
    id: relation.id,
    source: relation.source,
    target: relation.target,
    label: relation.type,
    type: 'smoothstep',
    animated: true,
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const entityTypes = useMemo(() => {
    return Array.from(new Set(entities.map(e => e.type)));
  }, [entities]);

  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      if (searchTerm && !node.data.label.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (selectedTypes.length > 0 && !selectedTypes.includes(node.data.type)) {
        return false;
      }
      return true;
    });
  }, [nodes, searchTerm, selectedTypes]);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Knowledge Graph</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search entities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-64"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {entityTypes.map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedTypes(prev =>
                    prev.includes(type)
                      ? prev.filter(t => t !== type)
                      : [...prev, type]
                  );
                }}
                className={clsx(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  selectedTypes.includes(type)
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[400px] sm:h-[600px] border border-gray-200 rounded-lg overflow-hidden">
        {entities.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <GitBranch className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No entities to display</p>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={filteredNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        )}
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard: React.FC<DashboardProps> = ({
  services,
  entities,
  relations,
  logs,
  tools,
  onServiceRefresh,
  onLogFilter,
  onToolExecute,
  onEntitySelect,
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'services' | 'graph' | 'logs' | 'tools'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { id: 'overview', name: 'Overview', icon: Home },
    { id: 'services', name: 'Services', icon: Server },
    { id: 'graph', name: 'Knowledge Graph', icon: GitBranch },
    { id: 'logs', name: 'Logs', icon: FileText },
    { id: 'tools', name: 'MCP Tools', icon: Wrench },
  ];

  const stats = {
    totalServices: services.length,
    healthyServices: services.filter(s => s.status === 'healthy').length,
    totalEntities: entities.length,
    totalLogs: logs.length,
    errorLogs: logs.filter(l => l.level === 'error').length,
    totalTools: tools.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">TKR Dashboard</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id as any);
                  setSidebarOpen(false);
                }}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeView === item.id
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {navigation.find(n => n.id === activeView)?.name}
            </h2>
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {activeView === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Services</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                      <Server className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-sm text-green-600 mt-2">
                    {stats.healthyServices} healthy
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Entities</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalEntities}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                      <GitBranch className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    In knowledge graph
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">System Logs</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalLogs}</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-sm text-red-600 mt-2">
                    {stats.errorLogs} errors
                  </p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {logs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-start gap-3">
                      <div className={clsx(
                        'w-2 h-2 rounded-full mt-1.5',
                        log.level === 'error' && 'bg-red-500',
                        log.level === 'warning' && 'bg-amber-500',
                        log.level === 'info' && 'bg-blue-500',
                        log.level === 'debug' && 'bg-gray-500'
                      )} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{log.message}</p>
                        <p className="text-xs text-gray-500">
                          {log.service} • {new Date(log.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeView === 'services' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {services.length === 0 ? (
                <div className="col-span-full">
                  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
                    <Server className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No services configured</p>
                  </div>
                </div>
              ) : (
                services.map((service) => (
                  <ServiceHealthCard
                    key={service.id}
                    service={service}
                    onRefresh={() => onServiceRefresh?.(service.id)}
                  />
                ))
              )}
            </div>
          )}

          {activeView === 'graph' && (
            <KnowledgeGraph
              entities={entities}
              relations={relations}
              onEntitySelect={onEntitySelect}
            />
          )}

          {activeView === 'logs' && (
            <LogViewer logs={logs} onFilter={onLogFilter} />
          )}

          {activeView === 'tools' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tools.length === 0 ? (
                <div className="col-span-full">
                  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
                    <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No MCP tools available</p>
                  </div>
                </div>
              ) : (
                tools.map((tool) => (
                  <MCPToolCard
                    key={tool.id}
                    tool={tool}
                    onExecute={(params) => onToolExecute?.(tool.id, params)}
                  />
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Demo Component with Sample Data
const DashboardDemo: React.FC = () => {
  // Sample data for demonstration
  const sampleServices: ServiceHealth[] = [
    {
      id: '1',
      name: 'API Gateway',
      status: 'healthy',
      uptime: 99.9,
      responseTime: 45,
      lastChecked: new Date(),
      metrics: {
        cpu: 23,
        memory: 45,
        requests: 1250,
        errors: 2,
      },
      endpoints: [
        { name: '/api/v1/users', status: 'healthy', responseTime: 32 },
        { name: '/api/v1/auth', status: 'healthy', responseTime: 28 },
        { name: '/api/v1/products', status: 'warning', responseTime: 156 },
      ],
    },
    {
      id: '2',
      name: 'Database Service',
      status: 'warning',
      uptime: 98.5,
      responseTime: 120,
      lastChecked: new Date(),
      metrics: {
        cpu: 67,
        memory: 82,
        requests: 890,
        errors: 15,
      },
      endpoints: [
        { name: 'Primary Connection', status: 'healthy', responseTime: 45 },
        { name: 'Replica Connection', status: 'warning', responseTime: 234 },
      ],
    },
    {
      id: '3',
      name: 'Cache Service',
      status: 'healthy',
      uptime: 100,
      responseTime: 12,
      lastChecked: new Date(),
      metrics: {
        cpu: 15,
        memory: 34,
        requests: 5670,
        errors: 0,
      },
      endpoints: [
        { name: 'Redis Master', status: 'healthy', responseTime: 8 },
        { name: 'Redis Slave', status: 'healthy', responseTime: 10 },
      ],
    },
  ];

  const sampleEntities: Entity[] = [
    {
      id: 'e1',
      type: 'service',
      name: 'User Service',
      properties: { version: '2.1.0', port: 42101, protocol: 'HTTP' },
      metadata: { created: new Date(), updated: new Date(), version: 1 },
    },
    {
      id: 'e2',
      type: 'database',
      name: 'Users DB',
      properties: { engine: 'PostgreSQL', size: '45GB' },
      metadata: { created: new Date(), updated: new Date(), version: 1 },
    },
    {
      id: 'e3',
      type: 'api',
      name: 'REST API',
      properties: { version: 'v1', endpoints: 12 },
      metadata: { created: new Date(), updated: new Date(), version: 1 },
    },
    {
      id: 'e4',
      type: 'service',
      name: 'Auth Service',
      properties: { version: '1.5.0', port: 42102 },
      metadata: { created: new Date(), updated: new Date(), version: 1 },
    },
  ];

  const sampleRelations: Relation[] = [
    { id: 'r1', source: 'e1', target: 'e2', type: 'connects_to', properties: {} },
    { id: 'r2', source: 'e3', target: 'e1', type: 'calls', properties: {} },
    { id: 'r3', source: 'e4', target: 'e2', type: 'connects_to', properties: {} },
    { id: 'r4', source: 'e1', target: 'e4', type: 'depends_on', properties: {} },
  ];

  const sampleLogs: LogEntry[] = [
    {
      id: 'l1',
      timestamp: new Date(),
      level: 'info',
      service: 'API Gateway',
      message: 'Successfully processed 1000 requests in the last minute',
    },
    {
      id: 'l2',
      timestamp: new Date(Date.now() - 60000),
      level: 'warning',
      service: 'Database Service',
      message: 'High memory usage detected: 82% of available memory',
      metadata: { memory_usage: 82, threshold: 80 },
    },
    {
      id: 'l3',
      timestamp: new Date(Date.now() - 120000),
      level: 'error',
      service: 'Auth Service',
      message: 'Failed to connect to authentication provider',
      stackTrace: 'Error: Connection timeout\n  at AuthProvider.connect()\n  at line 45',
    },
    {
      id: 'l4',
      timestamp: new Date(Date.now() - 180000),
      level: 'debug',
      service: 'Cache Service',
      message: 'Cache hit ratio: 94.5%',
    },
    {
      id: 'l5',
      timestamp: new Date(Date.now() - 240000),
      level: 'info',
      service: 'API Gateway',
      message: 'Health check completed successfully',
    },
  ];

  const sampleTools: MCPTool[] = [
    {
      id: 't1',
      name: 'Database Query',
      description: 'Execute custom SQL queries on the database',
      category: 'Database',
      parameters: [
        { name: 'query', type: 'text', required: true, description: 'SQL query to execute' },
        { name: 'database', type: 'text', required: true, description: 'Target database name' },
        { name: 'timeout', type: 'number', required: false, description: 'Query timeout in seconds', default: 30 },
      ],
      executionCount: 156,
      lastUsed: new Date(Date.now() - 3600000),
    },
    {
      id: 't2',
      name: 'Service Restart',
      description: 'Restart a specific service instance',
      category: 'Service Management',
      parameters: [
        { name: 'service_id', type: 'text', required: true, description: 'Service identifier' },
        { name: 'graceful', type: 'boolean', required: false, description: 'Perform graceful shutdown', default: true },
      ],
      executionCount: 23,
      lastUsed: new Date(Date.now() - 86400000),
    },
    {
      id: 't3',
      name: 'Log Analysis',
      description: 'Analyze logs for patterns and anomalies',
      category: 'Monitoring',
      parameters: [
        { name: 'time_range', type: 'text', required: true, description: 'Time range (e.g., "1h", "24h")' },
        { name: 'service', type: 'text', required: false, description: 'Filter by service name' },
        { name: 'pattern', type: 'text', required: false, description: 'Search pattern' },
      ],
      executionCount: 89,
      lastUsed: new Date(Date.now() - 7200000),
    },
  ];

  return (
    <Dashboard
      services={sampleServices}
      entities={sampleEntities}
      relations={sampleRelations}
      logs={sampleLogs}
      tools={sampleTools}
      onServiceRefresh={(id) => console.log('Refresh service:', id)}
      onLogFilter={(filters) => console.log('Filter logs:', filters)}
      onToolExecute={(id, params) => console.log('Execute tool:', id, params)}
      onEntitySelect={(id) => console.log('Select entity:', id)}
    />
  );
};

// App Component
function App() {
  return <DashboardDemo />;
}

export default App;
