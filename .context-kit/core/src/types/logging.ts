/**
 * Logging System Type Definitions for tkr-context-kit v2.0
 *
 * Comprehensive interfaces for multi-environment logging, including structured
 * logging, log aggregation, filtering, analytics, and transport mechanisms.
 */

/**
 * Core log entry structure
 */
export interface LogEntry {
  /** Unique log entry identifier */
  id: string;

  /** Unix timestamp (milliseconds) */
  timestamp: number;

  /** Log level */
  level: LogLevel;

  /** Service or component that generated the log */
  service: string;

  /** Log message */
  message: string;

  /** Additional structured metadata */
  metadata?: Record<string, any>;

  /** Source information */
  source?: LogSource | string;

  /** Trace information for distributed tracing */
  trace?: TraceInfo;

  /** Error information (if applicable) */
  error?: ErrorInfo;

  /** Performance metrics (if applicable) */
  performance?: PerformanceInfo;

  /** User context (if applicable) */
  user?: UserContext;

  /** Session information */
  session?: SessionInfo;

  /** Environment context */
  environment?: EnvironmentContext;

  /** Custom fields for extensibility */
  custom?: Record<string, any>;

  /** Indexed content for search functionality */
  indexed_content?: string;
}

/**
 * Log level enumeration (supports both uppercase and lowercase)
 */
export type LogLevel = 'FATAL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE' | 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

/**
 * Log level configuration with priorities
 */
export interface LogLevelConfig {
  /** Log level name */
  level: LogLevel;

  /** Numeric priority (lower = higher priority) */
  priority: number;

  /** Display color for UI */
  color: string;

  /** Console output styling */
  style?: LogLevelStyle;

  /** Whether to include stack traces */
  includeStackTrace?: boolean;
}

/**
 * Log level styling configuration
 */
export interface LogLevelStyle {
  /** Text color */
  color?: string;

  /** Background color */
  backgroundColor?: string;

  /** Font weight */
  fontWeight?: 'normal' | 'bold';

  /** Text decoration */
  textDecoration?: string;

  /** Icon or symbol */
  icon?: string;
}

/**
 * Log source information
 */
export interface LogSource {
  /** Source file path */
  file?: string;

  /** Function or method name */
  function?: string;

  /** Line number */
  line?: number;

  /** Column number */
  column?: number;

  /** Component or module name */
  component?: string;

  /** Source code repository information */
  repository?: RepositoryInfo;
}

/**
 * Repository information for log sources
 */
export interface RepositoryInfo {
  /** Repository URL */
  url?: string;

  /** Commit hash */
  commit?: string;

  /** Branch name */
  branch?: string;

  /** Repository provider (github, gitlab, etc.) */
  provider?: string;
}

/**
 * Distributed tracing information
 */
export interface TraceInfo {
  /** Trace ID for correlating related logs */
  traceId: string;

  /** Span ID for individual operations */
  spanId?: string;

  /** Parent span ID */
  parentSpanId?: string;

  /** Baggage or context propagation */
  baggage?: Record<string, string>;

  /** Trace flags */
  flags?: TraceFlags;

  /** Trace state */
  traceState?: string;
}

/**
 * Trace flags for distributed tracing
 */
export interface TraceFlags {
  /** Sampling decision */
  sampled?: boolean;

  /** Debug flag */
  debug?: boolean;

  /** Custom flags */
  custom?: Record<string, boolean>;
}

/**
 * Error information in log entries
 */
export interface ErrorInfo {
  /** Error name or type */
  name: string;

  /** Error message */
  message: string;

  /** Error stack trace */
  stack?: string;

  /** Error code */
  code?: string | number;

  /** HTTP status code (if applicable) */
  statusCode?: number;

  /** Inner/cause error */
  cause?: ErrorInfo;

  /** Error context */
  context?: Record<string, any>;

  /** Error fingerprint for grouping */
  fingerprint?: string;
}

/**
 * Performance metrics in log entries
 */
export interface PerformanceInfo {
  /** Operation duration in milliseconds */
  duration?: number;

  /** Memory usage in bytes */
  memoryUsage?: number;

