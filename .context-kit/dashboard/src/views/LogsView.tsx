import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@components/ui';
import { FilterControls, LoadingSpinner, ErrorMessage } from '@components/common';
import { LoggingService, LogEntry, LogStats, ServiceHealthInfo } from '../services';

interface LogsViewProps {
  service: LoggingService;
}

export const LogsView: React.FC<LogsViewProps> = ({ service }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [serviceHealth, setServiceHealth] = useState<ServiceHealthInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedService, setSelectedService] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [timeWindow, setTimeWindow] = useState(3600);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadData();
  }, [service, selectedService, selectedLevel, timeWindow]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, selectedService, selectedLevel, timeWindow]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [logsResponse, statsResponse, healthResponse] = await Promise.all([
        service.getLogs({
          service: selectedService || undefined,
          level: selectedLevel || undefined,
          timeWindow,
          limit: 100,
        }),
        service.getLogStats(),
        service.getServiceHealth(),
      ]);

      if (logsResponse.success) {
        setLogs(logsResponse.data || []);
      } else {
        throw new Error(logsResponse.error || 'Failed to fetch logs');
      }

      if (statsResponse.success) {
        setStats(statsResponse.data || null);
      }

      if (healthResponse.success) {
        setServiceHealth(healthResponse.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getLogLevelColor = (level: string) => {
    const colors = {
      'FATAL': 'bg-red-100 text-red-800',
      'ERROR': 'bg-red-100 text-red-800',
      'WARN': 'bg-yellow-100 text-yellow-800',
      'INFO': 'bg-blue-100 text-blue-800',
      'DEBUG': 'bg-gray-100 text-gray-800',
    };
    return colors[level as keyof typeof colors] || colors.DEBUG;
  };

  const getServiceStatusColor = (status: string) => {
    const colors = {
      'healthy': 'bg-green-100 text-green-800',
      'degraded': 'bg-yellow-100 text-yellow-800',
      'critical': 'bg-red-100 text-red-800',
      'offline': 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || colors.offline;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const filterOptions = {
    service: {
      value: selectedService,
      onChange: setSelectedService,
      options: [
        { value: '', label: 'All Services' },
        ...serviceHealth.map(s => ({ value: s.service, label: s.service })),
      ],
      label: 'Service',
    },
    level: {
      value: selectedLevel,
      onChange: setSelectedLevel,
      options: [
        { value: '', label: 'All Levels' },
        { value: 'FATAL', label: 'Fatal' },
        { value: 'ERROR', label: 'Error' },
        { value: 'WARN', label: 'Warning' },
        { value: 'INFO', label: 'Info' },
        { value: 'DEBUG', label: 'Debug' },
      ],
      label: 'Level',
    },
    timeWindow: {
      value: timeWindow.toString(),
      onChange: (value: string) => setTimeWindow(Number(value)),
      options: [
        { value: '300', label: '5 minutes' },
        { value: '900', label: '15 minutes' },
        { value: '3600', label: '1 hour' },
        { value: '21600', label: '6 hours' },
        { value: '86400', label: '24 hours' },
      ],
      label: 'Time Window',
    },
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" message="Loading logs..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to Load Logs"
        message={error}
        onRetry={loadData}
        className="m-6"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">System Logs</h2>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Auto-refresh</span>
          </label>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.totalLogs}</div>
              <div className="text-sm text-gray-600">Total Logs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.errorCount}</div>
              <div className="text-sm text-gray-600">Errors</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {serviceHealth.filter(s => s.status === 'healthy').length}
              </div>
              <div className="text-sm text-gray-600">Healthy Services</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{logs.length}</div>
              <div className="text-sm text-gray-600">Current View</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Service Health */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Service Health</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {serviceHealth.map(service => (
              <div key={service.service} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{service.service}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getServiceStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Logs: {service.logCount}</div>
                  <div>Error Rate: {(service.errorRate * 100).toFixed(1)}%</div>
                  <div>Last Log: {new Date(service.lastLog).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <FilterControls filters={filterOptions} />
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Log Entries</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No logs found matching your criteria
              </div>
            ) : (
              logs.map(log => (
                <div
                  key={log.id}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getLogLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                        <span className="font-medium">{log.service}</span>
                        {log.component && <span>• {log.component}</span>}
                        <span>• {formatTimestamp(log.timestamp)}</span>
                      </div>
                      <div className="text-gray-900">{log.message}</div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer">
                            View metadata
                          </summary>
                          <pre className="mt-1 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};