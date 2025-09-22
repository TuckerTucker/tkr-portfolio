/**
 * Utilities Exports
 * Central export point for all utility functions
 */

// Configuration utilities
export { ConfigManager, config } from './config.js';
export type { ConfigManager as ConfigManagerType } from './config.js';

// ID generation utilities
export {
  IdGenerator,
  generateEntityId,
  generateRelationId,
  generateLogId,
  generateId,
  isValidId
} from './id-generator.js';

// Validation utilities
export {
  ValidationUtils,
  validateEntity,
  validateRelation,
  validateSearchOptions,
  validateSearchQuery,
  validateLogEntry,
  validateLogFilters,
  throwIfInvalid
} from './validation.js';

// Logging utilities
export {
  CoreLogger,
  createLogger,
  logger,
  databaseLogger,
  searchLogger,
  knowledgeGraphLogger,
  loggingLogger,
  PerformanceTimer,
  timeOperation,
  timeAsync
} from './logger.js';

export type { LoggerConfig } from './logger.js';

// Common utility functions
export class Utils {
  /**
   * Deep merge two objects
   */
  static deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const result = { ...target };

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = result[key];

        if (this.isObject(sourceValue) && this.isObject(targetValue)) {
          result[key] = this.deepMerge(targetValue, sourceValue as Partial<T[Extract<keyof T, string>]>);
        } else {
          result[key] = sourceValue as T[Extract<keyof T, string>];
        }
      }
    }

    return result;
  }

  /**
   * Deep clone an object
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as any;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item)) as any;
    }

    const cloned = {} as any;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }

    return cloned;
  }

  /**
   * Check if value is a plain object
   */
  static isObject(value: any): value is Record<string, any> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * Debounce function execution
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  /**
   * Throttle function execution
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  }

  /**
   * Sleep for specified milliseconds
   */
  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry async operation with exponential backoff
   */
  static async retry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxAttempts) {
          throw lastError;
        }

        const delay = baseDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Safe JSON parse with default value
   */
  static safeJsonParse<T>(json: string, defaultValue: T): T {
    try {
      return JSON.parse(json);
    } catch {
      return defaultValue;
    }
  }

  /**
   * Safe JSON stringify
   */
  static safeJsonStringify(obj: any, defaultValue: string = '{}'): string {
    try {
      return JSON.stringify(obj);
    } catch {
      return defaultValue;
    }
  }

  /**
   * Generate trigrams for fuzzy search
   */
  static generateTrigrams(text: string): string[] {
    if (!text || text.length < 3) {
      return [];
    }

    const normalized = text.toLowerCase();
    const padded = `__${normalized}__`;
    const trigrams = new Set<string>();

    for (let i = 0; i < padded.length - 2; i++) {
      trigrams.add(padded.substring(i, i + 3));
    }

    return Array.from(trigrams);
  }

  /**
   * Calculate trigram similarity between two strings
   */
  static trigramSimilarity(str1: string, str2: string): number {
    const trigrams1 = new Set(this.generateTrigrams(str1));
    const trigrams2 = new Set(this.generateTrigrams(str2));

    const intersection = new Set([...trigrams1].filter(x => trigrams2.has(x)));
    const union = new Set([...trigrams1, ...trigrams2]);

    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * Normalize string for search indexing
   */
  static normalizeForSearch(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s]/g, ' ')     // Replace special chars with spaces
      .replace(/\s+/g, ' ')             // Normalize whitespace
      .trim();
  }

  /**
   * Extract file extension from path
   */
  static getFileExtension(filePath: string): string {
    if (!filePath || !filePath.includes('.')) {
      return '';
    }

    const lastDot = filePath.lastIndexOf('.');
    const lastSlash = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'));

    // Make sure the dot is after the last path separator
    if (lastDot > lastSlash) {
      return filePath.substring(lastDot + 1).toLowerCase();
    }

    return '';
  }

  /**
   * Format bytes to human readable string
   */
  static formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Format duration in milliseconds to human readable string
   */
  static formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    }

    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes < 60) {
      return `${minutes}m ${remainingSeconds}s`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  }
}