  /** CPU usage percentage */
  cpuUsage?: number;

  /** Database query count */
  dbQueries?: number;

  /** Network requests made */
  networkRequests?: number;

  /** Custom performance metrics */
  customMetrics?: Record<string, number>;

  /** Performance thresholds */
  thresholds?: PerformanceThresholds;
}

/**
 * Performance threshold configuration
 */
export interface PerformanceThresholds {
  /** Duration warning threshold (ms) */
  durationWarning?: number;

  /** Duration error threshold (ms) */
  durationError?: number;

  /** Memory warning threshold (bytes) */
  memoryWarning?: number;

  /** Memory error threshold (bytes) */
  memoryError?: number;
}

/**
 * User context information
 */
export interface UserContext {
  /** User identifier */
  userId?: string;

  /** Username */
  username?: string;

  /** User email */
  email?: string;

  /** User roles */
  roles?: string[];

  /** User permissions */
  permissions?: string[];

  /** User IP address */
  ipAddress?: string;

  /** User agent string */
  userAgent?: string;

  /** User preferences */
  preferences?: Record<string, any>;
}

/**
 * Session information
 */
export interface SessionInfo {
  /** Session identifier */
  sessionId: string;

  /** Session start time */
  startTime?: number;

  /** Session duration */
  duration?: number;

  /** Session type */
  type?: 'web' | 'api' | 'background' | 'test';

  /** Session metadata */
  metadata?: Record<string, any>;
}

/**
 * Environment context
 */
export interface EnvironmentContext {
  /** Environment name (dev, staging, prod) */
  environment: string;

  /** Application version */
  version?: string;

  /** Build number */
  buildNumber?: string;

  /** Deployment identifier */
  deploymentId?: string;

  /** Region or datacenter */
  region?: string;

  /** Availability zone */
  zone?: string;

  /** Server hostname */
  hostname?: string;

  /** Process ID */
  processId?: number;

  /** Runtime information */
  runtime?: RuntimeInfo;
}

/**
 * Runtime environment information
 */
export interface RuntimeInfo {
  /** Runtime type (node, browser, worker) */
  type: 'node' | 'browser' | 'worker' | 'deno' | 'bun';

  /** Runtime version */
  version?: string;

  /** Platform (darwin, linux, win32) */
  platform?: string;

  /** Architecture (x64, arm64) */
  architecture?: string;

  /** Available memory */
  memory?: number;

  /** CPU count */
  cpuCount?: number;
}

/**
 * Log filtering options
 */
export interface LogFilters {
  /** Filter by log level */
  level?: LogLevel | LogLevel[];

  /** Filter by service name */
  service?: string | string[];

  /** Filter by component */
  component?: string | string[];

  /** Filter by source */
  source?: string;

  /** Filter by trace ID */
  traceId?: string;

  /** Time range filter */
  timeRange?: TimeRange;

  /** Text search in log messages */
  search?: string;

  /** Metadata filters */
  metadata?: MetadataFilter[];

  /** User filters */
  user?: UserFilter;

  /** Environment filters */
  environment?: EnvironmentFilter;

  /** Custom filters */
  custom?: CustomFilter[];

  /** Exclude filters */
  exclude?: ExcludeFilter;
}

/**
 * Time range specification for filtering
 */
export interface TimeRange {
  /** Start timestamp (Unix milliseconds) */
  start?: number;

  /** End timestamp (Unix milliseconds) */
  end?: number;

  /** Relative time window (e.g., "1h", "30m", "7d") */
  window?: string;

  /** Time zone for interpretation */
  timezone?: string;
}

/**
 * Metadata filter specification
 */
export interface MetadataFilter {
  /** Metadata field path */
  field: string;

  /** Filter operator */
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'exists' | 'contains' | 'startswith' | 'endswith' | 'regex';

  /** Filter value */
  value: any;

  /** Case sensitivity for string operations */
  caseSensitive?: boolean;
}

/**
 * User-based filtering
 */
export interface UserFilter {
  /** User ID filter */
  userId?: string | string[];

  /** Username filter */
  username?: string | string[];

