/**
 * Search System Types
 * Defines all interfaces for the pattern-aware search engine
 */
export interface SearchOptions {
    limit?: number;
    offset?: number;
    caseSensitive?: boolean;
    includeRelations?: boolean;
    scoreThreshold?: number;
    sortBy?: 'relevance' | 'name' | 'type' | 'date';
    sortOrder?: 'asc' | 'desc';
}
export interface SearchResult {
    entity_id: string;
    original_name: string;
    entity_type: string;
    file_path?: string;
    score?: number;
    snippet?: string;
    matches?: SearchMatch[];
}
export interface SearchMatch {
    field: 'name' | 'type' | 'path' | 'content';
    value: string;
    positions: number[];
}
export type SearchPatternType = 'wildcard' | 'prefix' | 'suffix' | 'contains' | 'extension' | 'path' | 'type' | 'fuzzy' | 'regex' | 'exact' | 'text' | 'composite';
export interface ParsedQuery {
    type: SearchPatternType;
    value: string;
    modifiers?: {
        caseSensitive?: boolean;
        limit?: number;
        scoreThreshold?: number;
        regexFlags?: string;
    };
    filters?: ParsedQueryFilter[];
}
export interface ParsedQueryFilter {
    type: 'type' | 'extension' | 'path' | 'tag';
    value: string;
    operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith';
}
export interface SearchIndexEntry {
    entity_id: string;
    original_name: string;
    normalized_name: string;
    name_tokens: string;
    file_path?: string;
    file_extension?: string;
    entity_type: string;
    tags?: string;
    full_text: string;
    trigrams: string;
    created_at: number;
    updated_at: number;
}
export interface SearchEngineConfig {
    maxResults?: number;
    defaultLimit?: number;
    enableFuzzySearch?: boolean;
    fuzzyThreshold?: number;
    enableRegexSearch?: boolean;
    regexTimeout?: number;
}
export interface SearchStats {
    totalQueries: number;
    averageResponseTime: number;
    popularPatterns: Record<string, number>;
    slowQueries: Array<{
        query: string;
        responseTime: number;
        timestamp: number;
    }>;
}
//# sourceMappingURL=search.d.ts.map