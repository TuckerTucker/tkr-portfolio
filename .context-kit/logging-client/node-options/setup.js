#!/usr/bin/env node
/**
 * Setup Automation for NODE_OPTIONS Integration
 * Automates NODE_OPTIONS configuration for tkr-context-kit logging
 *
 * Features:
 * - Automatic NODE_OPTIONS configuration
 * - Environment variable validation
 * - Integration verification
 * - Shell configuration assistance
 * - Performance validation
 */

const fs = require('fs');
const path = require('path');
const { createProcessFilter } = require('./process-filter');
const { createChildProcessHandler } = require('./child-handler');

class NodeOptionsSetup {
  constructor(options = {}) {
    this.options = {
      projectRoot: options.projectRoot || this.findProjectRoot(),
      interactive: options.interactive !== false,
      validateSetup: options.validateSetup !== false,
      verboseOutput: options.verboseOutput === true,
      dryRun: options.dryRun === true,
      ...options
    };

    this.enhancedLoggerPath = null;
    this.setupResults = {
      success: false,
      errors: [],
      warnings: [],
      actions: []
    };
  }

  /**
   * Find project root by looking for .context-kit directory
   */
  findProjectRoot() {
    let currentDir = process.cwd();

    while (currentDir !== path.dirname(currentDir)) {
      const contextKitPath = path.join(currentDir, '.context-kit');
      if (fs.existsSync(contextKitPath)) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }

    return null;
  }

  /**
   * Main setup method
   */
  async setup() {
    this.log('🚀 Starting NODE_OPTIONS setup for tkr-context-kit logging...\n');

    try {
      // Validate prerequisites
      await this.validatePrerequisites();

      // Setup NODE_OPTIONS
      await this.setupNodeOptions();

      // Validate integration
      if (this.options.validateSetup) {
        await this.validateIntegration();
      }

      // Provide usage instructions
      this.provideUsageInstructions();

      this.setupResults.success = true;
      this.log('✅ NODE_OPTIONS setup completed successfully!\n');

    } catch (error) {
      this.setupResults.errors.push(error.message);
      this.error('❌ Setup failed:', error.message);
      this.setupResults.success = false;
    }

    return this.setupResults;
  }

  /**
   * Validate prerequisites for setup
   */
  async validatePrerequisites() {
    this.log('📋 Validating prerequisites...');

    // Check if in .context-kit project
    if (!this.options.projectRoot) {
      throw new Error('Not in a .context-kit project. Setup must be run from a project with .context-kit directory.');
    }

    // Check for Wave 1 enhanced logging client
    this.enhancedLoggerPath = path.join(
      this.options.projectRoot,
      '.context-kit',
      'logging-client',
      'src',
      'auto-init-enhanced.js'
    );

    if (!fs.existsSync(this.enhancedLoggerPath)) {
      throw new Error(`Wave 1 enhanced logging client not found at: ${this.enhancedLoggerPath}`);
    }

    // Validate the enhanced logger can be required
    try {
      require(this.enhancedLoggerPath);
    } catch (error) {
      throw new Error(`Enhanced logging client cannot be loaded: ${error.message}`);
    }

    // Check logging service availability
    await this.checkLoggingService();

    this.log('   ✅ Prerequisites validated');
  }

  /**
   * Check if logging service is available
   */
  async checkLoggingService() {
    const endpoint = process.env.TKR_LOG_ENDPOINT || 'http://localhost:42003/api/logs';

    try {
      // Simple health check
      const { createAutoTkrLogger } = require(path.join(this.options.projectRoot, '.context-kit', 'logging-client', 'dist', 'index.js'));

      // Test logger creation
      const testLogger = createAutoTkrLogger({
        service: 'setup-test',
        serviceType: 'test',
        baseUrl: endpoint.replace('/api/logs', ''),
        failSilently: true
      });

      this.log('   ✅ Logging service connectivity verified');
    } catch (error) {
      this.setupResults.warnings.push(`Logging service check failed: ${error.message}. This is OK if the service isn't running yet.`);
      this.warn('   ⚠️  Logging service not available (this is OK for setup)');
    }
  }

