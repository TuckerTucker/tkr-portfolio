import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * YAMLContextViewer - Interactive demonstration of YAML context system
 * Shows token efficiency and toggleable sections
 */
const YAMLContextViewer = ({ className = "" }) => {
  const [sections, setSections] = useState([
    {
      id: 'source',
      name: 'Full Component Source',
      icon: '📄',
      enabled: false,
      tokens: 45000,
      description: 'Complete source code (exceeds context!)',
      example: `// TicTacToe.jsx (155 lines)
// InteractiveCards.jsx (187 lines)
// ... 31 more files
// Total: ~2600 lines`
    },
    {
      id: 'structure',
      name: 'Project Structure',
      icon: '📁',
      enabled: true,
      tokens: 500,
      description: '33 components organized by category',
      example: `struct:
  src/components:
    html-slides: {n: 18}
    layout: {n: 8}
    ui: {n: 7}`
    },
    {
      id: 'relationships',
      name: 'Component Relationships',
      icon: '🔗',
      enabled: true,
      tokens: 400,
      description: 'Import chains and dependencies',
      example: `relationships:
  TicTacToe:
    - imports: [useState, useEffect]
    - exports: default
    - used_by: [index.js]`
    },
    {
      id: 'design',
      name: 'Design System',
      icon: '🎨',
      enabled: true,
      tokens: 300,
      description: 'Colors from projects.json brands',
      example: `design:
  colors:
    tucker: "#613CB0"
    kanban: "#FF8800"
    contextkit: "#8B5CF6"`
    },
    {
      id: 'architecture',
      name: 'Data Architecture',
      icon: '⚙️',
      enabled: true,
      tokens: 200,
      description: 'How projects.json drives slides',
      example: `arch:
  flow: "projects.json →
         ProjectDetail →
         HTMLSlide components"`
    }
  ]);

  const [showComparison, setShowComparison] = useState(false);

  const contextWindowSize = 200000;
  const enabledTokens = sections.filter(s => s.enabled).reduce((sum, s) => sum + s.tokens, 0);
  const percentageUsed = (enabledTokens / contextWindowSize) * 100;

  const toggleSection = (id) => {
    setSections(prev => prev.map(section =>
      section.id === id ? { ...section, enabled: !section.enabled } : section
    ));
  };

  const handleToggleAll = (enable) => {
    if (enable) {
      setSections(prev => prev.map(s => ({ ...s, enabled: true })));
    } else {
      setSections(prev => prev.map(s => s.id !== 'source' ? { ...s, enabled: true } : { ...s, enabled: false }));
    }
  };

  return (
    <div className={`flex flex-col h-full p-4 md:p-6 ${className}`}>
      <h2 className="font-heading text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--slide-title)' }}>
        The YAML Context System
      </h2>
      <p className="text-sm mb-4 opacity-80" style={{ color: 'var(--slide-text)' }}>
        Toggle sections to see how YAML compresses project context efficiently
      </p>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* Left: Toggleable Sections */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => handleToggleAll(false)}
              className="px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--slide-card-bg)',
                border: '1px solid var(--slide-card-border)',
                color: 'var(--slide-text)'
              }}
            >
              ✅ Optimal
            </button>
            <button
              onClick={() => handleToggleAll(true)}
              className="px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--slide-card-bg)',
                border: '1px solid var(--slide-card-border)',
                color: 'var(--slide-text)'
              }}
            >
              ⚠️ Include All
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 pr-2 pl-1 pt-1">
            {sections.map((section) => (
              <div
                key={section.id}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  section.enabled ? 'ring-2 ring-green-500 ring-offset-1' : 'opacity-60'
                }`}
                style={{
                  backgroundColor: 'var(--slide-card-bg)',
                  border: '1px solid var(--slide-card-border)'
                }}
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={() => toggleSection(section.id)}
                      className="w-4 h-4 rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-xl">{section.icon}</span>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: 'var(--slide-text)' }}>
                        {section.name}
                      </div>
                      <div className="text-xs opacity-60" style={{ color: 'var(--slide-text)' }}>
                        {section.description}
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm font-mono font-bold ${
                    section.tokens > 10000 ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {section.tokens.toLocaleString()}
                  </div>
                </div>

                {section.enabled && (
                  <div className="mt-2 pl-7">
                    <pre
                      className="text-xs font-mono p-2 rounded overflow-x-auto"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        color: 'var(--slide-text)'
                      }}
                    >
                      {section.example}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Metrics & Visualization */}
        <div className="lg:w-80 flex flex-col gap-3 min-h-0">
          {/* Token Counter */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--slide-card-bg)',
              border: '1px solid var(--slide-card-border)'
            }}
          >
            <h3 className="font-semibold text-base mb-3" style={{ color: 'var(--slide-title)' }}>
              📊 Context Window Usage
            </h3>
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-xs opacity-80" style={{ color: 'var(--slide-text)' }}>
                  Tokens Used
                </span>
                <span className="font-mono font-bold text-base" style={{ color: 'var(--slide-text)' }}>
                  {enabledTokens.toLocaleString()}
                </span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    percentageUsed > 50 ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs opacity-60" style={{ color: 'var(--slide-text)' }}>
                  0
                </span>
                <span className="text-xs opacity-60" style={{ color: 'var(--slide-text)' }}>
                  {percentageUsed.toFixed(1)}%
                </span>
                <span className="text-xs opacity-60" style={{ color: 'var(--slide-text)' }}>
                  {contextWindowSize.toLocaleString()}
                </span>
              </div>
            </div>

            {percentageUsed > 50 && (
              <div className="p-2 rounded-lg bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30">
                <div className="text-xs font-medium text-red-500">
                  ⚠️ Context window overload!
                </div>
                <div className="text-xs mt-1 opacity-80" style={{ color: 'var(--slide-text)' }}>
                  Disable "Full Component Source"
                </div>
              </div>
            )}

            {percentageUsed <= 50 && (
              <div className="p-2 rounded-lg bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30">
                <div className="text-xs font-medium text-green-500">
                  ✅ Optimal context usage
                </div>
                <div className="text-xs mt-1 opacity-80" style={{ color: 'var(--slide-text)' }}>
                  Efficient YAML compression
                </div>
              </div>
            )}
          </div>

          {/* Before/After Comparison */}
          <div
            className="p-4 rounded-lg flex-1"
            style={{
              backgroundColor: 'var(--slide-card-bg)',
              border: '1px solid var(--slide-card-border)'
            }}
          >
            <h3 className="font-semibold text-base mb-3" style={{ color: 'var(--slide-title)' }}>
              💾 Compression Benefits
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs opacity-80" style={{ color: 'var(--slide-text)' }}>
                    Without YAML
                  </span>
                  <span className="font-mono font-bold text-sm text-red-500">
                    16,400
                  </span>
                </div>
                <div className="text-xs opacity-60 mb-1" style={{ color: 'var(--slide-text)' }}>
                  Manual file reading
                </div>
                <div className="h-1.5 bg-red-200 dark:bg-red-900 rounded-full" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs opacity-80" style={{ color: 'var(--slide-text)' }}>
                    With YAML
                  </span>
                  <span className="font-mono font-bold text-sm text-green-500">
                    {sections.filter(s => s.id !== 'source').reduce((sum, s) => sum + s.tokens, 0).toLocaleString()}
                  </span>
                </div>
                <div className="text-xs opacity-60 mb-1" style={{ color: 'var(--slide-text)' }}>
                  Compressed context
                </div>
                <div className="h-1.5 bg-green-200 dark:bg-green-900 rounded-full" style={{ width: '30%' }} />
              </div>

              <div className="pt-2 border-t" style={{ borderColor: 'var(--slide-card-border)' }}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    91%
                  </div>
                  <div className="text-xs opacity-80" style={{ color: 'var(--slide-text)' }}>
                    Token Reduction
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-2 text-xs opacity-80" style={{ color: 'var(--slide-text)' }}>
                <div className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Loaded in every conversation</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>✓</span>
                  <span>No repetitive exploration</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Immediate comprehension</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

YAMLContextViewer.propTypes = {
  className: PropTypes.string
};

export default YAMLContextViewer;