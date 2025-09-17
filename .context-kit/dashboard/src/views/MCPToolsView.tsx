import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@components/ui';
import { SearchAndFilter, LoadingSpinner, ErrorMessage } from '@components/common';
import { MCPToolsService, MCPTool, MCPToolCategory, MCPStats, MCPToolExecution } from '../services';

interface MCPToolsViewProps {
  service: MCPToolsService;
}

export const MCPToolsView: React.FC<MCPToolsViewProps> = ({ service }) => {
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [categories, setCategories] = useState<MCPToolCategory[]>([]);
  const [stats, setStats] = useState<MCPStats | null>(null);
  const [executions, setExecutions] = useState<MCPToolExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);

  useEffect(() => {
    loadData();
  }, [service]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [toolsResponse, categoriesResponse, statsResponse, executionsResponse] = await Promise.all([
        service.getTools(),
        service.getToolCategories(),
        service.getStats(),
        service.getExecutionHistory(10),
      ]);

      if (toolsResponse.success) {
        setTools(toolsResponse.data || []);
      } else {
        throw new Error(toolsResponse.error || 'Failed to fetch tools');
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data || []);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data || null);
      }

      if (executionsResponse.success) {
        setExecutions(executionsResponse.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (category: string) => {
    setSelectedCategory(category);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
  };

  const handleToolSelect = (tool: MCPTool) => {
    setSelectedTool(tool);
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = !searchQuery || 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || tool.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categoryNames = [...new Set(tools.map(t => t.category))];

  const getExecutionStatusColor = (status: string) => {
    const colors = {
      'success': 'bg-green-100 text-green-800',
      'error': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" message="Loading MCP tools..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to Load MCP Tools"
        message={error}
        onRetry={loadData}
        className="m-6"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">MCP Tools</h2>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.totalTools}</div>
              <div className="text-sm text-gray-600">Total Tools</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(stats.categories).length}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {stats.recentExecutions.filter(e => e.status === 'success').length}
              </div>
              <div className="text-sm text-gray-600">Recent Successes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {stats.mostUsedTools[0]?.name || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Most Used Tool</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Categories Overview */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Tool Categories</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map(category => (
              <div key={category.name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  {category.icon && <span className="text-xl">{category.icon}</span>}
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                <div className="text-sm text-gray-500">
                  {category.tools.length} tools available
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <SearchAndFilter
        onSearch={handleSearch}
        onFilter={handleFilter}
        onClearFilters={handleClearFilters}
        filterTypes={categoryNames}
        totalItems={tools.length}
        filteredItems={filteredTools.length}
        searchPlaceholder="Search tools..."
        filterLabel="Category"
      />

      {/* Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Available Tools</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredTools.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No tools found matching your criteria
                </div>
              ) : (
                filteredTools.map(tool => (
                  <div
                    key={tool.name}
                    className={`border border-gray-200 rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedTool?.name === tool.name 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleToolSelect(tool)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                            {tool.category}
                          </span>
                          <h4 className="font-medium text-gray-900">{tool.name}</h4>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{tool.description}</p>
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          {tool.usageCount !== undefined && (
                            <span>Used {tool.usageCount} times</span>
                          )}
                          {tool.lastUsed && (
                            <span>Last used: {new Date(tool.lastUsed).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tool Details */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Tool Details</h3>
          </CardHeader>
          <CardContent>
            {selectedTool ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{selectedTool.name}</h4>
                  <p className="text-sm text-gray-600">{selectedTool.description}</p>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Input Schema</h5>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedTool.inputSchema, null, 2)}
                  </pre>
                </div>

                {selectedTool.examples && selectedTool.examples.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Examples</h5>
                    {selectedTool.examples.map((example, index) => (
                      <pre key={index} className="text-xs bg-gray-100 p-2 rounded mb-2 overflow-x-auto">
                        {example}
                      </pre>
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-2">
                  <button className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                    Execute Tool
                  </button>
                  <button className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors">
                    View Documentation
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Select a tool to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Executions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Recent Executions</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {executions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No recent executions
              </div>
            ) : (
              executions.map(execution => (
                <div
                  key={execution.id}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-start space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getExecutionStatusColor(execution.status)}`}>
                      {execution.status}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                        <span className="font-medium">{execution.toolName}</span>
                        <span>• {new Date(execution.timestamp).toLocaleString()}</span>
                        {execution.duration && (
                          <span>• {Math.round(execution.duration)}ms</span>
                        )}
                      </div>
                      {execution.error && (
                        <div className="text-sm text-red-600 mb-2">{execution.error}</div>
                      )}
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">
                          View execution details
                        </summary>
                        <div className="mt-2 space-y-2">
                          <div>
                            <div className="text-xs font-medium text-gray-700 mb-1">Input:</div>
                            <pre className="text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-x-auto">
                              {JSON.stringify(execution.input, null, 2)}
                            </pre>
                          </div>
                          {execution.output && (
                            <div>
                              <div className="text-xs font-medium text-gray-700 mb-1">Output:</div>
                              <pre className="text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-x-auto">
                                {JSON.stringify(execution.output, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </details>
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