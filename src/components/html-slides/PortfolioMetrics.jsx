import React from 'react';
import PropTypes from 'prop-types';

/**
 * PortfolioMetrics - Real metrics from analyzing tkr-portfolio
 * Shows actual results from the agent-based analysis system
 */
const PortfolioMetrics = ({ className = "" }) => {
  const metrics = {
    discovery: {
      title: 'Components Discovered',
      total: 33,
      breakdown: [
        { name: 'HTML Slides', count: 18, icon: '🎨', color: '#3b82f6' },
        { name: 'Layout', count: 8, icon: '📐', color: '#8b5cf6' },
        { name: 'UI Components', count: 7, icon: '🧩', color: '#10b981' }
      ]
    },
    relationships: {
      title: 'Relationships Mapped',
      total: 62,
      breakdown: [
        { name: 'DEPENDS_ON', count: 45, icon: '🔗', description: 'Import dependencies' },
        { name: 'USES_HOOK', count: 12, icon: '🪝', description: 'React hooks usage' },
        { name: 'DATA_FLOW', count: 5, icon: '📊', description: 'Props & state flow' }
      ]
    },
    efficiency: {
      title: 'Context Efficiency',
      yamlSize: '2.1 KB',
      sourceSize: '156 KB',
      compressionRatio: '74x',
      tokenReduction: '91%',
      items: [
        { label: 'YAML Context', value: '2.1 KB', percentage: 1.3, color: 'green' },
        { label: 'Full Source', value: '156 KB', percentage: 100, color: 'red' }
      ]
    },
    performance: {
      title: 'Agent Performance',
      items: [
        { label: 'Sequential Time', value: '12-15s', color: 'red' },
        { label: 'Parallel Time', value: '4-7s', color: 'yellow' },
        { label: 'With YAML', value: 'Instant', color: 'green' }
      ]
    },
    contextWindow: {
      title: 'Context Window Usage',
      total: 200000,
      items: [
        { label: 'Without YAML', tokens: 16400, percentage: 8.2 },
        { label: 'With YAML', tokens: 2200, percentage: 1.1 }
      ]
    }
  };

  return (
    <div className={`flex flex-col h-full p-4 md:p-6 ${className}`}>
      <h2 className="font-heading text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--slide-title)' }}>
        Real Portfolio Analysis Results
      </h2>
      <p className="text-sm mb-4 opacity-80" style={{ color: 'var(--slide-text)' }}>
        Actual metrics from analyzing tkr-portfolio with parallel agents
      </p>

      <div className="grid lg:grid-cols-2 gap-3 overflow-y-auto flex-1 pr-2">
        {/* Left Column: All Stats */}
        <div className="space-y-3">
          {/* Components Discovered */}
          <div
            className="p-4 rounded-lg flex flex-col"
            style={{
              backgroundColor: 'var(--slide-card-bg)',
              border: '1px solid var(--slide-card-border)'
            }}
          >
            <h3 className="font-semibold text-base mb-3" style={{ color: 'var(--slide-title)' }}>
              {metrics.discovery.title}
            </h3>
            <div className="text-4xl font-bold mb-3 text-center" style={{ color: 'var(--slide-text)' }}>
              {metrics.discovery.total}
            </div>
            <div className="space-y-2 flex-1">
              {metrics.discovery.breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-xs" style={{ color: 'var(--slide-text)' }}>{item.name}</span>
                  </div>
                  <span className="font-bold text-base" style={{ color: item.color }}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Relationships */}
          <div
            className="p-4 rounded-lg flex flex-col"
            style={{
              backgroundColor: 'var(--slide-card-bg)',
              border: '1px solid var(--slide-card-border)'
            }}
          >
            <h3 className="font-semibold text-base mb-3" style={{ color: 'var(--slide-title)' }}>
              {metrics.relationships.title}
            </h3>
            <div className="text-4xl font-bold mb-3 text-center" style={{ color: 'var(--slide-text)' }}>
              {metrics.relationships.total}
            </div>
            <div className="space-y-2 flex-1">
              {metrics.relationships.breakdown.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-xs font-medium" style={{ color: 'var(--slide-text)' }}>
                        {item.name}
                      </span>
                    </div>
                    <span className="font-bold text-sm" style={{ color: 'var(--slide-text)' }}>
                      {item.count}
                    </span>
                  </div>
                  <div className="text-xs opacity-60 pl-6" style={{ color: 'var(--slide-text)' }}>
                    {item.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compression Ratio */}
          <div
            className="p-4 rounded-lg flex flex-col"
            style={{
              backgroundColor: 'var(--slide-card-bg)',
              border: '1px solid var(--slide-card-border)'
            }}
          >
            <h3 className="font-semibold text-base mb-3" style={{ color: 'var(--slide-title)' }}>
              {metrics.efficiency.title}
            </h3>
            <div className="space-y-3 flex-1">
              <div className="text-center py-2">
                <div className="text-4xl font-bold text-green-500">
                  {metrics.efficiency.compressionRatio}
                </div>
                <div className="text-xs opacity-80 mt-1" style={{ color: 'var(--slide-text)' }}>
                  Smaller with YAML
                </div>
              </div>
              <div className="space-y-2">
                {metrics.efficiency.items.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-0.5">
                      <span className="text-xs" style={{ color: 'var(--slide-text)' }}>{item.label}</span>
                      <span className={`font-mono font-bold text-sm text-${item.color}-500`}>
                        {item.value}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${item.color}-500`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t text-center" style={{ borderColor: 'var(--slide-card-border)' }}>
                <div className="text-2xl font-bold text-green-500">
                  {metrics.efficiency.tokenReduction}
                </div>
                <div className="text-xs opacity-80" style={{ color: 'var(--slide-text)' }}>
                  Token Reduction
                </div>
              </div>
            </div>
          </div>

          {/* Agent Performance */}
          <div
            className="p-4 rounded-lg flex flex-col"
            style={{
              backgroundColor: 'var(--slide-card-bg)',
              border: '1px solid var(--slide-card-border)'
            }}
          >
            <h3 className="font-semibold text-base mb-3" style={{ color: 'var(--slide-title)' }}>
              {metrics.performance.title}
            </h3>
            <div className="space-y-2 flex-1">
              {metrics.performance.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    border: `1px solid ${
                      item.color === 'red' ? '#ef4444' :
                      item.color === 'yellow' ? '#f59e0b' :
                      '#10b981'
                    }`
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: 'var(--slide-text)' }}>
                      {item.label}
                    </span>
                    <span className={`font-mono font-bold text-sm text-${item.color}-500`}>
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
              <div className="pt-2 text-center">
                <div className="text-xs opacity-60" style={{ color: 'var(--slide-text)' }}>
                  Analysis of 33 components<br />with parallel agents
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: YAML Sample */}
        <div
          className="p-4 rounded-lg flex flex-col"
          style={{
            backgroundColor: 'var(--slide-card-bg)',
            border: '1px solid var(--slide-card-border)'
          }}
        >
          <h3 className="font-semibold text-base mb-3" style={{ color: 'var(--slide-title)' }}>
            📄 tkr-portfolio YAML
          </h3>
          <div className="flex-1 overflow-y-auto">
            <pre
              className="text-xs font-mono leading-relaxed whitespace-pre-wrap"
              style={{ color: 'var(--slide-text)' }}
            >
{`meta:
  kit: tkr-portfolio
  type: portfolio-website
  stack: "React 19 + Vite + Tailwind"

arch:
  patterns:
    - "Component-based architecture"
    - "Theme system with CSS variables"
    - "Responsive design mobile-first"
    - "Storybook component library"

  components:
    layout: [Header, CustomProjectPicker, ImageCarousel]
    slides: [ProjectIntro, InteractiveCards, TicTacToe]
    ui: [Toggle, Button, Badge]

struct:
  src:
    components:
      layout: {n: 8, desc: "Layout components"}
      html-slides: {n: 18, desc: "Interactive slides"}
      ui: {n: 7, desc: "UI primitives"}

design:
  tokens:
    color:
      primary: "#6366f1"
      secondary: "#10b981"
      accent: "#8b5cf6"
    typography:
      heading: "graphite-std"
      body: "ellograph-cf"`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

PortfolioMetrics.propTypes = {
  className: PropTypes.string
};

export default PortfolioMetrics;