  /** Role filter */
  roles?: string | string[];

  /** IP address filter */
  ipAddress?: string | string[];
}

/**
 * Environment-based filtering
 */
export interface EnvironmentFilter {
  /** Environment name filter */
  environment?: string | string[];

  /** Version filter */
  version?: string | string[];

  /** Region filter */
  region?: string | string[];

  /** Hostname filter */
  hostname?: string | string[];
}

/**
 * Custom filter specification
 */
export interface CustomFilter {
  /** Filter name */
  name: string;

  /** Filter function or expression */
  expression: string;

  /** Filter parameters */
  parameters?: Record<string, any>;
}

/**
 * Exclude filter specification
 */
export interface ExcludeFilter {
  /** Services to exclude */
  services?: string[];

  /** Log levels to exclude */
  levels?: LogLevel[];

  /** Message patterns to exclude */
  messagePatterns?: string[];

  /** Metadata conditions to exclude */
  metadata?: MetadataFilter[];
}

/**
 * Log statistics and analytics
 */
export interface LogStats {
  /** Total log count */
  total: number;

  /** Count by log level */
  byLevel: Record<LogLevel, number>;

  /** Count by service */
  byService: Record<string, number>;

  /** Count by component */
  byComponent?: Record<string, number>;

  /** Time range statistics */
  timeRange?: TimeRangeStats;

  /** Error statistics */
  errors?: ErrorStats;

  /** Performance statistics */
  performance?: PerformanceStats;

  /** Trend data */
  trends?: TrendData[];

  /** Total entries (alternative property name) */
  totalEntries?: number;
}

/**
 * Time range statistics
 */
export interface TimeRangeStats {
  /** Start timestamp */
  start: number;

  /** End timestamp */
  end: number;

  /** Total duration */
  duration: number;

  /** Logs per time unit */
  logsPerMinute?: number;

  /** Peak activity periods */
  peaks?: ActivityPeak[];
}

/**
 * Activity peak information
 */
export interface ActivityPeak {
  /** Peak timestamp */
  timestamp: number;

  /** Log count during peak */
  count: number;

  /** Peak duration */
  duration: number;

  /** Dominant log level during peak */
  dominantLevel: LogLevel;
}

/**
 * Error statistics
 */
export interface ErrorStats {
  /** Total error count */
  totalErrors: number;

  /** Error rate (errors per minute) */
  errorRate: number;

  /** Most common errors */
  topErrors: ErrorSummary[];

  /** Error trends */
  trends: ErrorTrend[];

  /** Mean time between failures */
  mtbf?: number;
}

/**
 * Error summary information
 */
export interface ErrorSummary {
  /** Error fingerprint */
  fingerprint: string;

  /** Error message */
  message: string;

  /** Occurrence count */
  count: number;

  /** First occurrence */
  firstSeen: number;

  /** Last occurrence */
  lastSeen: number;

  /** Affected services */
  affectedServices: string[];
}

/**
 * Error trend data
 */
export interface ErrorTrend {
  /** Time bucket */
  timestamp: number;

  /** Error count in bucket */
  errorCount: number;

  /** Total log count in bucket */
  totalCount: number;

  /** Error rate percentage */
  errorRate: number;
}

/**
 * Performance statistics
 */
export interface PerformanceStats {
  /** Average response time */
  avgResponseTime?: number;

  /** 95th percentile response time */
  p95ResponseTime?: number;

  /** 99th percentile response time */
  p99ResponseTime?: number;

  /** Average memory usage */
  avgMemoryUsage?: number;

  /** Peak memory usage */
  peakMemoryUsage?: number;

  /** Slow operations */
  slowOperations?: SlowOperation[];
}

/**
 * Slow operation information
 */
export interface SlowOperation {
  /** Operation identifier */
  operation: string;

  /** Service name */
  service: string;

  /** Average duration */
  avgDuration: number;

  /** Maximum duration */
  maxDuration: number;

  /** Occurrence count */
  count: number;

  /** Performance impact score */
  impactScore?: number;
}

/**
 * Trend data for analytics
 */
export interface TrendData {
  /** Timestamp bucket */
  timestamp: number;