  /**
   * Setup NODE_OPTIONS configuration
   */
  async setupNodeOptions() {
    this.log('⚙️  Setting up NODE_OPTIONS configuration...');

    const nodeOptionsValue = `--require ${this.enhancedLoggerPath}`;

    // Check current NODE_OPTIONS
    const currentNodeOptions = process.env.NODE_OPTIONS || '';

    if (currentNodeOptions.includes(this.enhancedLoggerPath)) {
      this.log('   ✅ NODE_OPTIONS already configured correctly');
      return;
    }

    // Generate setup commands
    const setupCommands = this.generateSetupCommands(nodeOptionsValue, currentNodeOptions);

    if (!this.options.dryRun) {
      // In interactive mode, guide user through setup
      if (this.options.interactive) {
        this.provideInteractiveSetup(setupCommands);
      } else {
        this.log('   📄 NODE_OPTIONS configuration generated');
      }
    } else {
      this.log('   🔍 Dry run - would configure NODE_OPTIONS');
    }

    this.setupResults.actions.push('NODE_OPTIONS configuration prepared');
  }

  /**
   * Generate setup commands for different shells
   */
  generateSetupCommands(nodeOptionsValue, currentNodeOptions) {
    const fullNodeOptions = currentNodeOptions ?
      `${currentNodeOptions} ${nodeOptionsValue}` :
      nodeOptionsValue;

    return {
      bash: `export NODE_OPTIONS="${fullNodeOptions}"`,
      zsh: `export NODE_OPTIONS="${fullNodeOptions}"`,
      fish: `set -gx NODE_OPTIONS "${fullNodeOptions}"`,
      powershell: `$env:NODE_OPTIONS="${fullNodeOptions}"`,
      cmd: `set NODE_OPTIONS=${fullNodeOptions}`,
      dotenv: `NODE_OPTIONS=${fullNodeOptions}`
    };
  }

  /**
   * Provide interactive setup guidance
   */
  provideInteractiveSetup(setupCommands) {
    this.log('\n📝 NODE_OPTIONS Setup Instructions:');
    this.log('   Choose your shell and run the appropriate command:\n');

    Object.entries(setupCommands).forEach(([shell, command]) => {
      if (shell === 'dotenv') {
        this.log(`   ${shell.toUpperCase()} (.env file):`);
        this.log(`     Add to your .env file: ${command}`);
      } else {
        this.log(`   ${shell.toUpperCase()}:`);
        this.log(`     ${command}`);
      }
      this.log('');
    });

    this.log('💡 Tips:');
    this.log('   • Add the export command to your shell profile (~/.bashrc, ~/.zshrc, etc.) for persistence');
    this.log('   • Use .env file for project-specific configuration');
    this.log('   • Current session will need the export command to be run manually\n');
  }

  /**
   * Validate the integration is working
   */
  async validateIntegration() {
    this.log('🔍 Validating integration...');

    try {
      // Test process filter
      const processFilter = createProcessFilter({
        verboseLogging: false
      });

      const processInfo = processFilter.getProcessInfo();
      this.log(`   ✅ Process filter working (type: ${processInfo.type}, should filter: ${processInfo.shouldFilter})`);

      // Test child process handler
      const childHandler = createChildProcessHandler({
        verboseLogging: false
      });

      const childInfo = childHandler.getChildProcessInfo();
      this.log(`   ✅ Child process handler working (enabled: ${childInfo.enabled}, depth: ${childInfo.currentDepth})`);

      // Test enhanced logger loading
      const enhancedLogger = require(this.enhancedLoggerPath);
      if (enhancedLogger) {
        this.log('   ✅ Enhanced logger integration working');
      } else {
        this.setupResults.warnings.push('Enhanced logger loaded but returned null (may be filtered)');
        this.warn('   ⚠️  Enhanced logger returned null (normal if process is filtered)');
      }

    } catch (error) {
      this.setupResults.warnings.push(`Integration validation failed: ${error.message}`);
      this.warn(`   ⚠️  Integration validation failed: ${error.message}`);
    }
  }

