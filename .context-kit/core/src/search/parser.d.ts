/**
 * Query Pattern Parser
 * Parses search queries into structured patterns for the unified search engine
 */
import type { ParsedQuery } from '../types/search.js';
export declare class QueryParser {
    /**
     * Parse a search query string into a structured pattern
     */
    parse(query: string): ParsedQuery;
    /**
     * Parse a composite query with multiple patterns
     * Example: "t:Component *.tsx Dashboard*"
     */
    parseComposite(query: string): ParsedQuery;
    /**
     * Split a composite query into individual parts
     * Respects quoted strings and handles complex patterns
     */
    private splitCompositeQuery;
    /**
     * Validate a parsed query for correctness
     */
    validate(parsedQuery: ParsedQuery): string[];
    /**
     * Get information about the query pattern
     */
    getPatternInfo(parsedQuery: ParsedQuery): {
        description: string;
        expectedResults: string;
        performance: 'fast' | 'medium' | 'slow';
    };
}
//# sourceMappingURL=parser.d.ts.map