  /** Metric name */
  metric: string;

  /** Metric value */
  value: number;

  /** Change from previous period */
  change?: number;

  /** Change percentage */
  changePercent?: number;
}

/**
 * Log service configuration
 */
export interface LogServiceConfig {
  /** Service name */
  serviceName?: string;

  /** Default log level */
  defaultLevel?: LogLevel;

  /** Log transports configuration */
  transports?: TransportConfig[];

  /** Log formatting options */
  formatting?: FormattingConfig;

  /** Filtering options */
  filters?: FilterConfig;

  /** Buffer configuration */
  buffering?: BufferConfig;

  /** Sampling configuration */
  sampling?: SamplingConfig;

  /** Retention policy */
  retention?: RetentionConfig;

  /** Performance options */
  performance?: LogPerformanceConfig;

  /** Database path for log storage */
  databasePath?: string;

  /** Retention in days (legacy property) */
  retentionDays?: number;

  /** Batch size for log processing */
  batchSize?: number;

  /** Batch interval in milliseconds */
  batchInterval?: number;

  /** Flush interval in milliseconds */
  flushInterval?: number;

  /** Maximum log age in milliseconds */
  maxLogAge?: number;

  /** Enable analytics */
  enableAnalytics?: boolean;

  /** Retention policy type */
  retentionPolicy?: 'time_based' | 'count_based';

  /** Maximum log entries */
  maxLogEntries?: number;

  /** Enable HTTP transport */
  enableHttpTransport?: boolean;

  /** HTTP endpoint URL */
  httpEndpoint?: string;

  /** Enable console transport */
  enableConsoleTransport?: boolean;

  /** Default log level (alternative name) */
  logLevel?: string;

  /** Services list */
  services?: string[];
}

/**
 * Transport configuration for log delivery
 */
export interface TransportConfig {
  /** Transport type */
  type: 'console' | 'file' | 'http' | 'database' | 'elasticsearch' | 'syslog' | 'custom';

  /** Transport name */
  name: string;

  /** Minimum log level for this transport */
  level?: LogLevel;

  /** Transport-specific options */
  options?: Record<string, any>;

  /** Formatter for this transport */
  formatter?: string;

  /** Error handling */
  errorHandling?: TransportErrorHandling;

  /** Rate limiting */
  rateLimit?: RateLimitConfig;
}

/**
 * Transport error handling configuration
 */
export interface TransportErrorHandling {
  /** Retry configuration */
  retry?: RetryConfig;

  /** Fallback transport */
  fallback?: string;

  /** Error callback */
  onError?: string;

  /** Silent failure flag */
  silentFail?: boolean;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Maximum retry attempts */
  maxAttempts: number;

  /** Initial delay in milliseconds */
  initialDelay: number;

  /** Delay multiplier for exponential backoff */
  multiplier?: number;

  /** Maximum delay between retries */
  maxDelay?: number;

  /** Retry conditions */
  retryConditions?: RetryCondition[];
}

/**
 * Retry condition specification
 */
export interface RetryCondition {
  /** Condition type */
  type: 'error_code' | 'status_code' | 'timeout' | 'network_error';

  /** Condition value */
  value: any;

  /** Whether condition triggers retry */
  shouldRetry: boolean;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  /** Maximum logs per time window */
  maxLogs: number;

  /** Time window in milliseconds */
  window: number;

  /** Action when limit exceeded */
  onLimitExceeded: 'drop' | 'buffer' | 'throttle';

  /** Burst allowance */
  burstSize?: number;
}

/**
 * Log formatting configuration
 */
export interface FormattingConfig {
  /** Default formatter */
  default: string;

  /** Timestamp format */
  timestampFormat?: string;

  /** Include stack traces */
  includeStackTrace?: boolean;

  /** Pretty print objects */
  prettyPrint?: boolean;

  /** Color output */
  colorize?: boolean;

  /** Custom formatters */
  customFormatters?: Record<string, FormatterDefinition>;
}

/**
 * Custom formatter definition
 */
export interface FormatterDefinition {
  /** Formatter name */
  name: string;

  /** Formatter function or template */
  implementation: string;

  /** Formatter options */
  options?: Record<string, any>;
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  /** Global filters applied to all logs */
  global?: LogFilters;

  /** Transport-specific filters */
  byTransport?: Record<string, LogFilters>;

  /** Dynamic filters */
  dynamic?: DynamicFilterConfig[];
}

/**
 * Dynamic filter configuration
 */
export interface DynamicFilterConfig {
  /** Filter name */
  name: string;

  /** Filter condition */
  condition: string;

  /** Filter action */
  action: 'include' | 'exclude' | 'modify' | 'route';

  /** Filter parameters */
  parameters?: Record<string, any>;

  /** Filter priority */
  priority?: number;
}

/**
 * Buffer configuration for log batching
 */
export interface BufferConfig {
  /** Enable buffering */
  enabled: boolean;

  /** Maximum buffer size */
  maxSize: number;

  /** Flush interval in milliseconds */
  flushInterval: number;

  /** Auto-flush conditions */
  autoFlush?: AutoFlushConfig;

  /** Buffer overflow action */
  onOverflow: 'drop_oldest' | 'drop_newest' | 'flush';
}

/**
 * Auto-flush configuration
 */
export interface AutoFlushConfig {
  /** Flush on error level logs */
  onError?: boolean;

  /** Flush on specific log levels */
  onLevels?: LogLevel[];

  /** Flush on buffer percentage */
  onBufferPercent?: number;

  /** Flush on memory pressure */
  onMemoryPressure?: boolean;
}

/**
 * Sampling configuration for high-volume logging
 */
export interface SamplingConfig {
  /** Enable sampling */
  enabled: boolean;

  /** Default sampling rate (0-1) */
  defaultRate: number;

  /** Sampling rules */
  rules?: SamplingRule[];

  /** Sampling strategy */
  strategy?: 'random' | 'deterministic' | 'adaptive';

  /** Adaptive sampling options */
  adaptive?: AdaptiveSamplingConfig;
}

/**
 * Sampling rule specification
 */
export interface SamplingRule {
  /** Rule condition */
  condition: string;

  /** Sampling rate for this rule */
  rate: number;

  /** Rule priority */
  priority?: number;

  /** Rule metadata */
  metadata?: Record<string, any>;
}

/**
 * Adaptive sampling configuration
 */
export interface AdaptiveSamplingConfig {
  /** Target logs per second */
  targetRate: number;

  /** Adjustment interval in milliseconds */
  adjustmentInterval: number;

  /** Minimum sampling rate */
  minRate: number;

  /** Maximum sampling rate */
  maxRate: number;

  /** Rate adjustment factor */
  adjustmentFactor?: number;
}

/**
 * Log retention policy
 */
export interface RetentionConfig {
  /** Default retention period in days */
  defaultPeriod: number;

  /** Retention rules by log level */
  byLevel?: Record<LogLevel, number>;

  /** Retention rules by service */
  byService?: Record<string, number>;

  /** Archive configuration */
  archive?: ArchiveConfig;

  /** Cleanup schedule */
  cleanup?: CleanupConfig;
}

/**
 * Archive configuration
 */
export interface ArchiveConfig {
  /** Enable archiving */
  enabled: boolean;

  /** Archive after days */
  archiveAfterDays: number;

  /** Archive storage type */
  storageType: 'file' | 's3' | 'gcs' | 'azure' | 'custom';

  /** Archive compression */
  compression?: 'gzip' | 'bzip2' | 'lz4' | 'zstd';

  /** Archive options */
  options?: Record<string, any>;
}

/**
 * Cleanup schedule configuration
 */
export interface CleanupConfig {
  /** Cleanup schedule (cron expression) */
  schedule: string;

  /** Cleanup batch size */
  batchSize?: number;

  /** Cleanup timeout in milliseconds */
  timeout?: number;

  /** Run cleanup on startup */
  onStartup?: boolean;
}

/**
 * Log performance configuration
 */
export interface LogPerformanceConfig {
  /** Asynchronous logging */
  async?: boolean;

