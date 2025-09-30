/**
 * Process Detection for Enhanced Logging
 * Analyzes the current Node.js process to determine type and characteristics
 */

class ProcessDetector {
  constructor() {
    this.processInfo = null;
    this.detect();
  }

  /**
   * Detect and analyze the current process
   */
  detect() {
    if (typeof process === 'undefined') {
      this.processInfo = {
        type: 'browser',
        subtype: 'unknown',
        isDevelopment: false,
        isChildProcess: false,
        parentInfo: null,
        command: 'browser',
        args: []
      };
      return;
    }

    const argv = process.argv || [];
    const execPath = process.execPath || '';
    const env = process.env || {};
    const title = process.title || '';

    // Determine if this is a development environment
    const isDevelopment = env.NODE_ENV === 'development' ||
                         env.NODE_ENV === 'dev' ||
                         !env.NODE_ENV ||
                         argv.some(arg => arg.includes('--inspect')) ||
                         argv.some(arg => arg.includes('--watch')) ||
                         env.npm_lifecycle_event === 'dev' ||
                         env.npm_lifecycle_event === 'start';

    // Check if this is a child process
    const isChildProcess = !!process.send || !!env.CHILD_PROCESS || process.pid !== process.ppid;

    // Detect parent process info
    const parentInfo = this.detectParentProcess();

    // Determine process type and subtype
    const { type, subtype } = this.determineProcessType(argv, execPath, env, title);

    // Get the main command being executed
    const command = this.extractCommand(argv, execPath);

    this.processInfo = {
      type,
      subtype,
      isDevelopment,
      isChildProcess,
      parentInfo,
      command,
      args: argv.slice(2), // Arguments after node and script
      execPath,
      title,
      pid: process.pid,
      ppid: process.ppid,
      cwd: process.cwd(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    };
  }

  /**
   * Determine the process type and subtype with enhanced detection
   */
  determineProcessType(argv, execPath, env, title) {
    const argvStr = argv.join(' ').toLowerCase();
    const execPathLower = execPath.toLowerCase();

    // Enhanced terminal process detection
    if (this.isTerminalProcess(env, argv, title)) {
      const shellType = this.detectShellType(argv, title, env);
      return { type: 'terminal', subtype: shellType };
    }

    // NPM processes
    if (env.npm_lifecycle_event || env.npm_config_user_config || argvStr.includes('npm') || title.includes('npm')) {
      const script = env.npm_lifecycle_event || 'unknown';
      return {
        type: 'npm',
        subtype: script // start, dev, build, test, etc.
      };
    }

    // Yarn processes
    if (env.YARN_WRAP_OUTPUT || argvStr.includes('yarn') || title.includes('yarn')) {
      return {
        type: 'yarn',
        subtype: env.npm_lifecycle_event || 'unknown'
      };
    }

    // Enhanced Vite dev server detection
    if (argvStr.includes('vite') || env.VITE_USER_NODE_ENV || env.VITE_CJS_IGNORE_WARNING) {
      if (argvStr.includes('dev') || argvStr.includes('serve') || env.npm_lifecycle_event === 'dev') {
        return { type: 'dev-server', subtype: 'vite' };
      }
      if (argvStr.includes('build') || env.npm_lifecycle_event === 'build') {
        return { type: 'build-tool', subtype: 'vite' };
      }
      if (argvStr.includes('preview') || env.npm_lifecycle_event === 'preview') {
        return { type: 'dev-server', subtype: 'vite-preview' };
      }
      return { type: 'dev-tool', subtype: 'vite' };
    }

    // React development server
    if (argvStr.includes('react-scripts') || env.REACT_APP_NODE_ENV) {
      return { type: 'dev-server', subtype: 'react' };
    }

    // Next.js
    if (argvStr.includes('next') || env.NEXT_PHASE) {
      return { type: 'dev-server', subtype: 'nextjs' };
    }

    // TypeScript execution
    if (argvStr.includes('tsx') || argvStr.includes('ts-node') || execPathLower.includes('tsx')) {
      return { type: 'typescript', subtype: 'tsx' };
    }

    // Test runners
    if (argvStr.includes('jest') || env.JEST_WORKER_ID) {
      return { type: 'test-runner', subtype: 'jest' };
    }
    if (argvStr.includes('vitest') || env.VITEST) {
      return { type: 'test-runner', subtype: 'vitest' };
    }
    if (argvStr.includes('mocha')) {
      return { type: 'test-runner', subtype: 'mocha' };
    }

    // Build tools
    if (argvStr.includes('webpack') || env.WEBPACK_CLI_VERSION) {
      return { type: 'build-tool', subtype: 'webpack' };
    }
    if (argvStr.includes('rollup')) {
      return { type: 'build-tool', subtype: 'rollup' };
    }
    if (argvStr.includes('esbuild')) {
      return { type: 'build-tool', subtype: 'esbuild' };
    }

    // Electron
    if (argvStr.includes('electron') || env.ELECTRON_RUN_AS_NODE) {
      return { type: 'electron', subtype: 'main' };
    }

    // Express/HTTP servers
    if (argvStr.includes('express') || argvStr.includes('server') || env.PORT) {
      return { type: 'http-server', subtype: 'express' };
    }

    // CLI tools
    if (argv.length > 2 && !argv[1].endsWith('.js') && !argv[1].endsWith('.ts')) {
      return { type: 'cli-tool', subtype: 'node' };
    }

    // Default Node.js application
    return {
      type: 'node',
      subtype: argv[1] && argv[1].endsWith('.ts') ? 'typescript' : 'javascript'
    };
  }

  /**
   * Enhanced terminal process detection
   */
  isTerminalProcess(env, argv, title) {
    // Check TERM_PROGRAM for terminal applications
    if (env.TERM_PROGRAM) {
      const terminalApps = ['Apple_Terminal', 'iTerm.app', 'Terminal.app', 'Hyper', 'Alacritty', 'kitty'];
      if (terminalApps.includes(env.TERM_PROGRAM)) {
        return true;
      }
    }

    // Check for terminal environment variables
    if (env.TERM && env.TERM !== 'dumb') {
      // Check if this is a shell process
      const shells = ['bash', 'zsh', 'fish', 'sh', 'dash', 'csh', 'tcsh', 'ksh'];
      if (argv.length > 0) {
        const command = argv[0].split('/').pop();
        if (shells.includes(command)) {
          return true;
        }
      }

      // Check process title for shell indicators
      if (title && shells.some(shell => title.includes(shell))) {
        return true;
      }
    }

    // Check for SSH sessions
    if (env.SSH_CLIENT || env.SSH_TTY || env.SSH_CONNECTION) {
      return true;
    }

    return false;
  }

  /**
   * Detect the specific shell type
   */
  detectShellType(argv, title, env) {
    const shells = ['bash', 'zsh', 'fish', 'sh', 'dash', 'csh', 'tcsh', 'ksh'];

    // Check command line arguments
    if (argv.length > 0) {
      const command = argv[0].split('/').pop();
      if (shells.includes(command)) {
        return command;
      }
    }

    // Check process title
    if (title) {
      for (const shell of shells) {
        if (title.includes(shell)) {
          return shell;
        }
      }
    }

    // Check SHELL environment variable
    if (env.SHELL) {
      const shellFromEnv = env.SHELL.split('/').pop();
      if (shells.includes(shellFromEnv)) {
        return shellFromEnv;
      }
    }

    return 'unknown';
  }

  /**
   * Extract the main command being executed
   */
  extractCommand(argv, execPath) {
    if (argv.length === 0) return 'unknown';

    // For npm/yarn, use the script name
    if (process.env.npm_lifecycle_event) {
      return `npm run ${process.env.npm_lifecycle_event}`;
    }

    // For direct node execution, use the script name
    if (argv[1]) {
      const script = argv[1];
      const basename = script.split('/').pop() || script;
      return basename;
    }

    // Fallback to executable name
    return execPath.split('/').pop() || 'node';
  }

  /**
   * Detect parent process information with enhanced terminal detection
   */
  detectParentProcess() {
    try {
      const env = process.env || {};

      // Enhanced terminal detection using TERM_PROGRAM
      if (env.TERM_PROGRAM) {
        const terminalApps = {
          'Apple_Terminal': { type: 'terminal', name: 'Terminal.app' },
          'iTerm.app': { type: 'terminal', name: 'iTerm2' },
          'vscode': { type: 'vscode', name: 'VS Code Terminal' },
          'Terminal.app': { type: 'terminal', name: 'Terminal.app' },
          'Hyper': { type: 'terminal', name: 'Hyper' },
          'Alacritty': { type: 'terminal', name: 'Alacritty' },
          'kitty': { type: 'terminal', name: 'kitty' }
        };

        if (terminalApps[env.TERM_PROGRAM]) {
          return {
            ...terminalApps[env.TERM_PROGRAM],
            version: env.TERM_PROGRAM_VERSION || 'unknown',
            termType: env.TERM || 'unknown'
          };
        }
      }

      // npm parent info
      if (env.npm_config_user_config) {
        return {
          type: 'npm',
          version: env.npm_version || 'unknown'
        };
      }

      // yarn parent info
      if (env.YARN_WRAP_OUTPUT) {
        return {
          type: 'yarn',
          version: env.YARN_VERSION || 'unknown'
        };
      }

      // Tmux detection
      if (env.TMUX) {
        return {
          type: 'tmux',
          name: 'tmux',
          version: env.TMUX_VERSION || 'unknown'
        };
      }

      // Screen detection
      if (env.STY) {
        return {
          type: 'screen',
          name: 'GNU Screen',
          session: env.STY
        };
      }

      // SSH detection
      if (env.SSH_CLIENT || env.SSH_TTY || env.SSH_CONNECTION) {
        return {
          type: 'ssh',
          name: 'SSH Session',
          client: env.SSH_CLIENT || 'unknown'
        };
      }

      // Generic terminal info
      if (env.TERM && env.TERM !== 'dumb') {
        return {
          type: 'terminal',
          name: env.TERM,
          termType: env.TERM
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if the process should be logged (development filter)
   */
  shouldLog() {
    if (!this.processInfo) return false;

    // Always log in production
    if (!this.processInfo.isDevelopment) return true;

    // In development, filter out some noise
    const { type, subtype } = this.processInfo;

    // Skip some common development processes that generate noise
    if (type === 'npm' && ['audit', 'ls', 'outdated'].includes(subtype)) {
      return false;
    }

    // Skip background workers that don't need logging
    if (type === 'test-runner' && this.processInfo.isChildProcess) {
      return false;
    }

    return true;
  }

  /**
   * Get service name based on process type
   */
  getServiceName(fallback = 'UnknownService') {
    if (!this.processInfo) return fallback;

    const { type, subtype, command } = this.processInfo;

    // Try to get package name first
    const packageName = this.getPackageName();
    if (packageName && packageName !== 'UnknownService') {
      return packageName;
    }

    // Generate name based on process type
    if (type === 'npm' || type === 'yarn') {
      return `${type}-${subtype}`;
    }

    if (type === 'dev-server') {
      return `${subtype}-dev`;
    }

    if (type === 'test-runner') {
      return `${subtype}-tests`;
    }

    if (type === 'build-tool') {
      return `${subtype}-build`;
    }

    // Use command name as fallback
    if (command && command !== 'node' && command !== 'unknown') {
      return command.replace(/\.[^/.]+$/, ''); // Remove extension
    }

    return fallback;
  }

  /**
   * Get package name from package.json
   */
  getPackageName() {
    try {
      const fs = require('fs');
      const path = require('path');

      // Look for package.json starting from current directory
      let currentDir = this.processInfo?.cwd || process.cwd();
      while (currentDir !== path.dirname(currentDir)) {
        const packagePath = path.join(currentDir, 'package.json');
        if (fs.existsSync(packagePath)) {
          const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
          return packageJson.name || null;
        }
        currentDir = path.dirname(currentDir);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get component name based on process type
   */
  getComponentName() {
    if (!this.processInfo) return 'Process';

    const { type, subtype, isChildProcess } = this.processInfo;

    if (isChildProcess) {
      return `${type}-worker`;
    }

    if (type === 'dev-server') {
      return 'DevServer';
    }

    if (type === 'test-runner') {
      return 'Tests';
    }

    if (type === 'build-tool') {
      return 'Build';
    }

    if (type === 'npm' || type === 'yarn') {
      return 'PackageManager';
    }

    return 'Application';
  }

  /**
   * Get all process information
   */
  getProcessInfo() {
    return this.processInfo;
  }

  /**
   * Check if this is a development environment
   */
  isDevelopment() {
    return this.processInfo?.isDevelopment || false;
  }

  /**
   * Check if this process should be filtered out
   */
  shouldFilter() {
    return !this.shouldLog();
  }
}

// Singleton instance
let instance = null;

/**
 * Get the process detector singleton
 */
function getProcessDetector() {
  if (!instance) {
    instance = new ProcessDetector();
  }
  return instance;
}

module.exports = {
  ProcessDetector,
  getProcessDetector
};