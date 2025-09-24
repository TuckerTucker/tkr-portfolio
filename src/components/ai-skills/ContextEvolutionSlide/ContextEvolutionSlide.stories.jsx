import { ContextEvolutionSlide } from './';

export default {
  title: 'AI Skills/ContextEvolutionSlide',
  component: ContextEvolutionSlide,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'YAML optimization visualization showing evolution from 1000→300 lines with syntax highlighting, before/after metrics, and problem/solution indicators.',
      },
    },
  },
  argTypes: {
    beforeCode: {
      control: 'text',
      description: 'YAML code before optimization',
    },
    afterCode: {
      control: 'text',
      description: 'YAML code after optimization',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

const Template = (args) => <ContextEvolutionSlide {...args} />;

// Sample YAML code data
const sampleBeforeCode = `# Project configuration for AI agents - tkr-context-kit
# Comprehensive development toolkit configuration

meta:
  kit: tkr-context-kit
  format: 14
  type: development-toolkit
  description: "Advanced multi-service Claude Code enhancement toolkit"
  version: "3.4.0"
  author: "Tucker github.com/tuckertucker"
  timestamp: "2025-01-22"
  status: production-ready
  entry: "setup"

# Technology stack configuration
tech_stack:
  primary_language: TypeScript
  frontend_framework: React
  version: 18
  flow_library: ReactFlow
  database: SQLite
  protocol: MCP
  architecture: Service-Oriented Architecture
  logging: Comprehensive Logging
  orchestration: Multi-Service Orchestration
  workspace: Workspace Management

# Command definitions
commands:
  setup_command: "./setup"
  build_command: "npm run build"
  dev_command: "npm run dev"
  mcp_setup: ".context-kit/scripts/setup-context-kit-mcp"
  start_all: ".context-kit/scripts/start-all"

# Project achievements
achievements:
  - "33,705-file comprehensive project ecosystem"
  - "Workspace-based service coordination"
  - "Multi-service architecture"
  - "Enterprise logging integration"
  - "Zero-conflict service orchestration"

# Dependencies configuration
dependencies:
  workspace_root:
    name: "tkr-project-kit"
    version: "3.4.0"
    type: "workspace-root"
    workspaces:
      - core
      - dashboard
      - knowledge-graph
      - logging-client
      - mcp
    scripts:
      - build
      - dev
      - install:all
      - install:workspaces

  core:
    name: "@tkr-context-kit/core"
    version: "1.0.0"
    type: "unified-library"
    production_dependencies:
      better-sqlite3:
        id: "/wiselibs/better-sqlite3"
        version: "^9.6.0"
      nanoid:
        id: "/ai/nanoid"
        version: "^5.0.0"
      pino:
        id: "/pinojs/pino"
        version: "^8.16.0"
      pino-pretty:
        id: "/pinojs/pino-pretty"
        version: "^10.2.0"`;

const sampleAfterCode = `# _context-kit.yml
meta: &meta
  kit: tkr-context-kit
  fmt: 14
  type: development-toolkit
  desc: "Advanced multi-service Claude Code enhancement toolkit with integrated services, MCP server, and comprehensive logging ecosystem"
  ver: "3.4.0"
  author: "Tucker github.com/tuckertucker"
  ts: "2025-01-22"
  status: production-ready
  entry: "setup"
  stack: &tech-stack "TypeScript + React 18 + ReactFlow + SQLite + MCP + Service-Oriented Architecture + Comprehensive Logging + Multi-Service Orchestration + Workspace Management"
  cmds: ["./setup", "npm run build", "npm run dev", ".context-kit/scripts/setup-context-kit-mcp", ".context-kit/scripts/start-all"]
  achievements: ["33,705-file comprehensive project ecosystem", "Workspace-based service coordination", "Multi-service architecture", "Enterprise logging integration", "Zero-conflict service orchestration", "Unified core module with comprehensive type definitions", "Advanced port management", "AI-enhanced development workflows"]

deps: &deps
  workspace_root: &root-deps
    meta: {name: "tkr-project-kit", ver: "3.4.0", type: "workspace-root", workspaces: [core, dashboard, knowledge-graph, logging-client, mcp]}
    scripts: ["build", "dev", "install:all", "install:workspaces"]

  core: &core-deps
    meta: {name: "@tkr-context-kit/core", ver: "1.0.0", type: "unified-library"}
    prod:
      better-sqlite3: {id: "/wiselibs/better-sqlite3", v: "^9.6.0"}
      nanoid: {id: "/ai/nanoid", v: "^5.0.0"}
      pino: {id: "/pinojs/pino", v: "^8.16.0"}
      pino-pretty: {id: "/pinojs/pino-pretty", v: "^10.2.0"}

arch:
  stack: *tech-stack
  modules: ["Unified Core (Shared Types)", "Dashboard (React UI)", "Knowledge Graph (Backend API)", "Logging Client", "MCP Integration"]`;

const sampleBeforeMetrics = {
  lines: 1247,
  characters: 45680,
  duplications: 127,
  redundancy: '34%',
  maintainability: 'Poor',
  readability: 'Verbose'
};

const sampleAfterMetrics = {
  lines: 342,
  characters: 12450,
  duplications: 8,
  redundancy: '2%',
  maintainability: 'Excellent',
  readability: 'Clean'
};

const sampleProblems = [
  'Repetitive configuration blocks',
  'Verbose dependency declarations',
  'Scattered metadata across sections',
  'Manual version synchronization needed',
  'Difficult to maintain consistency'
];

const sampleSolutions = [
  'YAML anchors and references',
  'Semantic compression patterns',
  'Unified metadata structure',
  'Automated version management',
  'DRY principle implementation'
];

const sampleOptimizations = [
  {
    type: 'Structure',
    description: 'Consolidated metadata using YAML anchors',
    impact: '65% reduction in redundancy'
  },
  {
    type: 'Dependencies',
    description: 'Compressed dependency declarations',
    impact: '73% fewer lines for same information'
  },
  {
    type: 'Readability',
    description: 'Improved semantic organization',
    impact: '2x faster configuration parsing'
  }
];

// Default story
export const Default = Template.bind({});
Default.args = {
  beforeCode: sampleBeforeCode,
  afterCode: sampleAfterCode,
  beforeMetrics: sampleBeforeMetrics,
  afterMetrics: sampleAfterMetrics,
  problems: sampleProblems,
  solutions: sampleSolutions,
  optimizations: sampleOptimizations,
};

// Minimal example with shorter code
export const MinimalExample = Template.bind({});
MinimalExample.args = {
  beforeCode: `# Before optimization
dependencies:
  react:
    name: "react"
    version: "^18.2.0"
    type: "production"
  react-dom:
    name: "react-dom"
    version: "^18.2.0"
    type: "production"`,
  afterCode: `# After optimization
deps: &deps
  react: {name: "react", v: "^18.2.0", type: "prod"}
  react-dom: {name: "react-dom", v: "^18.2.0", type: "prod"}`,
  beforeMetrics: {
    lines: 12,
    characters: 245,
    redundancy: '45%'
  },
  afterMetrics: {
    lines: 4,
    characters: 98,
    redundancy: '5%'
  },
  problems: ['Verbose structure', 'Repetitive patterns'],
  solutions: ['YAML anchors', 'Compact notation'],
};

// Focus on problems and solutions
export const ProblemSolutionFocus = Template.bind({});
ProblemSolutionFocus.args = {
  ...Default.args,
  problems: [
    'Configuration file grew to 1000+ lines',
    'Developer cognitive load too high',
    'Maintenance becoming difficult',
    'Duplicate information everywhere',
    'Version sync errors frequent'
  ],
  solutions: [
    'Applied semantic YAML anchoring',
    'Implemented DRY principles',
    'Created unified metadata structure',
    'Automated consistency checks',
    'Reduced to 300 essential lines'
  ],
};

// Mobile preview
export const MobilePreview = Template.bind({});
MobilePreview.args = {
  ...MinimalExample.args,
};
MobilePreview.parameters = {
  viewport: {
    defaultViewport: 'mobile1',
  },
};