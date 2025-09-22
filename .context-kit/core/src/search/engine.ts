/**
 * Unified Search Engine
 * Pattern-aware search system that replaces FTS5 with comprehensive pattern matching
 */

import type { DatabaseConnection } from '../database/connection.js';
import type {
  SearchOptions,
  SearchResult,
  ParsedQuery,
  SearchEngineConfig,
  SearchStats,
  SearchQueryType
} from '../types/search.js';
import { QueryParser } from './parser.js';
import { Utils } from '../utils/index.js';
import { searchLogger as logger, timeOperation } from '../utils/logger.js';

export class UnifiedSearchEngine {
  private parser = new QueryParser();
  private stats: SearchStats = {
    totalQueries: 0,
    averageQueryTime: 0,
    cacheHitRate: 0,
    indexSize: 0,
    popularQueryTypes: {
      wildcard: 0,
      prefix: 0,
      suffix: 0,
      extension: 0,
      type: 0,
      fuzzy: 0,
      regex: 0,
      exact: 0,
      text: 0,
      contains: 0,
      path: 0,
      composite: 0,
      semantic: 0,
      structural: 0
    }
  };
  private config: Required<SearchEngineConfig>;

  constructor(
    private db: DatabaseConnection,
    config: SearchEngineConfig = {}
  ) {
    this.config = {
      maxResults: config.maxResults || 1000,
      defaultLimit: config.defaultLimit || 50,
      enableFuzzySearch: config.enableFuzzySearch ?? true,
      fuzzyThreshold: config.fuzzyThreshold || 0.3,
      enableRegexSearch: config.enableRegexSearch ?? true,
      regexTimeout: config.regexTimeout || 1000,
      indexSettings: config.indexSettings || {
        enableFullText: true,
        updateInterval: 30000
      },
      ...config
    };

    logger.info('Search engine initialized', { config: this.config });
  }

  /**
   * Main search method - handles all query patterns
   */
  search(query: string, options: SearchOptions = {}): SearchResult[] {
    const timer = timeOperation('search_query', logger);
    this.stats.totalQueries++;

    try {
      // Parse the query
      const parsedQuery = this.parser.parse(query);

      // Update pattern statistics
      this.updatePatternStats(parsedQuery.type);

      // Validate options
      const searchOptions = this.normalizeOptions(options);

      // Log the search
      logger.debug('Executing search', {
        query,
        parsedQuery,
        options: searchOptions
      });

      // Execute the appropriate search strategy
      const results = this.executeSearch(parsedQuery, searchOptions);

      // Record performance
      const duration = timer.finish({
        success: true,
        resultCount: results.length,
        pattern: parsedQuery.type
      });

      this.updatePerformanceStats(duration);

      // Log slow queries
      if (duration > 100) {
        logger.warn('Slow search query detected', {
          query,
          responseTime: duration,
          timestamp: Date.now()
        });
      }

      logger.logSearchQuery(query, results.length, duration);

      return results;
    } catch (error) {
      timer.finish({ success: false, error: error.message });
      logger.error('Search query failed', error, { query, options });
      throw error;
    }
  }

  /**
   * Execute search based on parsed query type
   */
  private executeSearch(parsedQuery: ParsedQuery, options: SearchOptions): SearchResult[] {
    switch (parsedQuery.type) {
      case 'wildcard':
        return this.searchAll(options);

      case 'prefix':
        return this.searchPrefix(parsedQuery.value, options);

      case 'suffix':
        return this.searchSuffix(parsedQuery.value, options);

      case 'contains':
        return this.searchContains(parsedQuery.value, options);

      case 'extension':
        return this.searchByExtension(parsedQuery.value, options);

      case 'type':
        return this.searchByType(parsedQuery.value, options);

      case 'exact':
        return this.searchExact(parsedQuery.value, options);

      case 'path':
        return this.searchByPath(parsedQuery.value, options);

      case 'fuzzy':
        if (!this.config.enableFuzzySearch) {
          throw new Error('Fuzzy search is disabled');
        }
        return this.searchFuzzy(parsedQuery.value, options);

      case 'regex':
        if (!this.config.enableRegexSearch) {
          throw new Error('Regex search is disabled');
        }
        const regexFlags = parsedQuery.modifiers?.find(m => m.regexFlags)?.regexFlags || '';
        return this.searchRegex(parsedQuery.value, options, regexFlags);

      case 'text':
        return this.searchText(parsedQuery.value, options);

      case 'composite':
        return this.searchComposite(parsedQuery, options);

      default:
        throw new Error(`Unsupported search pattern: ${parsedQuery.type}`);
    }
  }

  /**
   * Search all entities (wildcard)
   */
  private searchAll(options: SearchOptions): SearchResult[] {
    const stmt = this.db.statements.searchAll();
    return stmt.all(options.limit || this.config.defaultLimit) as SearchResult[];
  }

