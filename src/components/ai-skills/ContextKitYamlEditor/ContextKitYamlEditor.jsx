import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, RotateCcw, ChevronDown, ChevronUp, FileText, Zap } from 'lucide-react';

// Sample YAML data for demonstration
const sampleLongYaml = `# Traditional verbose project documentation - 1000+ lines
meta:
  name: "example-project"
  version: "1.0.0"
  description: "A comprehensive example project with extensive documentation"
  author: "Developer Name"
  license: "MIT"
  created: "2024-01-01"
  updated: "2024-09-23"

# Detailed project structure with full paths
structure:
  src:
    - name: "components"
      type: "directory"
      description: "React components directory containing all UI components"
      files:
        - name: "Button.jsx"
          type: "file"
          description: "Reusable button component with variants"
          size: "2.5KB"
          lastModified: "2024-09-20"
        - name: "Card.jsx"
          type: "file"
          description: "Card component for content containers"
          size: "1.8KB"
          lastModified: "2024-09-18"
        - name: "Modal.jsx"
          type: "file"
          description: "Modal component for overlays and dialogs"
          size: "3.2KB"
          lastModified: "2024-09-15"
    - name: "hooks"
      type: "directory"
      description: "Custom React hooks for shared logic"
      files:
        - name: "useAuth.js"
          type: "file"
          description: "Authentication hook with login/logout functionality"
          size: "4.1KB"
          lastModified: "2024-09-22"
        - name: "useApi.js"
          type: "file"
          description: "API integration hook with error handling"
          size: "2.9KB"
          lastModified: "2024-09-19"
  tests:
    - name: "components"
      type: "directory"
      description: "Component tests using Jest and React Testing Library"
      files:
        - name: "Button.test.jsx"
          type: "file"
          description: "Test suite for Button component"
          size: "1.5KB"
          lastModified: "2024-09-20"
        - name: "Card.test.jsx"
          type: "file"
          description: "Test suite for Card component"
          size: "1.2KB"
          lastModified: "2024-09-18"
  docs:
    - name: "README.md"
      type: "file"
      description: "Main project documentation"
      size: "8.5KB"
      lastModified: "2024-09-23"
    - name: "CONTRIBUTING.md"
      type: "file"
      description: "Guidelines for contributing to the project"
      size: "3.2KB"
      lastModified: "2024-09-01"

# Extensive dependency list with versions and descriptions
dependencies:
  production:
    react:
      version: "^18.2.0"
      description: "A JavaScript library for building user interfaces"
      purpose: "Core UI library"
      bundleSize: "42.2KB"
    react-dom:
      version: "^18.2.0"
      description: "React package for working with the DOM"
      purpose: "DOM rendering"
      bundleSize: "130.2KB"
    axios:
      version: "^1.5.0"
      description: "Promise based HTTP client for the browser and node.js"
      purpose: "HTTP requests"
      bundleSize: "13.4KB"
  development:
    vite:
      version: "^4.4.5"
      description: "Build tool that aims to provide a faster development experience"
      purpose: "Development server and build tool"
      bundleSize: "N/A"
    eslint:
      version: "^8.45.0"
      description: "Tool for identifying and reporting on patterns in JavaScript"
      purpose: "Code linting"
      bundleSize: "N/A"
    prettier:
      version: "^3.0.0"
      description: "Opinionated code formatter"
      purpose: "Code formatting"
      bundleSize: "N/A"

# Detailed scripts with explanations
scripts:
  development:
    start:
      command: "npm run dev"
      description: "Start the development server with hot reloading"
      port: 3000
      environment: "development"
    build:
      command: "npm run build"
      description: "Create production build with optimizations"
      outputDir: "dist"
      environment: "production"
    test:
      command: "npm test"
      description: "Run test suite with coverage reporting"
      coverage: true
      watchMode: false
  deployment:
    deploy:
      command: "npm run deploy"
      description: "Deploy to production environment"
      target: "production"
      requiresAuth: true

# Comprehensive environment configuration
environments:
  development:
    apiUrl: "http://localhost:8000/api"
    debug: true
    logLevel: "debug"
    enableHotReload: true
  staging:
    apiUrl: "https://staging-api.example.com"
    debug: false
    logLevel: "info"
    enableHotReload: false
  production:
    apiUrl: "https://api.example.com"
    debug: false
    logLevel: "error"
    enableHotReload: false`;

const sampleOptimizedYaml = `# AI-optimized project context - 300 lines, 70% compression
meta: {name: "example-project", ver: "1.0.0", type: "react-spa", stack: "React+Vite+TailwindCSS"}

# Token-efficient structure using anchors
struct: &base-structure
  src: {components: [Button.jsx, Card.jsx, Modal.jsx], hooks: [useAuth.js, useApi.js]}
  tests: {coverage: 85%, framework: "Jest+RTL"}

# Compressed dependencies with essential info
deps: &core-deps
  prod: {react: "^18.2.0", react-dom: "^18.2.0", axios: "^1.5.0"}
  dev: {vite: "^4.4.5", eslint: "^8.45.0", prettier: "^3.0.0"}

# Semantic anchors for AI context
patterns: &ui-patterns
  components: "Radix UI + CVA variants"
  styling: "Tailwind utility-first"
  state: "React hooks + context"

# Environment matrix
envs: &env-matrix
  dev: {api: "localhost:8000", debug: true}
  prod: {api: "api.example.com", debug: false}

# Optimized scripts
scripts: ["dev", "build", "test", "deploy"]

# Key achievements and metrics
achievements: ["85% test coverage", "Bundle size <200KB", "Lighthouse 95+", "Zero security vulns"]
`;

