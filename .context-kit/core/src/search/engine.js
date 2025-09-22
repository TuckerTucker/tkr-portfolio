/**
 * Unified Search Engine
 * Pattern-aware search system that replaces FTS5 with comprehensive pattern matching
 */
import { QueryParser } from './parser.js';
import { Utils } from '../utils/index.js';
import { searchLogger as logger, timeOperation } from '../utils/logger.js';
export class UnifiedSearchEngine {
    db;
    parser = new QueryParser();
    stats = {
        totalQueries: 0,
        averageResponseTime: 0,
        popularPatterns: {},
        slowQueries: []
    };
    config;
    constructor(db, config = {}) {
        this.db = db;
        this.config = {
            maxResults: config.maxResults || 1000,
            defaultLimit: config.defaultLimit || 50,
            enableFuzzySearch: config.enableFuzzySearch ?? true,
            fuzzyThreshold: config.fuzzyThreshold || 0.3,
            enableRegexSearch: config.enableRegexSearch ?? true,
            regexTimeout: config.regexTimeout || 1000
        };
        logger.info('Search engine initialized', { config: this.config });
    }
    /**
     * Main search method - handles all query patterns
     */
    search(query, options = {}) {
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
                this.stats.slowQueries.push({
                    query,
                    responseTime: duration,
                    timestamp: Date.now()
                });
                // Keep only last 10 slow queries
                if (this.stats.slowQueries.length > 10) {
                    this.stats.slowQueries = this.stats.slowQueries.slice(-10);
                }
            }
            logger.logSearchQuery(query, results.length, duration);
            return results;
        }
        catch (error) {
            timer.finish({ success: false, error: error.message });
            logger.error('Search query failed', error, { query, options });
            throw error;
        }
    }
    /**
     * Execute search based on parsed query type
     */
    executeSearch(parsedQuery, options) {
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
                return this.searchRegex(parsedQuery.value, options, parsedQuery.modifiers?.regexFlags);
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
    searchAll(options) {
        const stmt = this.db.statements.searchAll();
        return stmt.all(options.limit || this.config.defaultLimit);
    }
    /**
     * Prefix search (text*)
     */
    searchPrefix(value, options) {
        const searchValue = options.caseSensitive ? value : value.toLowerCase();
        const stmt = this.db.statements.searchByPrefix();
        return stmt.all(searchValue + '%', options.limit || this.config.defaultLimit);
    }
    /**
     * Suffix search (*text)
     */
    searchSuffix(value, options) {
        const searchValue = options.caseSensitive ? value : value.toLowerCase();
        const stmt = this.db.statements.searchBySuffix();
        return stmt.all('%' + searchValue, options.limit || this.config.defaultLimit);
    }
    /**
     * Contains search (*text*)
     */
    searchContains(value, options) {
        const searchValue = options.caseSensitive ? value : value.toLowerCase();
        const stmt = this.db.statements.searchFullText();
        return stmt.all('%' + searchValue + '%', options.limit || this.config.defaultLimit);
    }
    /**
     * Extension search (*.ext)
     */
    searchByExtension(extension, options) {
        const stmt = this.db.statements.searchByExtension();
        return stmt.all(extension.toLowerCase(), options.limit || this.config.defaultLimit);
    }
    /**
     * Type search (t:Type)
     */
    searchByType(entityType, options) {
        const stmt = this.db.statements.searchByType();
        return stmt.all(entityType, options.limit || this.config.defaultLimit);
    }
    /**
     * Exact match search ("exact")
     */
    searchExact(value, options) {
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
    searchByPath(pathPattern, options) {
        let sqlPattern;
        if (pathPattern.endsWith('*')) {
            // Prefix path search
            sqlPattern = pathPattern.slice(0, -1) + '%';
        }
        else if (pathPattern.startsWith('*')) {
            // Suffix path search
            sqlPattern = '%' + pathPattern.slice(1);
        }
        else if (pathPattern.includes('*')) {
            // Contains path search
            sqlPattern = pathPattern.replace(/\*/g, '%');
        }
        else {
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
    searchFuzzy(value, options) {
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
    searchRegex(pattern, options, flags) {
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
            const results = [];
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
        }
        catch (error) {
            throw new Error(`Invalid regex pattern: ${error.message}`);
        }
    }
    /**
     * Text search (general content search)
     */
    searchText(value, options) {
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
            prefixPattern, // For relevance scoring
            containsPattern, // For relevance scoring
            containsPattern, // For relevance scoring
            containsPattern, // For WHERE clause
            containsPattern, // For WHERE clause
            options.limit || this.config.defaultLimit
        ]);
    }
    /**
     * Composite search (multiple patterns)
     */
    searchComposite(parsedQuery, options) {
        if (!parsedQuery.filters || parsedQuery.filters.length === 0) {
            return [];
        }
        // Start with first filter
        const firstFilter = parsedQuery.filters[0];
        let results = this.executeSearch({
            type: firstFilter.type,
            value: firstFilter.value
        }, { ...options, limit: this.config.maxResults });
        // Apply remaining filters as intersection
        for (let i = 1; i < parsedQuery.filters.length; i++) {
            const filter = parsedQuery.filters[i];
            const filterResults = this.executeSearch({
                type: filter.type,
                value: filter.value
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
    normalizeOptions(options) {
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
    updatePatternStats(pattern) {
        this.stats.popularPatterns[pattern] = (this.stats.popularPatterns[pattern] || 0) + 1;
    }
    /**
     * Update performance statistics
     */
    updatePerformanceStats(duration) {
        const totalTime = this.stats.averageResponseTime * (this.stats.totalQueries - 1) + duration;
        this.stats.averageResponseTime = totalTime / this.stats.totalQueries;
    }
    /**
     * Get search engine statistics
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            totalQueries: 0,
            averageResponseTime: 0,
            popularPatterns: {},
            slowQueries: []
        };
    }
    /**
     * Get information about a query before executing it
     */
    explainQuery(query) {
        const parsedQuery = this.parser.parse(query);
        const patternInfo = this.parser.getPatternInfo(parsedQuery);
        return {
            parsedQuery,
            patternInfo,
            estimatedResults: patternInfo.expectedResults
        };
    }
}
//# sourceMappingURL=engine.js.map