  /**
   * Prefix search (text*)
   */
  private searchPrefix(value: string, options: SearchOptions): SearchResult[] {
    const searchValue = options.caseSensitive ? value : value.toLowerCase();
    const stmt = this.db.statements.searchByPrefix();
    return stmt.all(
      searchValue + '%',
      options.limit || this.config.defaultLimit
    ) as SearchResult[];
  }

  /**
   * Suffix search (*text)
   */
  private searchSuffix(value: string, options: SearchOptions): SearchResult[] {
    const searchValue = options.caseSensitive ? value : value.toLowerCase();
    const stmt = this.db.statements.searchBySuffix();
    return stmt.all(
      '%' + searchValue,
      options.limit || this.config.defaultLimit
    ) as SearchResult[];
  }

  /**
   * Contains search (*text*)
   */
  private searchContains(value: string, options: SearchOptions): SearchResult[] {
    const searchValue = options.caseSensitive ? value : value.toLowerCase();
    const stmt = this.db.statements.searchFullText();
    return stmt.all(
      '%' + searchValue + '%',
      options.limit || this.config.defaultLimit
    ) as SearchResult[];
  }

  /**
   * Extension search (*.ext)
   */
  private searchByExtension(extension: string, options: SearchOptions): SearchResult[] {
    const stmt = this.db.statements.searchByExtension();
    return stmt.all(
      extension.toLowerCase(),
      options.limit || this.config.defaultLimit
    ) as SearchResult[];
  }

  /**
   * Type search (t:Type)
   */
  private searchByType(entityType: string, options: SearchOptions): SearchResult[] {
    const stmt = this.db.statements.searchByType();
    return stmt.all(
      entityType,
      options.limit || this.config.defaultLimit
    ) as SearchResult[];
  }

  /**
   * Exact match search ("exact")
   */
  private searchExact(value: string, options: SearchOptions): SearchResult[] {
    const searchValue = options.caseSensitive ? value : value.toLowerCase();
    const sql = `
      SELECT entity_id, original_name, entity_type, file_path
      FROM search_index
      WHERE ${options.caseSensitive ? 'original_name' : 'normalized_name'} = ?
      LIMIT ?
    `;
    return this.db.query(sql, [searchValue, options.limit || this.config.defaultLimit]);
  }

  /**
   * Path search (/path/*)
   */
  private searchByPath(pathPattern: string, options: SearchOptions): SearchResult[] {
    let sqlPattern: string;

    if (pathPattern.endsWith('*')) {
      // Prefix path search
      sqlPattern = pathPattern.slice(0, -1) + '%';
    } else if (pathPattern.startsWith('*')) {
      // Suffix path search
      sqlPattern = '%' + pathPattern.slice(1);
    } else if (pathPattern.includes('*')) {
      // Contains path search
      sqlPattern = pathPattern.replace(/\*/g, '%');
    } else {
      // Exact path search
      sqlPattern = pathPattern;
    }

    const sql = `
      SELECT entity_id, original_name, entity_type, file_path
      FROM search_index
      WHERE file_path LIKE ?
      ORDER BY file_path
      LIMIT ?
    `;
    return this.db.query(sql, [sqlPattern, options.limit || this.config.defaultLimit]);
  }

  /**
   * Fuzzy search (~fuzzy)
   */
  private searchFuzzy(value: string, options: SearchOptions): SearchResult[] {
    // Generate trigrams for the search value
    const queryTrigrams = Utils.generateTrigrams(value.toLowerCase());

    if (queryTrigrams.length === 0) {
      return [];
    }

    // Search using trigram similarity
    const sql = `
      SELECT
        entity_id,
        original_name,
        entity_type,
        file_path,
        (
          CASE
            WHEN trigrams IS NOT NULL THEN
              CAST(LENGTH(trigrams) - LENGTH(REPLACE(trigrams, ?, '')) AS REAL) / LENGTH(trigrams)
            ELSE 0
          END
        ) as similarity_score
      FROM search_index
      WHERE trigrams IS NOT NULL
      AND similarity_score >= ?
      ORDER BY similarity_score DESC, original_name
      LIMIT ?
    `;

    const trigramPattern = queryTrigrams.join(' ');
    return this.db.query(sql, [
      trigramPattern,
      this.config.fuzzyThreshold,
      options.limit || this.config.defaultLimit
    ]);
  }

  /**
   * Regular expression search (/pattern/)
   */
  private searchRegex(pattern: string, options: SearchOptions, flags?: string): SearchResult[] {
    // Get all potential matches first
    const sql = `
      SELECT entity_id, original_name, entity_type, file_path
      FROM search_index
      ORDER BY original_name
      LIMIT ?
    `;

    const candidates = this.db.query(sql, [options.limit || this.config.defaultLimit]);

    // Filter using regex (client-side for safety)
    try {
      const regex = new RegExp(pattern, flags || '');
      const results: SearchResult[] = [];

      for (const candidate of candidates) {
        if (regex.test(candidate.original_name)) {
          results.push(candidate);
        }

        // Limit results
        if (results.length >= (options.limit || this.config.defaultLimit)) {
          break;
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Invalid regex pattern: ${error.message}`);
    }
  }

  /**
   * Text search (general content search)
   */
  private searchText(value: string, options: SearchOptions): SearchResult[] {
    const searchValue = options.caseSensitive ? value : value.toLowerCase();

    const sql = `
      SELECT
        entity_id,
        original_name,
        entity_type,
        file_path,
        CASE
          WHEN normalized_name LIKE ? THEN 3  -- Exact prefix match
          WHEN normalized_name LIKE ? THEN 2  -- Contains match
          WHEN full_text LIKE ? THEN 1        -- Content match
          ELSE 0
        END as relevance_score
      FROM search_index
      WHERE normalized_name LIKE ?
         OR full_text LIKE ?
      ORDER BY relevance_score DESC, length(normalized_name), original_name
      LIMIT ?
    `;

    const prefixPattern = searchValue + '%';
    const containsPattern = '%' + searchValue + '%';

    return this.db.query(sql, [
      prefixPattern,     // For relevance scoring
      containsPattern,   // For relevance scoring
      containsPattern,   // For relevance scoring
      containsPattern,   // For WHERE clause
      containsPattern,   // For WHERE clause
      options.limit || this.config.defaultLimit
    ]);
  }

  /**
   * Composite search (multiple patterns)
   */
  private searchComposite(parsedQuery: ParsedQuery, options: SearchOptions): SearchResult[] {
    if (!parsedQuery.filters || parsedQuery.filters.length === 0) {
      return [];
    }

    // Start with first filter
    const firstFilter = parsedQuery.filters[0];
    let results = this.executeSearch({
      type: firstFilter.type as any,
      value: firstFilter.value,
      modifiers: [],
      raw: firstFilter.value
    }, { ...options, limit: this.config.maxResults });

    // Apply remaining filters as intersection
    for (let i = 1; i < parsedQuery.filters.length; i++) {
      const filter = parsedQuery.filters[i];
      const filterResults = this.executeSearch({
        type: filter.type as any,
        value: filter.value,
        modifiers: [],
        raw: filter.value
      }, { ...options, limit: this.config.maxResults });

      // Intersect results
      const filterIds = new Set(filterResults.map(r => r.entity_id));
      results = results.filter(r => filterIds.has(r.entity_id));
    }

    // Apply final limit
    return results.slice(0, options.limit || this.config.defaultLimit);
  }

  /**
   * Normalize search options
   */
  private normalizeOptions(options: SearchOptions): SearchOptions {
    return {
      limit: Math.min(options.limit || this.config.defaultLimit, this.config.maxResults),
      offset: options.offset || 0,
      caseSensitive: options.caseSensitive || false,
      includeRelations: options.includeRelations || false,
      scoreThreshold: options.scoreThreshold || 0,
      sortBy: options.sortBy || 'relevance',
      sortOrder: options.sortOrder || 'desc'
    };
  }

  /**
   * Update pattern usage statistics
   */
  private updatePatternStats(pattern: string): void {
    if (pattern in this.stats.popularQueryTypes) {
      this.stats.popularQueryTypes[pattern as SearchQueryType] =
        (this.stats.popularQueryTypes[pattern as SearchQueryType] || 0) + 1;
    }
  }

  /**
   * Update performance statistics
   */
  private updatePerformanceStats(duration: number): void {
    const totalTime = this.stats.averageQueryTime * (this.stats.totalQueries - 1) + duration;
    this.stats.averageQueryTime = totalTime / this.stats.totalQueries;
  }

  /**
   * Get search engine statistics
   */
  getStats(): SearchStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalQueries: 0,
      averageQueryTime: 0,
      cacheHitRate: 0,
      indexSize: 0,
      popularQueryTypes: {
        wildcard: 0,
        prefix: 0,
        suffix: 0,
        extension: 0,
        type: 0,
        fuzzy: 0,
        regex: 0,
        exact: 0,
        text: 0,
        contains: 0,
        path: 0,
        composite: 0,
        semantic: 0,
        structural: 0
      }
    };
  }

  /**
   * Get information about a query before executing it
   */
  explainQuery(query: string): {
    parsedQuery: ParsedQuery;
    patternInfo: ReturnType<QueryParser['getPatternInfo']>;
    estimatedResults: string;
  } {
    const parsedQuery = this.parser.parse(query);
    const patternInfo = this.parser.getPatternInfo(parsedQuery);

    return {
      parsedQuery,
      patternInfo,
      estimatedResults: patternInfo.expectedResults
    };
  }
}