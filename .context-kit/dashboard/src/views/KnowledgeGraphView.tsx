import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@components/ui';
import { SearchAndFilter, LoadingSpinner, ErrorMessage } from '@components/common';
import { KnowledgeGraphService, Entity, Relation, KnowledgeGraphStats } from '../services';

interface KnowledgeGraphViewProps {
  service: KnowledgeGraphService;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({ service }) => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [stats, setStats] = useState<KnowledgeGraphStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    loadData();
  }, [service]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [entitiesResponse, relationsResponse, statsResponse] = await Promise.all([
        service.getEntities(),
        service.getRelations(),
        service.getStats(),
      ]);

      if (entitiesResponse.success) {
        setEntities(entitiesResponse.data || []);
      } else {
        throw new Error(entitiesResponse.error || 'Failed to fetch entities');
      }

      if (relationsResponse.success) {
        setRelations(relationsResponse.data || []);
      } else {
        throw new Error(relationsResponse.error || 'Failed to fetch relations');
      }

      if (statsResponse.success) {
        setStats(statsResponse.data || null);
      } else {
        console.warn('Failed to fetch stats:', statsResponse.error);
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

  const handleFilter = (type: string) => {
    setSelectedType(type);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('');
  };

  const filteredEntities = entities.filter(entity => {
    const matchesSearch = !searchQuery || 
      entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entity.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !selectedType || entity.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const entityTypes = [...new Set(entities.map(e => e.type))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" message="Loading knowledge graph..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to Load Knowledge Graph"
        message={error}
        onRetry={loadData}
        className="m-6"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Knowledge Graph</h2>
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
              <div className="text-2xl font-bold text-blue-600">{stats.totalEntities}</div>
              <div className="text-sm text-gray-600">Total Entities</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.totalRelations}</div>
              <div className="text-sm text-gray-600">Total Relations</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(stats.entityTypes).length}
              </div>
              <div className="text-sm text-gray-600">Entity Types</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {Object.keys(stats.relationTypes).length}
              </div>
              <div className="text-sm text-gray-600">Relation Types</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter */}
      <SearchAndFilter
        onSearch={handleSearch}
        onFilter={handleFilter}
        onClearFilters={handleClearFilters}
        filterTypes={entityTypes}
        totalItems={entities.length}
        filteredItems={filteredEntities.length}
        searchPlaceholder="Search entities..."
        filterLabel="Entity Type"
      />

      {/* Entities List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Entities</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEntities.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No entities found matching your criteria
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredEntities.map(entity => (
                  <div
                    key={entity.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            {entity.type}
                          </span>
                          <h4 className="font-medium text-gray-900">{entity.name}</h4>
                        </div>
                        {entity.data.description && (
                          <p className="mt-2 text-sm text-gray-600">{entity.data.description}</p>
                        )}
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <span>ID: {entity.id}</span>
                          <span>Version: {entity.version}</span>
                          <span>Updated: {new Date(entity.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <span className="text-lg">⋯</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Relations Summary */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Relations</h3>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 mb-4">
            {relations.length} relationships between entities
          </div>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.relationTypes).map(([type, count]) => (
                <div key={type} className="border border-gray-200 rounded p-3 text-center">
                  <div className="font-medium text-gray-900">{count}</div>
                  <div className="text-xs text-gray-600 capitalize">{type as string}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};