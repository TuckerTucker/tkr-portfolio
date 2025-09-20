import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  Code,
  Database,
  FileText,
  Filter,
  GitBranch,
  Home,
  Menu,
  RefreshCw,
  Search,
  Server,
  X,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
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
  timestamp: string; // ISO string for API consistency
  level: 'FATAL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  service: string;
  component?: string; // Added for component-level logging
  message: string;
  metadata?: Record<string, any>;
  stackTrace?: string;
}

// TODO: These interfaces will be used for enhanced backend integration
// interface LogStats {
//   totalLogs: number;
//   logsByLevel: Record<string, number>;
//   logsByService: Record<string, number>;
//   errorCount: number;
//   recentErrors: LogEntry[];
// }

// interface ServiceHealthInfo {
//   service: string;
//   status: 'healthy' | 'degraded' | 'critical' | 'offline';
//   lastLog: string;
//   errorRate: number;
//   logCount: number;
//   lastErrorTime?: string;
//   uptimePercent: number;
// }


interface DashboardProps {
  services: ServiceHealth[];
  entities: Entity[];
  relations: Relation[];
  logs: LogEntry[];
  onServiceRefresh?: (serviceId: string) => void;
  onLogFilter?: (filters: LogFilters) => void;
  onEntitySelect?: (entityId: string) => void;
  usingMockData?: boolean;
}

interface LogFilters {
  level?: string[];
  service?: string[];
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  refresh?: number; // Used to trigger re-fetch for live feed
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
              Last checked: {service.lastChecked ? new Date(service.lastChecked).toLocaleTimeString() : 'Never'}
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
          <p className="text-sm sm:text-base font-semibold text-gray-900">{service.uptime || 0}%</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Response</p>
          <p className="text-sm sm:text-base font-semibold text-gray-900">{service.responseTime || 0}ms</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">CPU</p>
          <p className="text-sm sm:text-base font-semibold text-gray-900">{service.metrics?.cpu || 0}%</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Memory</p>
          <p className="text-sm sm:text-base font-semibold text-gray-900">{service.metrics?.memory || 0}%</p>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-primary hover:text-blue-700 transition-colors"
      >
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        View endpoints ({service.endpoints?.length || 0})
      </button>

