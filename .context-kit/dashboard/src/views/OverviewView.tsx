import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, StatusBadge } from '@components/ui';
import { LoadingSpinner, ErrorMessage } from '@components/common';
import { 
  ServiceRegistry,
  HealthStatus 
} from '../services';

interface OverviewViewProps {
  serviceRegistry: ServiceRegistry;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ serviceRegistry }) => {
  const [healthStatuses, setHealthStatuses] = useState<HealthStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHealthData();
    
    // Auto-refresh health status every 30 seconds
    const interval = setInterval(loadHealthData, 30000);
    return () => clearInterval(interval);
  }, [serviceRegistry]);

  const loadHealthData = async () => {
    setLoading(true);
    setError(null);

    try {
      const healthResults = await serviceRegistry.checkAllHealth();
      const healthList = Array.from(healthResults.values());
      setHealthStatuses(healthList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check service health');
    } finally {
      setLoading(false);
    }
  };

  const getOverallStatus = () => {
    if (healthStatuses.length === 0) return 'offline';
    
    const hasOffline = healthStatuses.some(h => h.status === 'offline');
    const hasCritical = healthStatuses.some(h => h.status === 'critical');
    const hasDegraded = healthStatuses.some(h => h.status === 'degraded');
    
    if (hasOffline || hasCritical) return 'critical';
    if (hasDegraded) return 'degraded';
    return 'healthy';
  };

  const getStatusCounts = () => {
    const counts = {
      healthy: 0,
      degraded: 0,
      critical: 0,
      offline: 0,
    };

    healthStatuses.forEach(status => {
      counts[status.status as keyof typeof counts] = (counts[status.status as keyof typeof counts] || 0) + 1;
    });

    return counts;
  };

  const getServiceIcon = (serviceName: string) => {
    const icons = {
      'Knowledge Graph': '🕸️',
      'Logging Service': '📝',
      'MCP Tools': '🔧',
    };
    return icons[serviceName as keyof typeof icons] || '⚙️';
  };

  if (loading && healthStatuses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" message="Loading system status..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to Load System Overview"
        message={error}
        onRetry={loadHealthData}
        className="m-6"
      />
    );
  }

  const overallStatus = getOverallStatus();
  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-semibold text-gray-900">System Overview</h2>
          <StatusBadge status={overallStatus} />
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <button
            onClick={loadHealthData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{statusCounts.healthy}</div>
            <div className="text-sm text-gray-600">Healthy Services</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.degraded}</div>
            <div className="text-sm text-gray-600">Degraded Services</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{statusCounts.critical}</div>
            <div className="text-sm text-gray-600">Critical Services</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{statusCounts.offline}</div>
            <div className="text-sm text-gray-600">Offline Services</div>
          </CardContent>
        </Card>
      </div>

      {/* Service Details */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Service Status</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {healthStatuses.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No services configured
              </div>
            ) : (
              healthStatuses.map(status => (
                <div
                  key={status.service}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getServiceIcon(status.service)}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{status.service}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span>Last checked: {new Date(status.lastChecked).toLocaleTimeString()}</span>
                          {status.responseTime && (
                            <span>Response: {Math.round(status.responseTime)}ms</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={status.status} />
                  </div>

                  {status.details && Object.keys(status.details).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <details>
                        <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                          View details
                        </summary>
                        <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(status.details, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Quick Actions</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-lg mb-2">🕸️</div>
              <div className="font-medium text-gray-900">View Knowledge Graph</div>
              <div className="text-sm text-gray-600">Explore entities and relationships</div>
            </button>
            <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-lg mb-2">📝</div>
              <div className="font-medium text-gray-900">Check Logs</div>
              <div className="text-sm text-gray-600">Review system logs and errors</div>
            </button>
            <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-lg mb-2">🔧</div>
              <div className="font-medium text-gray-900">Browse MCP Tools</div>
              <div className="text-sm text-gray-600">Available tools and executions</div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">System Information</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Configured Services</h4>
              <div className="space-y-2">
                {serviceRegistry.getServiceNames().map((serviceName: string) => {
                  const config = serviceRegistry.getConfig(serviceName);
                  return (
                    <div key={serviceName} className="text-sm">
                      <span className="font-medium">{config?.name || serviceName}</span>
                      <span className="text-gray-600 ml-2">
                        ({config?.baseUrl || 'No URL configured'})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Dashboard Info</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Version:</span>
                  <span className="text-gray-600 ml-2">1.0.0</span>
                </div>
                <div>
                  <span className="font-medium">Started:</span>
                  <span className="text-gray-600 ml-2">
                    {new Date().toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Uptime:</span>
                  <span className="text-gray-600 ml-2">
                    {Math.floor((Date.now() - performance.timeOrigin) / 1000 / 60)} minutes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};