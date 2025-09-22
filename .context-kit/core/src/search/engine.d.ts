/**
 * Unified Search Engine
 * Pattern-aware search system that replaces FTS5 with comprehensive pattern matching
 */
import type { DatabaseConnection } from '../database/connection.js';
import type { SearchOptions, SearchResult, ParsedQuery, SearchEngineConfig, SearchStats } from '../types/search.js';
import { QueryParser } from './parser.js';
export declare class UnifiedSearchEngine {
    private db;
    private parser;
    private stats;
    private config;
    constructor(db: DatabaseConnection, config?: SearchEngineConfig);
    /**
     * Main search method - handles all query patterns
     */
    search(query: string, options?: SearchOptions): SearchResult[];
    /**
     * Execute search based on parsed query type
     */
    private executeSearch;
    /**
     * Search all entities (wildcard)
     */
    private searchAll;
    /**
     * Prefix search (text*)
     */
    private searchPrefix;
    /**
     * Suffix search (*text)
     */
    private searchSuffix;
    /**
     * Contains search (*text*)
     */
    private searchContains;
    /**
     * Extension search (*.ext)
     */
    private searchByExtension;
    /**
     * Type search (t:Type)
     */
    private searchByType;
    /**
     * Exact match search ("exact")
     */
    private searchExact;
    /**
     * Path search (/path/*)
     */
    private searchByPath;
    /**
     * Fuzzy search (~fuzzy)
     */
    private searchFuzzy;
    /**
     * Regular expression search (/pattern/)
     */
    private searchRegex;
    /**
     * Text search (general content search)
     */
    private searchText;
    /**
     * Composite search (multiple patterns)
     */
    private searchComposite;
    /**
     * Normalize search options
     */
    private normalizeOptions;
    /**
     * Update pattern usage statistics
     */
    private updatePatternStats;
    /**
     * Update performance statistics
     */
    private updatePerformanceStats;
    /**
     * Get search engine statistics
     */
    getStats(): SearchStats;
    /**
     * Reset statistics
     */
    resetStats(): void;
    /**
     * Get information about a query before executing it
     */
    explainQuery(query: string): {
        parsedQuery: ParsedQuery;
        patternInfo: ReturnType<QueryParser['getPatternInfo']>;
        estimatedResults: string;
    };
}
//# sourceMappingURL=engine.d.ts.map