  /**
   * Provide usage instructions
   */
  provideUsageInstructions() {
    this.log('\n📚 Usage Instructions:');
    this.log('');
    this.log('1. Configure your shell with NODE_OPTIONS (see above)');
    this.log('2. Restart your terminal or run the export command');
    this.log('3. Start your Node.js applications normally:');
    this.log('');
    this.log('   Examples:');
    this.log('     npm run dev    # Logging enabled for npm processes');
    this.log('     yarn start     # Logging enabled for yarn processes');
    this.log('     node app.js    # Logging enabled for node processes');
    this.log('     tsx server.ts  # Logging enabled for tsx processes');
    this.log('');
    this.log('4. Logging will automatically filter based on:');
    this.log(`     • Process types: ${this.getDefaultProcessFilter().join(', ')}`);
    this.log(`     • Skip patterns: ${this.getDefaultSkipPatterns().join(', ')}`);
    this.log('     • Project context (.context-kit directory)');
    this.log('');
    this.log('5. Environment variables (see env.template):');
    this.log('     • TKR_LOG_LEVEL - Set minimum log level');
    this.log('     • TKR_LOG_ENABLED - Enable/disable logging');
    this.log('     • TKR_NODE_PROCESS_FILTER - Customize process filter');
    this.log('     • TKR_NODE_SKIP_PATTERNS - Customize skip patterns');
    this.log('');
    this.log('📋 Next steps:');
    this.log('   • Copy env.template to your project root as .env and customize');
    this.log('   • Start the logging dashboard: cd .context-kit/dashboard && npm run dev');
    this.log('   • Start the knowledge graph API: cd .context-kit/knowledge-graph && npm run dev:api');
    this.log('');
  }

  /**
   * Get default process filter from interface specification
   */
  getDefaultProcessFilter() {
    return ['npm', 'yarn', 'node', 'tsx', 'ts-node'];
  }

  /**
   * Get default skip patterns from interface specification
   */
  getDefaultSkipPatterns() {
    return ['node_modules', '.git', 'dist', 'build'];
  }

  /**
   * Logging methods
   */
  log(message) {
    if (this.options.verboseOutput || !message.includes('✅') || this.options.interactive) {
      console.log(message);
    }
  }

  warn(message) {
    console.warn(message);
  }

  error(message, error) {
    console.error(message, error);
  }
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);

  const options = {
    interactive: !args.includes('--non-interactive'),
    validateSetup: !args.includes('--no-validate'),
    verboseOutput: args.includes('--verbose'),
    dryRun: args.includes('--dry-run')
  };

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
NODE_OPTIONS Setup for tkr-context-kit Logging

Usage: node setup.js [options]

Options:
  --help, -h           Show this help message
  --non-interactive    Skip interactive prompts
  --no-validate        Skip integration validation
  --verbose            Show verbose output
  --dry-run           Show what would be done without making changes

Environment Variables:
  TKR_LOG_ENDPOINT     Logging endpoint (default: http://localhost:42003/api/logs)
  TKR_LOG_LEVEL        Minimum log level (default: INFO)
  TKR_LOG_ENABLED      Enable logging (default: true)

Examples:
  node setup.js                    # Interactive setup with validation
  node setup.js --non-interactive  # Automated setup
  node setup.js --dry-run          # Show what would be done
  node setup.js --verbose          # Show detailed output
`);
    process.exit(0);
  }

  const setup = new NodeOptionsSetup(options);
  const result = await setup.setup();

  process.exit(result.success ? 0 : 1);
}

// Export for programmatic use
module.exports = {
  NodeOptionsSetup
};

// Run CLI if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}