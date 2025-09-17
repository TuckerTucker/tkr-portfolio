import { ViewType, ServiceHealth } from '../../types/common';
import { StatusBadge } from '@components/ui';

export interface HeaderProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  serviceHealth: ServiceHealth[];
}

export function Header({ currentView, onViewChange, serviceHealth }: HeaderProps) {
  const navigation = [
    { id: 'overview' as ViewType, label: 'Overview', icon: '📊' },
    { id: 'knowledge-graph' as ViewType, label: 'Knowledge Graph', icon: '🕸️' },
    { id: 'logs' as ViewType, label: 'Logs', icon: '📝' },
    { id: 'mcp-tools' as ViewType, label: 'MCP Tools', icon: '🔧' },
    { id: 'health' as ViewType, label: 'Health', icon: '❤️' }
  ];

  const overallStatus = serviceHealth.length > 0 
    ? serviceHealth.every(s => s.status === 'healthy') 
      ? 'healthy'
      : serviceHealth.some(s => s.status === 'critical' || s.status === 'offline')
        ? 'critical'
        : 'degraded'
    : 'offline';

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold text-gray-900">
              tkr-context-kit Dashboard
            </h1>
            <StatusBadge status={overallStatus} />
          </div>
          
          <nav className="flex space-x-1">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${currentView === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <span className="text-base" role="img" aria-label={item.label}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Services: {serviceHealth.filter(s => s.status === 'healthy').length}/{serviceHealth.length}
          </div>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </header>
  );
}