const ContextKitYamlEditor = ({ className = "" }) => {
  const [activeTab, setActiveTab] = useState('before');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const beforeRef = useRef(null);
  const afterRef = useRef(null);

  // Metrics for the optimization demonstration
  const metrics = {
    before: {
      lines: 156,
      characters: 4850,
      tokens: 1200,
      readability: 65
    },
    after: {
      lines: 47,
      characters: 1455,
      tokens: 360,
      readability: 95
    }
  };

  const compression = {
    lines: Math.round((1 - metrics.after.lines / metrics.before.lines) * 100),
    characters: Math.round((1 - metrics.after.characters / metrics.before.characters) * 100),
    tokens: Math.round((1 - metrics.after.tokens / metrics.before.tokens) * 100)
  };

  const handleOptimize = () => {
    setIsAnimating(true);
    setShowMetrics(false);

    // Animate the optimization process
    setTimeout(() => {
      setActiveTab('after');
      setTimeout(() => {
        setShowMetrics(true);
        setIsAnimating(false);
      }, 500);
    }, 1000);
  };

  const handleReset = () => {
    setActiveTab('before');
    setShowMetrics(false);
    setIsAnimating(false);
  };

  const highlightYaml = (yaml) => {
    return yaml
      .split('\n')
      .map((line, i) => {
        let highlightedLine = line;

        // Highlight anchors and aliases
        highlightedLine = highlightedLine.replace(/&[\w-]+/g, '<span class="text-blue-500 font-semibold">$&</span>');
        highlightedLine = highlightedLine.replace(/\*[\w-]+/g, '<span class="text-purple-500 font-semibold">$&</span>');

        // Highlight keys
        highlightedLine = highlightedLine.replace(/^(\s*)([\w-]+)(:)/g, '$1<span class="text-emerald-600 font-medium">$2</span>$3');

        // Highlight comments
        highlightedLine = highlightedLine.replace(/(#.*$)/g, '<span class="text-gray-500 italic">$1</span>');

        // Highlight strings
        highlightedLine = highlightedLine.replace(/"([^"]+)"/g, '<span class="text-amber-600">"$1"</span>');

        return (
          <div key={i} className="font-mono text-sm leading-relaxed">
            <span className="text-gray-400 select-none mr-4 inline-block w-8 text-right">
              {i + 1}
            </span>
            <span dangerouslySetInnerHTML={{ __html: highlightedLine }} />
          </div>
        );
      });
  };

  return (
    <div className={`w-full max-w-6xl mx-auto p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <FileText className="text-blue-500" />
          Context-Kit YAML Optimizer
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Live demonstration of AI-powered YAML optimization for token efficiency and semantic clarity
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <Button
          onClick={handleOptimize}
          disabled={isAnimating || activeTab === 'after'}
          className="flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          {isAnimating ? 'Optimizing...' : 'Run Optimization'}
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isAnimating}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Demo
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          onClick={() => setActiveTab('before')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'before'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Before Optimization ({metrics.before.lines} lines)
        </button>
        <button
          onClick={() => setActiveTab('after')}
          disabled={activeTab === 'before' && !showMetrics}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'after'
              ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50'
          }`}
        >
          After Optimization ({metrics.after.lines} lines)
        </button>
      </div>

      {/* YAML Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-96 overflow-hidden">
            <div className="h-full relative">
              {isAnimating && (
                <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-blue-600 dark:text-blue-400 font-medium">Processing optimization...</p>
                  </div>
                </div>
              )}

              <div className="p-4 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
                {highlightYaml(activeTab === 'before' ? sampleLongYaml : sampleOptimizedYaml)}
              </div>
            </div>
          </Card>
        </div>

        {/* Metrics Panel */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Play className="w-4 h-4 text-green-500" />
              Optimization Metrics
            </h3>

            {showMetrics ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <span className="text-sm font-medium">Lines Reduced</span>
                  <span className="text-green-600 font-bold">{compression.lines}%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <span className="text-sm font-medium">Token Efficiency</span>
                  <span className="text-blue-600 font-bold">{compression.tokens}%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <span className="text-sm font-medium">Readability Score</span>
                  <span className="text-purple-600 font-bold">{metrics.after.readability}/100</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">
                Run optimization to see metrics
              </div>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Key Features</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <ChevronDown className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                Semantic anchors (&anchor)
              </li>
              <li className="flex items-start gap-2">
                <ChevronDown className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                YAML aliases (*reference)
              </li>
              <li className="flex items-start gap-2">
                <ChevronDown className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                Token-efficient syntax
              </li>
              <li className="flex items-start gap-2">
                <ChevronDown className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                AI-optimized structure
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContextKitYamlEditor;