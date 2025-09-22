/**
 * Query Pattern Parser
 * Parses search queries into structured patterns for the unified search engine
 */

import type { ParsedQuery, SearchPatternType } from '../types/search.js';
import { searchLogger as logger } from '../utils/logger.js';

export class QueryParser {
  /**
   * Parse a search query string into a structured pattern
   */
  parse(query: string): ParsedQuery {
    logger.debug('Parsing search query', { query });

    // Normalize the query
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      throw new Error('Empty search query');
    }

    // Wildcard all - return everything
    if (trimmedQuery === '*') {
      return {
        type: 'wildcard',
        value: '*',
        modifiers: [],
        raw: trimmedQuery
      };
    }

    // Extension pattern - *.ext
    if (trimmedQuery.startsWith('*.') && trimmedQuery.length > 2) {
      const extension = trimmedQuery.slice(2);
      return {
        type: 'extension',
        value: extension,
        modifiers: [],
        raw: query
      };
    }

    // Type filter - t:Type
    if (trimmedQuery.startsWith('t:') && trimmedQuery.length > 2) {
      const entityType = trimmedQuery.slice(2);
      return {
        type: 'type',
        value: entityType,
        modifiers: [],
        raw: query
      };
    }

    // Path pattern - /path/* or */path/*
    if (trimmedQuery.includes('/')) {
      return {
        type: 'path',
        value: trimmedQuery,
        modifiers: [],
        raw: query
      };
    }

    // Exact match - "quoted string"
    if (trimmedQuery.startsWith('"') && trimmedQuery.endsWith('"') && trimmedQuery.length > 2) {
      const exactValue = trimmedQuery.slice(1, -1);
      return {
        type: 'exact',
        value: exactValue,
        modifiers: [],
        raw: query
      };
    }

    // Fuzzy search - ~fuzzytext
    if (trimmedQuery.startsWith('~') && trimmedQuery.length > 1) {
      const fuzzyValue = trimmedQuery.slice(1);
      return {
        type: 'fuzzy',
        value: fuzzyValue,
        modifiers: [],
        raw: query
      };
    }

    // Regular expression - /pattern/
    if (trimmedQuery.startsWith('/') && trimmedQuery.length > 2) {
      const lastSlash = trimmedQuery.lastIndexOf('/');
      if (lastSlash > 0) {
        const pattern = trimmedQuery.slice(1, lastSlash);
        const flags = trimmedQuery.slice(lastSlash + 1);

        // Validate regex pattern
        try {
          new RegExp(pattern, flags);
          return {
            type: 'regex',
            value: pattern,
            modifiers: flags ? [{ type: 'transform', field: 'regex', value: flags, regexFlags: flags }] : [],
            raw: query
          };
        } catch (error) {
          logger.warn('Invalid regex pattern', { pattern, error: error.message });
          // Fall through to text search
        }
      }
    }

    // Wildcard patterns
    if (trimmedQuery.includes('*')) {
      // Contains pattern - *text*
      if (trimmedQuery.startsWith('*') && trimmedQuery.endsWith('*') && trimmedQuery.length > 2) {
        const containsValue = trimmedQuery.slice(1, -1);
        return {
          type: 'contains',
          value: containsValue,
          modifiers: [],
          raw: query
        };
      }

      // Suffix pattern - *text
      if (trimmedQuery.startsWith('*') && trimmedQuery.length > 1) {
        const suffixValue = trimmedQuery.slice(1);
        return {
          type: 'suffix',
          value: suffixValue,
          modifiers: [],
          raw: query
        };
      }

      // Prefix pattern - text*
      if (trimmedQuery.endsWith('*') && trimmedQuery.length > 1) {
        const prefixValue = trimmedQuery.slice(0, -1);
        return {
          type: 'prefix',
          value: prefixValue,
          modifiers: [],
          raw: query
        };
      }

      // Infix pattern - text*more (complex wildcard)
      return {
        type: 'wildcard',
        value: trimmedQuery,
        modifiers: [],
        raw: query
      };
    }

    // Default to text search
    logger.debug('Defaulting to text search', { query: trimmedQuery });
    return {
      type: 'text',
      value: trimmedQuery,
      modifiers: [],
      raw: query
    };
  }

  /**
   * Parse a composite query with multiple patterns
   * Example: "t:Component *.tsx Dashboard*"
   */
  parseComposite(query: string): ParsedQuery {
    const parts = this.splitCompositeQuery(query);

    if (parts.length === 1) {
      return this.parse(parts[0]);
    }

    const filters = parts.map(part => this.parse(part));

    return {
      type: 'composite',
      value: query,
      modifiers: [],
      raw: query,
      filters: filters.map(filter => ({
        type: filter.type as any,
        value: filter.value,
        operator: 'equals'
      }))
    };
  }

  /**
   * Split a composite query into individual parts
   * Respects quoted strings and handles complex patterns
   */
  private splitCompositeQuery(query: string): string[] {
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    let escapeNext = false;

    for (let i = 0; i < query.length; i++) {
      const char = query[i];

      if (escapeNext) {
        current += char;
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        current += char;
        continue;
      }

      if (char === '"') {
        inQuotes = !inQuotes;
        current += char;
        continue;
      }

      if (!inQuotes && char === ' ') {
        if (current.trim()) {
          parts.push(current.trim());
          current = '';
        }
        continue;
      }

      current += char;
    }

    if (current.trim()) {
      parts.push(current.trim());
    }

    return parts;
  }

  /**
   * Validate a parsed query for correctness
   */
  validate(parsedQuery: ParsedQuery): string[] {
    const errors: string[] = [];

    if (!parsedQuery.value) {
      errors.push('Query value cannot be empty');
    }

    if (parsedQuery.type === 'regex') {
      try {
        const flags = parsedQuery.modifiers?.find(m => m.regexFlags)?.regexFlags || '';
        new RegExp(parsedQuery.value, flags);
      } catch (error) {
        errors.push(`Invalid regex pattern: ${error.message}`);
      }
    }

    if (parsedQuery.type === 'extension') {
      if (parsedQuery.value.includes('/') || parsedQuery.value.includes('\\')) {
        errors.push('File extension cannot contain path separators');
      }
    }

    if (parsedQuery.type === 'type') {
      if (parsedQuery.value.length === 0) {
        errors.push('Entity type cannot be empty');
      }
    }

    return errors;
  }

  /**
   * Get information about the query pattern
   */
  getPatternInfo(parsedQuery: ParsedQuery): {
    description: string;
    expectedResults: string;
    performance: 'fast' | 'medium' | 'slow';
  } {
    switch (parsedQuery.type) {
      case 'wildcard':
        return {
          description: 'Match all entities',
          expectedResults: 'All entities in the system',
          performance: 'medium'
        };

      case 'prefix':
        return {
          description: `Match entities starting with "${parsedQuery.value}"`,
          expectedResults: `Entities whose names start with "${parsedQuery.value}"`,
          performance: 'fast'
        };

      case 'suffix':
        return {
          description: `Match entities ending with "${parsedQuery.value}"`,
          expectedResults: `Entities whose names end with "${parsedQuery.value}"`,
          performance: 'medium'
        };

      case 'contains':
        return {
          description: `Match entities containing "${parsedQuery.value}"`,
          expectedResults: `Entities whose names contain "${parsedQuery.value}"`,
          performance: 'medium'
        };

      case 'extension':
        return {
          description: `Match entities with file extension "${parsedQuery.value}"`,
          expectedResults: `Entities with .${parsedQuery.value} file extension`,
          performance: 'fast'
        };

      case 'type':
        return {
          description: `Match entities of type "${parsedQuery.value}"`,
          expectedResults: `All ${parsedQuery.value} entities`,
          performance: 'fast'
        };

      case 'exact':
        return {
          description: `Match entities with exact name "${parsedQuery.value}"`,
          expectedResults: `Entities named exactly "${parsedQuery.value}"`,
          performance: 'fast'
        };

      case 'fuzzy':
        return {
          description: `Fuzzy match for "${parsedQuery.value}"`,
          expectedResults: `Entities with names similar to "${parsedQuery.value}"`,
          performance: 'slow'
        };

      case 'regex':
        return {
          description: `Regular expression match: /${parsedQuery.value}/`,
          expectedResults: `Entities matching the regex pattern`,
          performance: 'slow'
        };

      case 'path':
        return {
          description: `Match entities by file path pattern "${parsedQuery.value}"`,
          expectedResults: `Entities in matching file paths`,
          performance: 'fast'
        };

      case 'text':
        return {
          description: `Text search for "${parsedQuery.value}"`,
          expectedResults: `Entities containing "${parsedQuery.value}" in name or content`,
          performance: 'medium'
        };

      case 'composite':
        return {
          description: 'Multiple search patterns combined',
          expectedResults: 'Entities matching all specified patterns',
          performance: 'medium'
        };

      default:
        return {
          description: 'Unknown pattern type',
          expectedResults: 'Unpredictable results',
          performance: 'slow'
        };
    }
  }
}