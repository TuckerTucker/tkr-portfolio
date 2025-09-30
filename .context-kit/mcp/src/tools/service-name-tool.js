/**
 * MCP Service Name Tool
 * Provides debugging and management capabilities for service name resolution
 * across all MCP operations.
 */

const path = require('path');

// Import ServiceNameResolver from logging-client
let ServiceNameResolver;
try {
  const resolverPath = path.join(__dirname, '../../../logging-client/src/service-name-resolver.js');
  const resolverModule = require(resolverPath);
  ServiceNameResolver = resolverModule.getServiceNameResolver();
} catch (error) {
  console.warn('Failed to load ServiceNameResolver, using fallback:', error.message);

  // Fallback ServiceNameResolver if import fails
  ServiceNameResolver = {
    resolveServiceName: (context = {}) => ({
      serviceName: 'mcp-service',
      displayName: 'MCP Service',
      category: 'api-service',
      confidence: 0.1,
      source: 'fallback'
    }),
    validateServiceName: (name) => ({ isValid: true, errors: [] }),
    sanitizeServiceName: (name) => String(name || 'unknown').toLowerCase(),
    setNameMapping: () => {},
    getNameMapping: () => null
  };
}

/**
 * Setup service name tools for MCP debugging and management
 */
function setupServiceNameTools(
  config,
  toolHandlers
) {
  const tools = [
    {
      name: 'debug_service_name',
      description: 'Debug service name resolution for troubleshooting service identification issues',
      inputSchema: {
        type: 'object',
        properties: {
          context: {
            type: 'object',
            description: 'Service context to debug (processInfo, explicitName, etc.)',
            properties: {
              explicitName: { type: 'string', description: 'Explicit service name override' },
              processInfo: {
                type: 'object',
                description: 'Process information for debugging',
                properties: {
                  type: { type: 'string' },
                  subtype: { type: 'string' },
                  command: { type: 'string' },
                  args: { type: 'array', items: { type: 'string' } }
                }
              },
              packageInfo: {
                type: 'object',
                description: 'Package.json information',
                properties: {
                  name: { type: 'string' }
                }
              }
            }
          },
          includeEnvironment: {
            type: 'boolean',
            description: 'Include environment variables in resolution',
            default: true
          }
        }
      }
    },

    {
      name: 'override_service_name',
      description: 'Override service name for testing scenarios and development',
      inputSchema: {
        type: 'object',
        properties: {
          serviceName: {
            type: 'string',
            description: 'Service name to override for current MCP session'
          },
          displayName: {
            type: 'string',
            description: 'Display name for the service (optional)'
          },
          scope: {
            type: 'string',
            enum: ['session', 'environment'],
            description: 'Override scope: session-only or environment variable',
            default: 'session'
          }
        },
        required: ['serviceName']
      }
    },

    {
      name: 'validate_service_config',
      description: 'Validate service name configuration and mappings',
      inputSchema: {
        type: 'object',
        properties: {
          serviceName: {
            type: 'string',
            description: 'Service name to validate (optional)'
          },
          checkAll: {
            type: 'boolean',
            description: 'Check all known service mappings',
            default: false
          }
        }
      }
    },

    {
      name: 'service_resolution_stats',
      description: 'Get statistics and metrics about service name resolution across MCP operations',
      inputSchema: {
        type: 'object',
        properties: {
          timeWindow: {
            type: 'number',
            description: 'Time window in seconds for statistics (default: 3600)',
            default: 3600
          },
          includeDetails: {
            type: 'boolean',
            description: 'Include detailed resolution breakdown',
            default: false
          }
        }
      }
    },

    {
      name: 'list_service_mappings',
      description: 'List all configured service name mappings and their display names',
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['terminal', 'dev-server', 'build-tool', 'test-runner', 'api-service', 'unknown'],
            description: 'Filter by service category (optional)'
          }
        }
      }
    },

    {
      name: 'test_service_consistency',
      description: 'Test service name consistency across dashboard, logging, and MCP tools',
      inputSchema: {
        type: 'object',
        properties: {
          testCases: {
            type: 'array',
            description: 'Custom test cases to run (optional)',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                context: { type: 'object' }
              }
            }
          }
        }
      }
    }
  ];

  // Service name override state for session
  let sessionOverride = null;
  let resolutionStats = {
    totalResolutions: 0,
    successCount: 0,
    confidenceSum: 0,
    sourceBreakdown: {},
    categoryBreakdown: {},
    lastReset: Date.now()
  };

  // Track resolution calls
  function trackResolution(result) {
    resolutionStats.totalResolutions++;
    if (result.confidence > 0.5) {
      resolutionStats.successCount++;
    }
    resolutionStats.confidenceSum += result.confidence;

    // Track source breakdown
    const source = result.source || 'unknown';
    resolutionStats.sourceBreakdown[source] = (resolutionStats.sourceBreakdown[source] || 0) + 1;

    // Track category breakdown
    const category = result.category || 'unknown';
    resolutionStats.categoryBreakdown[category] = (resolutionStats.categoryBreakdown[category] || 0) + 1;
  }

  // Enhanced service name resolution with tracking
  function resolveServiceNameWithTracking(context = {}) {
    try {
      // Apply session override if present
      if (sessionOverride) {
        const result = {
          serviceName: sessionOverride.serviceName,
          displayName: sessionOverride.displayName || sessionOverride.serviceName,
          category: 'unknown',
          confidence: 1.0,
          source: 'session-override'
        };
        trackResolution(result);
        return result;
      }

      // Use ServiceNameResolver
      const result = ServiceNameResolver.resolveServiceName(context);
      trackResolution(result);
      return result;
    } catch (error) {
      const fallbackResult = {
        serviceName: 'mcp-service',
        displayName: 'MCP Service',
        category: 'api-service',
        confidence: 0.1,
        source: 'error-fallback'
      };
      trackResolution(fallbackResult);
      return fallbackResult;
    }
  }

  // Register tool handlers
  toolHandlers.set('debug_service_name', async (args) => {
    const { context = {}, includeEnvironment = true } = args;

    try {
      // Enhance context with environment if requested
      if (includeEnvironment) {
        context.environmentVars = process.env;
      }

      // Current MCP service context
      const mcpContext = {
        processInfo: {
          type: 'mcp-server',
          subtype: 'context-kit',
          command: 'node',
          args: ['mcp-server']
        },
        packageInfo: {
          name: '@tkr-context-kit/mcp'
        },
        ...context
      };

      // Resolve with different scenarios
      const scenarios = [
        { name: 'Current MCP Context', context: mcpContext },
        { name: 'Provided Context', context },
        { name: 'Empty Context', context: {} },
        { name: 'With TKR_SERVICE_NAME', context: { explicitName: process.env.TKR_SERVICE_NAME } }
      ].filter(s => s.context !== undefined);

      const debugResults = scenarios.map(scenario => {
        const result = resolveServiceNameWithTracking(scenario.context);
        return {
          scenario: scenario.name,
          context: scenario.context,
          result
        };
      });

      // Validation results
      const validationResults = debugResults.map(dr => ({
        scenario: dr.scenario,
        validation: ServiceNameResolver.validateServiceName(dr.result.serviceName),
        sanitized: ServiceNameResolver.sanitizeServiceName(dr.result.serviceName)
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              debugResults,
              validationResults,
              environmentOverride: process.env.TKR_SERVICE_NAME || null,
              sessionOverride: sessionOverride,
              timestamp: new Date().toISOString()
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: `Debug failed: ${error.message}`,
              context: args.context,
              timestamp: new Date().toISOString()
            }, null, 2)
          }
        ]
      };
    }
  });

  toolHandlers.set('override_service_name', async (args) => {
    const { serviceName, displayName, scope = 'session' } = args;

    try {
      // Validate the service name first
      const validation = ServiceNameResolver.validateServiceName(serviceName);
      if (!validation.isValid) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                errors: validation.errors,
                suggestion: ServiceNameResolver.sanitizeServiceName(serviceName)
              }, null, 2)
            }
          ]
        };
      }

      if (scope === 'environment') {
        // Set environment variable
        process.env.TKR_SERVICE_NAME = serviceName;
        sessionOverride = null; // Clear session override
      } else {
        // Set session override
        sessionOverride = {
          serviceName,
          displayName: displayName || serviceName
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              serviceName,
              displayName: displayName || serviceName,
              scope,
              appliedAt: new Date().toISOString(),
              note: scope === 'environment'
                ? 'Environment variable TKR_SERVICE_NAME set for all future resolutions'
                : 'Session override active until MCP restart'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error.message
            }, null, 2)
          }
        ]
      };
    }
  });

  toolHandlers.set('validate_service_config', async (args) => {
    const { serviceName, checkAll = false } = args;

    try {
      const results = [];

      if (serviceName) {
        // Validate specific service name
        const validation = ServiceNameResolver.validateServiceName(serviceName);
        const sanitized = ServiceNameResolver.sanitizeServiceName(serviceName);
        const mapping = ServiceNameResolver.getNameMapping(serviceName);

        results.push({
          serviceName,
          validation,
          sanitized,
          hasMapping: !!mapping,
          displayName: mapping,
          needsSanitization: serviceName !== sanitized
        });
      }

      if (checkAll) {
        // Test common service patterns
        const commonServices = [
          'terminal', 'vite-dev', 'react-dev', 'jest-tests', 'context-kit-api',
          'invalid-service!', '', 'a'.repeat(60), 'test_service', 'test-service'
        ];

        for (const service of commonServices) {
          const validation = ServiceNameResolver.validateServiceName(service);
          const sanitized = ServiceNameResolver.sanitizeServiceName(service);
          const mapping = ServiceNameResolver.getNameMapping(service);

          results.push({
            serviceName: service,
            validation,
            sanitized,
            hasMapping: !!mapping,
            displayName: mapping,
            needsSanitization: service !== sanitized
          });
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              validationResults: results,
              summary: {
                total: results.length,
                valid: results.filter(r => r.validation.isValid).length,
                withMappings: results.filter(r => r.hasMapping).length,
                needSanitization: results.filter(r => r.needsSanitization).length
              },
              timestamp: new Date().toISOString()
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: `Validation failed: ${error.message}`
            }, null, 2)
          }
        ]
      };
    }
  });

  toolHandlers.set('service_resolution_stats', async (args) => {
    const { timeWindow = 3600, includeDetails = false } = args;

    try {
      const timeWindowMs = timeWindow * 1000;
      const stats = { ...resolutionStats };

      // Calculate derived statistics
      const averageConfidence = stats.totalResolutions > 0
        ? stats.confidenceSum / stats.totalResolutions
        : 0;

      const successRate = stats.totalResolutions > 0
        ? stats.successCount / stats.totalResolutions
        : 0;

      const response = {
        statistics: {
          totalResolutions: stats.totalResolutions,
          successCount: stats.successCount,
          successRate: Math.round(successRate * 100) / 100,
          averageConfidence: Math.round(averageConfidence * 100) / 100,
          timeWindow: timeWindow,
          dataAge: Math.round((Date.now() - stats.lastReset) / 1000)
        },
        breakdown: {
          bySource: stats.sourceBreakdown,
          byCategory: stats.categoryBreakdown
        },
        currentOverrides: {
          session: sessionOverride,
          environment: process.env.TKR_SERVICE_NAME || null
        },
        timestamp: new Date().toISOString()
      };

      if (includeDetails) {
        // Test current resolution
        const currentResolution = resolveServiceNameWithTracking({
          processInfo: {
            type: 'mcp-server',
            subtype: 'context-kit'
          }
        });

        response.currentResolution = currentResolution;
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: `Failed to get stats: ${error.message}`
            }, null, 2)
          }
        ]
      };
    }
  });

  toolHandlers.set('list_service_mappings', async (args) => {
    const { category } = args;

    try {
      // Common service mappings to test
      const knownMappings = [
        'terminal', 'zsh', 'bash', 'fish',
        'vite-dev', 'react-dev', 'nextjs-dev',
        'vite-build', 'webpack-build', 'rollup-build',
        'jest-tests', 'vitest-tests', 'mocha-tests',
        'context-kit-api', 'knowledge-graph'
      ];

      const mappings = knownMappings.map(processType => {
        const displayName = ServiceNameResolver.getNameMapping(processType);

        // Infer category from process type
        let inferredCategory = 'unknown';
        if (['terminal', 'zsh', 'bash', 'fish'].includes(processType)) {
          inferredCategory = 'terminal';
        } else if (processType.includes('-dev')) {
          inferredCategory = 'dev-server';
        } else if (processType.includes('-build')) {
          inferredCategory = 'build-tool';
        } else if (processType.includes('-tests')) {
          inferredCategory = 'test-runner';
        } else if (processType.includes('api') || processType.includes('graph')) {
          inferredCategory = 'api-service';
        }

        return {
          processType,
          displayName,
          hasMapping: !!displayName,
          category: inferredCategory
        };
      }).filter(mapping => !category || mapping.category === category);

      const summary = {
        total: mappings.length,
        withMappings: mappings.filter(m => m.hasMapping).length,
        byCategory: mappings.reduce((acc, m) => {
          acc[m.category] = (acc[m.category] || 0) + 1;
          return acc;
        }, {})
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              mappings,
              summary,
              filterCategory: category || 'all',
              timestamp: new Date().toISOString()
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: `Failed to list mappings: ${error.message}`
            }, null, 2)
          }
        ]
      };
    }
  });

  toolHandlers.set('test_service_consistency', async (args) => {
    const { testCases = [] } = args;

    try {
      // Standard test cases for consistency
      const standardTests = [
        {
          name: 'Terminal Process',
          context: {
            processInfo: { type: 'terminal', subtype: 'zsh' },
            environmentVars: { TERM_PROGRAM: 'iTerm.app' }
          },
          expectedCategory: 'terminal',
          expectedDisplayPattern: /Terminal/i
        },
        {
          name: 'Development Server',
          context: {
            processInfo: { type: 'dev-server', subtype: 'vite' },
            packageInfo: { name: '@tkr-context-kit/dashboard' }
          },
          expectedCategory: 'dev-server',
          expectedDisplayPattern: /Development Server|Dev Server/i
        },
        {
          name: 'API Service',
          context: {
            processInfo: { type: 'http-server', command: 'knowledge-graph' },
            packageInfo: { name: '@tkr-context-kit/knowledge-graph' }
          },
          expectedCategory: 'api-service',
          expectedDisplayPattern: /API|Context Kit/i
        },
        {
          name: 'Explicit Override',
          context: {
            explicitName: 'custom-service'
          },
          expectedDisplayPattern: /Custom Service/i
        }
      ];

      // Combine standard and custom test cases
      const allTests = [...standardTests, ...testCases.map(tc => ({
        name: tc.name,
        context: tc.context,
        expectedCategory: null,
        expectedDisplayPattern: null
      }))];

      const testResults = allTests.map(test => {
        try {
          const result = resolveServiceNameWithTracking(test.context);

          const checks = {
            hasServiceName: !!result.serviceName,
            hasDisplayName: !!result.displayName,
            hasCategory: !!result.category,
            hasValidConfidence: result.confidence >= 0 && result.confidence <= 1,
            categoryMatches: !test.expectedCategory || result.category === test.expectedCategory,
            displayMatches: !test.expectedDisplayPattern || test.expectedDisplayPattern.test(result.displayName)
          };

          const passed = Object.values(checks).every(check => check);

          return {
            testName: test.name,
            context: test.context,
            result,
            checks,
            passed
          };
        } catch (error) {
          return {
            testName: test.name,
            context: test.context,
            error: error.message,
            passed: false
          };
        }
      });

      const summary = {
        total: testResults.length,
        passed: testResults.filter(r => r.passed).length,
        failed: testResults.filter(r => !r.passed).length,
        passRate: Math.round((testResults.filter(r => r.passed).length / testResults.length) * 100)
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              testResults,
              summary,
              recommendations: summary.passRate < 100 ? [
                'Review failed test cases for configuration issues',
                'Ensure ServiceNameResolver mappings are complete',
                'Check for missing or incorrect service categories'
              ] : ['All tests passed - service naming is consistent'],
              timestamp: new Date().toISOString()
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: `Consistency test failed: ${error.message}`
            }, null, 2)
          }
        ]
      };
    }
  });

  return tools;
}

module.exports = {
  setupServiceNameTools
};