  /** Worker thread count for async logging */
  workerThreads?: number;

  /** Memory limits */
  memoryLimits?: MemoryLimits;

  /** Performance monitoring */
  monitoring?: PerformanceMonitoringConfig;
}

/**
 * Memory limits for logging
 */
export interface MemoryLimits {
  /** Maximum memory for log buffers */
  maxBufferMemory: number;

  /** Maximum memory per transport */
  maxTransportMemory?: number;

  /** Memory pressure threshold */
  pressureThreshold?: number;

  /** Action on memory pressure */
  onPressure?: 'flush' | 'drop' | 'throttle';
}

/**
 * Performance monitoring configuration
 */
export interface PerformanceMonitoringConfig {
  /** Enable performance monitoring */
  enabled: boolean;

  /** Monitoring interval in milliseconds */
  interval: number;

  /** Performance metrics to track */
  metrics?: PerformanceMetric[];

  /** Performance alerts */
  alerts?: PerformanceAlert[];
}

/**
 * Performance metric definition
 */
export interface PerformanceMetric {
  /** Metric name */
  name: string;

  /** Metric type */
  type: 'counter' | 'gauge' | 'histogram' | 'summary';

  /** Metric description */
  description?: string;

  /** Metric labels */
  labels?: string[];
}

/**
 * Performance alert configuration
 */
export interface PerformanceAlert {
  /** Alert name */
  name: string;

  /** Alert condition */
  condition: string;

  /** Alert threshold */
  threshold: number;

  /** Alert severity */
  severity: 'info' | 'warning' | 'error' | 'critical';

  /** Alert notification */
  notification?: AlertNotification;
}

/**
 * Alert notification configuration
 */
export interface AlertNotification {
  /** Notification type */
  type: 'email' | 'slack' | 'webhook' | 'console';

  /** Notification target */
  target: string;

  /** Notification template */
  template?: string;

  /** Notification options */
  options?: Record<string, any>;
}

/**
 * Log filter criteria (alternative to LogFilters)
 */
export interface LogFilter {
  /** Filter by log level */
  level?: LogLevel | LogLevel[];
  /** Filter by service */
  service?: string | string[];
  /** Filter by component */
  component?: string;
  /** Filter by source */
  source?: string;
  /** Filter by message pattern */
  message?: string;
  /** Time range filter */
  timeRange?: TimeRange;
  /** Custom metadata filter */
  metadata?: Record<string, any>;
}

/**
 * Sort option interface
 */
export interface SortOption {
  /** Field to sort by */
  field: string;
  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Log query interface
 */
export interface LogQuery {
  /** Query filters */
  filters?: LogFilter;
  /** Sort options */
  sort?: SortOption[];
  /** Pagination */
  limit?: number;
  offset?: number;
  /** Include metadata */
  includeMetadata?: boolean;
}

/**
 * Log aggregation interface
 */
export interface LogAggregation {
  /** Aggregation type */
  type: 'count' | 'sum' | 'avg' | 'min' | 'max';
  /** Field to aggregate */
  field: string;
  /** Group by fields */
  groupBy?: string[];
  /** Time bucket size */
  timeBucket?: string;
}

/**
 * Health status interface
 */
export interface HealthStatus {
  /** Overall health status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** Health check timestamp */
  timestamp: number;
  /** Health details */
  details?: Record<string, any>;
}

/**
 * Health check configuration
 */
export interface HealthCheck {
  /** Check name */
  name: string;
  /** Check function */
  check: () => Promise<HealthStatus>;
  /** Check interval */
  interval?: number;
  /** Check timeout */
  timeout?: number;
}

/**
 * Service status interface
 */
export interface ServiceStatus {
  /** Service name */
  service: string;
  /** Service status */
  status: HealthStatus;
  /** Service version */
  version?: string;
  /** Service uptime */
  uptime?: number;
}

/**
 * Log query result interface
 */
export interface LogQueryResult {
  /** Logs found */
  logs: LogEntry[];
  /** Total count */
  total: number;
  /** Has more results */
  hasMore: boolean;
  /** Query metadata */
  metadata?: Record<string, any>;
}