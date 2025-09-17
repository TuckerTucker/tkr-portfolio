import { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { 
  OverviewView, 
  KnowledgeGraphView, 
  LogsView, 
  MCPToolsView 
} from './views';
import { 
  ServiceRegistry,
  KnowledgeGraphService,
  LoggingService,
  MCPToolsService,
  type HealthStatus
} from './services';
import { ViewType, ServiceHealth } from './types/common';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [serviceRegistry] = useState(() => new ServiceRegistry());
  const [services, setServices] = useState<{
    knowledgeGraph: KnowledgeGraphService | null;
    logging: LoggingService | null;
    mcpTools: MCPToolsService | null;
  }>({
    knowledgeGraph: null,
    logging: null,
    mcpTools: null,
  });
  const [serviceHealth, setServiceHealth] = useState<ServiceHealth[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeServices();
  }, []);

  useEffect(() => {
    // Handle URL hash-based routing
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as ViewType;
      if (['overview', 'knowledge-graph', 'logs', 'mcp-tools'].includes(hash)) {
        setCurrentView(hash);
      }
    };

    // Set initial view from URL hash
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    // Update URL hash when view changes
    const hash = currentView === 'overview' ? '' : `#${currentView}`;
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', window.location.pathname + hash);
    }
  }, [currentView]);

  const initializeServices = async () => {
    try {
      // Create service instances
      const knowledgeGraphConfig = serviceRegistry.getConfig('knowledge-graph');
      const loggingConfig = serviceRegistry.getConfig('logging');
      const mcpToolsConfig = serviceRegistry.getConfig('mcp-tools');

      const knowledgeGraphService = knowledgeGraphConfig 
        ? new KnowledgeGraphService(knowledgeGraphConfig)
        : null;
        
      const loggingService = loggingConfig 
        ? new LoggingService(loggingConfig)
        : null;
        
      const mcpToolsService = mcpToolsConfig 
        ? new MCPToolsService(mcpToolsConfig)
        : null;

      // Register services
      if (knowledgeGraphService) {
        serviceRegistry.registerService('knowledge-graph', knowledgeGraphService);
      }
      if (loggingService) {
        serviceRegistry.registerService('logging', loggingService);
      }
      if (mcpToolsService) {
        serviceRegistry.registerService('mcp-tools', mcpToolsService);
      }

      // Initialize services
      const initResults = await serviceRegistry.initializeAll();
      console.log('Service initialization results:', initResults);

      // Set service state
      setServices({
        knowledgeGraph: knowledgeGraphService,
        logging: loggingService,
        mcpTools: mcpToolsService,
      });

      setIsInitialized(true);
      
      // Start health monitoring
      startHealthMonitoring();
    } catch (error) {
      console.error('Failed to initialize services:', error);
      setIsInitialized(true); // Still show UI even if services fail
    }
  };

  const startHealthMonitoring = async () => {
    const updateHealth = async () => {
      try {
        const healthResults = await serviceRegistry.checkAllHealth();
        const healthArray: ServiceHealth[] = Array.from(healthResults.values()).map((health: HealthStatus) => ({
          service: health.service,
          status: health.status,
          lastChecked: health.lastChecked,
          responseTime: health.responseTime,
          details: health.details,
        }));
        setServiceHealth(healthArray);
      } catch (error) {
        console.error('Health check failed:', error);
      }
    };

    // Initial health check
    updateHealth();
    
    // Set up periodic health checks
    const interval = setInterval(updateHealth, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return <OverviewView serviceRegistry={serviceRegistry} />;
      
      case 'knowledge-graph':
        if (!services.knowledgeGraph) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-gray-500">
                <p>Knowledge Graph service is not available</p>
                <p className="text-sm mt-2">Please check your configuration</p>
              </div>
            </div>
          );
        }
        return <KnowledgeGraphView service={services.knowledgeGraph} />;
      
      case 'logs':
        if (!services.logging) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-gray-500">
                <p>Logging service is not available</p>
                <p className="text-sm mt-2">Please check your configuration</p>
              </div>
            </div>
          );
        }
        return <LogsView service={services.logging} />;
      
      case 'mcp-tools':
        if (!services.mcpTools) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-gray-500">
                <p>MCP Tools service is not available</p>
                <p className="text-sm mt-2">Please check your configuration</p>
              </div>
            </div>
          );
        }
        return <MCPToolsView service={services.mcpTools} />;
      
      default:
        return <OverviewView serviceRegistry={serviceRegistry} />;
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing tkr-context-kit Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout
      currentView={currentView}
      onViewChange={handleViewChange}
      serviceHealth={serviceHealth}
    >
      {renderCurrentView()}
    </Layout>
  );
}

export default App;