      {expanded && (
        <div className="mt-4 space-y-2 animate-fade-in">
          {service.endpoints?.map((endpoint, index) => (
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

// Stats Overview Component
const StatsOverview: React.FC<{
  logs: LogEntry[];
  services: ServiceHealth[];
  usingMockData?: boolean;
}> = ({ logs, services, usingMockData = false }) => {
  const stats = useMemo(() => {
    const totalLogs = logs.length;
    const errorCount = logs.filter(l => l.level === 'ERROR' || l.level === 'FATAL').length;
    const healthyServices = services.filter(s => s.status === 'healthy').length;
    const totalServices = services.length;

    return {
      totalLogs,
      errorCount,
      healthyServices,
      totalServices,
    };
  }, [logs, services]);

  const statCards = [
    {
      title: 'Total Logs',
      value: stats.totalLogs.toLocaleString(),
      icon: FileText,
      color: 'text-blue-600 bg-blue-100',
      trend: '+12%',
    },
    {
      title: 'Errors/Fatal',
      value: stats.errorCount.toLocaleString(),
      icon: AlertCircle,
      color: 'text-red-600 bg-red-100',
      trend: '-8%',
    },
    {
      title: 'Healthy Services',
      value: `${stats.healthyServices}/${stats.totalServices}`,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-100',
      trend: '100%',
    },
    {
      title: 'Current View',
      value: usingMockData ? 'Mock Data' : 'Live Data',
      icon: usingMockData ? Database : Activity,
      color: usingMockData ? 'text-amber-600 bg-amber-100' : 'text-purple-600 bg-purple-100',
      trend: usingMockData ? 'Fallback' : 'Real-time',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500">{card.trend}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Log Viewer Component
const LogViewer: React.FC<{
  logs: LogEntry[];
  services: ServiceHealth[];
  usingMockData?: boolean;
  onFilter?: (filters: LogFilters) => void;
}> = ({ logs, services, usingMockData = false, onFilter }) => {
  const [filters, setFilters] = useState<LogFilters>({});
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [liveFeed, setLiveFeed] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  const levelColors = {
    'FATAL': 'text-red-800 bg-red-200',
    'ERROR': 'text-red-600 bg-red-100',
    'WARN': 'text-amber-600 bg-amber-100',
    'INFO': 'text-blue-600 bg-blue-100',
    'DEBUG': 'text-gray-600 bg-gray-100',
  };

  // Live feed effect
  useEffect(() => {
    if (!liveFeed || usingMockData) return;

    const interval = setInterval(() => {
      // This will trigger a re-fetch from the parent component
      // In a real implementation, this would fetch new logs
      onFilter?.({ ...filters, refresh: Date.now() });
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [liveFeed, filters, onFilter, usingMockData]);

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
      // Date range filtering
      if (dateRange.start) {
        const logDate = new Date(log.timestamp);
        const startDate = new Date(dateRange.start);
        if (logDate < startDate) return false;
      }
      if (dateRange.end) {
        const logDate = new Date(log.timestamp);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999); // Include the entire end day
        if (logDate > endDate) return false;
      }
      return true;
    });
  }, [logs, filters, searchTerm, dateRange]);

  const uniqueServices = useMemo(() => {
    return Array.from(new Set(logs.map(log => log.service)));
  }, [logs]);

  // Close filters dropdown when clicking outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as Element;
    if (showFilters && !target.closest('.filter-dropdown')) {
      setShowFilters(false);
    }
  }, [showFilters]);

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <StatsOverview logs={logs} services={services} usingMockData={usingMockData} />

      {/* Log Viewer */}
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

          {/* Live Feed Toggle */}
          <button
            onClick={() => setLiveFeed(!liveFeed)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              liveFeed
                ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            {liveFeed ? (
              <>
                <Activity className="w-4 h-4 animate-pulse" />
                <span>Live</span>
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                <span>Live Feed</span>
              </>
            )}
          </button>

          <div className="relative filter-dropdown">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-4 space-y-4">
                  {/* Log Level Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Log Level</label>
                    <div className="space-y-2">
                      {['FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG'].map((level) => (
                        <label key={level} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.level?.includes(level) || false}
                            onChange={(e) => {
                              const currentLevels = filters.level || [];
                              const newLevels = e.target.checked
                                ? [...currentLevels, level]
                                : currentLevels.filter(l => l !== level);
                              const newFilters = { ...filters, level: newLevels.length > 0 ? newLevels : undefined };
                              setFilters(newFilters);
                              onFilter?.(newFilters);
                            }}
                            className="mr-2 rounded"
                          />
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                            levelColors[level as keyof typeof levelColors]
                          }`}>
                            {level}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Service Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {uniqueServices.map((service) => (
                        <label key={service} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.service?.includes(service) || false}
                            onChange={(e) => {
                              const currentServices = filters.service || [];
                              const newServices = e.target.checked
                                ? [...currentServices, service]
                                : currentServices.filter(s => s !== service);
                              const newFilters = { ...filters, service: newServices.length > 0 ? newServices : undefined };
                              setFilters(newFilters);
                              onFilter?.(newFilters);
                            }}
                            className="mr-2 rounded"
                          />
                          <span className="text-sm text-gray-700">{service}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <div className="space-y-2">
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Start date"
                      />
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="End date"
                      />
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  <div className="pt-2 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setFilters({});
                        setDateRange({ start: '', end: '' });
                        onFilter?.({});
                      }}
                      className="w-full text-sm text-gray-600 hover:text-gray-800 py-2"
                    >
                      Clear all filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium text-gray-900">{filteredLogs.length}</span> of <span className="font-medium text-gray-900">{logs.length}</span> logs
        </div>
        {liveFeed && (
          <div className="flex items-center gap-2 text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Live feed active</span>
          </div>
        )}
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
    </div>
  );
};


// Knowledge Graph Component
const KnowledgeGraph: React.FC<{
  entities: Entity[];
  relations: Relation[];
  onEntitySelect?: (entityId: string) => void;
}> = ({ entities, relations, onEntitySelect: _onEntitySelect }) => {
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

  const [nodes, _setNodes, onNodesChange] = useNodesState(initialNodes);
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
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Knowledge Graph</h2>
          <p className="text-sm text-gray-600">
            {entities.length} entities, {filteredNodes.length} visible
          </p>
        </div>
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
        ) : filteredNodes.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <GitBranch className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No entities match your filters</p>
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
            className="w-full h-full"
            minZoom={0.1}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          >
            <Background color="#f1f5f9" />
            <Controls />
            <MiniMap
              nodeStrokeColor="#374151"
              nodeColor="#9ca3af"
              nodeBorderRadius={2}
            />
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
  onServiceRefresh,
  onLogFilter,
  onEntitySelect,
  usingMockData = false,
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'services' | 'graph' | 'logs'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('dashboard-theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dashboard-theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const applySystemTheme = () => {
        document.documentElement.classList.toggle('dark', mediaQuery.matches);
      };

      applySystemTheme();
      mediaQuery.addEventListener('change', applySystemTheme);

      return () => mediaQuery.removeEventListener('change', applySystemTheme);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  const cycleTheme = () => {
    setTheme(current => {
      switch (current) {
        case 'light': return 'dark';
        case 'dark': return 'system';
        case 'system': return 'light';
        default: return 'light';
      }
    });
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      case 'system': return Monitor;
      default: return Monitor;
    }
  };

  const navigation = [
    { id: 'overview', name: 'Overview', icon: Home },
    { id: 'services', name: 'Services', icon: Server },
    { id: 'graph', name: 'Knowledge Graph', icon: GitBranch },
    { id: 'logs', name: 'Logs', icon: FileText },
  ];

  const stats = {
    totalServices: services.length,
    healthyServices: services.filter(s => s.status === 'healthy').length,
    totalEntities: entities.length,
    totalLogs: logs.length,
    errorLogs: logs.filter(l => l.level === 'ERROR' || l.level === 'FATAL').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">TKR Dashboard</h1>
            {usingMockData && (
               
              <span className="px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900 rounded-full border border-orange-200 dark:border-orange-800">
                Using Mock Data
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 lg:hidden transition-colors"
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
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 lg:hidden transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">
              {navigation.find(n => n.id === activeView)?.name}
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={cycleTheme}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                title={`Theme: ${theme} (click to cycle)`}
              >
                {React.createElement(getThemeIcon(), { className: "w-5 h-5" })}
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
                        (log.level === 'ERROR' || log.level === 'FATAL') && 'bg-red-500',
                        log.level === 'WARN' && 'bg-amber-500',
                        log.level === 'INFO' && 'bg-blue-500',
                        log.level === 'DEBUG' && 'bg-gray-500'
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
            <LogViewer logs={logs} services={services} usingMockData={usingMockData} onFilter={onLogFilter} />
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
      timestamp: new Date().toISOString(),
      level: 'INFO',
      service: 'API Gateway',
      component: 'RequestHandler',
      message: 'Successfully processed 1000 requests in the last minute',
    },
    {
      id: 'l2',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      level: 'WARN',
      service: 'Database Service',
      component: 'MemoryMonitor',
      message: 'High memory usage detected: 82% of available memory',
      metadata: { memory_usage: 82, threshold: 80 },
    },
    {
      id: 'l3',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      level: 'ERROR',
      service: 'Auth Service',
      component: 'AuthProvider',
      message: 'Failed to connect to authentication provider',
      stackTrace: 'Error: Connection timeout\n  at AuthProvider.connect()\n  at line 45',
    },
    {
      id: 'l4',
      timestamp: new Date(Date.now() - 180000).toISOString(),
      level: 'DEBUG',
      service: 'Cache Service',
      component: 'CacheManager',
      message: 'Cache hit ratio: 94.5%',
    },
    {
      id: 'l5',
      timestamp: new Date(Date.now() - 240000).toISOString(),
      level: 'INFO',
      service: 'API Gateway',
      component: 'HealthCheck',
      message: 'Health check completed successfully',
    },
  ];


  return (
    <Dashboard
      services={sampleServices}
      entities={sampleEntities}
      relations={sampleRelations}
      logs={sampleLogs}
      onServiceRefresh={(id) => console.log('Refresh service:', id)}
      onLogFilter={(filters) => console.log('Filter logs:', filters)}
      onEntitySelect={(id) => console.log('Select entity:', id)}
      usingMockData={true}
    />
  );
};

// App Component
function App() {
  return <DashboardDemo />;
}

export { Dashboard };
export default App;
