import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * ContextEvolutionSlide - YAML optimization visualization showing evolution from 1000→300 lines
 * Features syntax highlighting, before/after metrics, and problem/solution indicators
 *
 * Features:
 * - Before/after YAML code comparison
 * - Syntax highlighting for YAML
 * - Metrics showing line reduction (1000→300)
 * - Problem/solution indicators
 * - Theme-aware code display
 * - Mobile-responsive layout
 */
const ContextEvolutionSlide = ({
  beforeCode = '',
  afterCode = '',
  beforeMetrics = {},
  afterMetrics = {},
  problems = [],
  solutions = [],
  optimizations = [],
  className,
  beforeStats, // Extract custom props to prevent DOM warnings
  afterStats,
  isMobile, // Extract isMobile prop to prevent DOM warnings
  ...props
}) => {
  const [activeView, setActiveView] = useState('before');
  const [isMobileState, setIsMobileState] = useState(false);

  // Check if the screen is mobile-sized
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileState(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Simple YAML syntax highlighter
  const highlightYAML = (code) => {
    if (!code) return '';

    return code
      .split('\n')
      .map((line, index) => {
        let highlightedLine = line;

        // Comments
        highlightedLine = highlightedLine.replace(
          /(#.*)/g,
          '<span class="text-green-600 dark:text-green-400">$1</span>'
        );

        // Keys (before colon)
        highlightedLine = highlightedLine.replace(
          /^(\s*)([a-zA-Z_][a-zA-Z0-9_-]*)\s*:/g,
          '$1<span class="text-blue-600 dark:text-blue-400 font-medium">$2</span>:'
        );

        // String values (quoted)
        highlightedLine = highlightedLine.replace(
          /:\s*"([^"]*)"/g,
          ': <span class="text-orange-600 dark:text-orange-400">"$1"</span>'
        );

        // String values (single quoted)
        highlightedLine = highlightedLine.replace(
          /:\s*'([^']*)'/g,
          ": <span class=\"text-orange-600 dark:text-orange-400\">'$1'</span>"
        );

        // Numbers
        highlightedLine = highlightedLine.replace(
          /:\s*(\d+(?:\.\d+)?)/g,
          ': <span class="text-purple-600 dark:text-purple-400">$1</span>'
        );

        // Booleans
        highlightedLine = highlightedLine.replace(
          /:\s*(true|false|null)/g,
          ': <span class="text-red-600 dark:text-red-400">$1</span>'
        );

        // List items
        highlightedLine = highlightedLine.replace(
          /^(\s*)-\s/g,
          '$1<span class="text-gray-600 dark:text-gray-400">-</span> '
        );

        return (
          <div
            key={index}
            className="flex"
          >
            <span className="text-gray-400 dark:text-gray-600 text-xs mr-4 select-none w-8 text-right">
              {index + 1}
            </span>
            <span dangerouslySetInnerHTML={{ __html: highlightedLine }} />
          </div>
        );
      });
  };

  const renderMetrics = (metrics, label) => (
    <div className="bg-muted/50 rounded-lg p-4 border border-border">
      <h4 className="text-sm font-semibold text-foreground mb-3">
        {label} Metrics
      </h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-2xl font-bold text-foreground">
            {metrics.lines || 0}
          </div>
          <div className="text-xs text-muted-foreground">Lines</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground">
            {metrics.sections || 0}
          </div>
          <div className="text-xs text-muted-foreground">Sections</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground">
            {metrics.complexity || 0}
          </div>
          <div className="text-xs text-muted-foreground">Complexity</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground">
            {metrics.maintainability || '0%'}
          </div>
          <div className="text-xs text-muted-foreground">Maintainability</div>
        </div>
      </div>
    </div>
  );

  const renderCodeBlock = (code, label, metrics) => (
    <div className="flex-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{label}</h3>
        <div className={cn(
          "text-xs px-3 py-1 rounded-full font-medium",
          label.includes('Before')
            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
        )}>
          {metrics.lines || 0} lines
        </div>
      </div>

      {/* Code Display */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg border border-border overflow-hidden">
        <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="ml-4 text-sm text-muted-foreground font-mono">
              context-kit.yml
            </span>
          </div>
        </div>
        <div className="p-4 overflow-x-auto max-h-96 overflow-y-auto">
          <pre className="text-sm font-mono leading-relaxed text-foreground">
            {highlightYAML(code || '# No code provided')}
          </pre>
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-4">
        {renderMetrics(metrics, label)}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "w-full bg-background rounded-lg border border-border overflow-hidden",
        className
      )}
      role="region"
      aria-label="Context Evolution Demonstration"
      {...props}
    >
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Context Evolution: YAML Optimization
            </h2>
            <p className="text-muted-foreground">
              Optimizing context from 1,000 lines to 300 lines while maintaining full functionality
            </p>
          </div>

          {/* Impact Summary */}
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">1000</div>
              <div className="text-xs text-muted-foreground">Before</div>
            </div>
            <ArrowRightIcon className="w-6 h-6 text-muted-foreground" />
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">300</div>
              <div className="text-xs text-muted-foreground">After</div>
            </div>
            <div className="ml-4 text-center">
              <div className="text-2xl font-bold text-primary">70%</div>
              <div className="text-xs text-muted-foreground">Reduction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View Toggle */}
      {isMobileState && (
        <div className="p-4 bg-muted border-b border-border">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={activeView === 'before' ? 'default' : 'outline'}
              onClick={() => setActiveView('before')}
              className="flex-1"
            >
              Before (1000 lines)
            </Button>
            <Button
              size="sm"
              variant={activeView === 'after' ? 'default' : 'outline'}
              onClick={() => setActiveView('after')}
              className="flex-1"
            >
              After (300 lines)
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        {isMobileState ? (
          // Mobile: Single view with toggle
          <div>
            {activeView === 'before' ? (
              renderCodeBlock(beforeCode, 'Before: Original Context', beforeMetrics)
            ) : (
              renderCodeBlock(afterCode, 'After: Optimized Context', afterMetrics)
            )}
          </div>
        ) : (
          // Desktop: Side-by-side view
          <div className="flex gap-6">
            {renderCodeBlock(beforeCode, 'Before: Original Context', beforeMetrics)}
            {renderCodeBlock(afterCode, 'After: Optimized Context', afterMetrics)}
          </div>
        )}

        {/* Problems and Solutions */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problems */}
          {problems.length > 0 && (
            <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-center mb-3">
                <ProblemIcon className="w-5 h-5 text-red-500 mr-2" />
                <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">
                  Problems Identified
                </h4>
              </div>
              <ul className="space-y-2">
                {problems.map((problem, index) => (
                  <li key={index} className="text-sm text-red-700 dark:text-red-400 flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {problem}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Solutions */}
          {solutions.length > 0 && (
            <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center mb-3">
                <SolutionIcon className="w-5 h-5 text-green-500 mr-2" />
                <h4 className="text-sm font-semibold text-green-800 dark:text-green-300">
                  Solutions Applied
                </h4>
              </div>
              <ul className="space-y-2">
                {solutions.map((solution, index) => (
                  <li key={index} className="text-sm text-green-700 dark:text-green-400 flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {solution}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Optimizations */}
        {optimizations.length > 0 && (
          <div className="mt-6 bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center mb-3">
              <OptimizeIcon className="w-5 h-5 text-blue-500 mr-2" />
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                Key Optimizations
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {optimizations.map((optimization, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </span>
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-400">
                    {optimization}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Icon components
const ArrowRightIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const ProblemIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M15 9l-6 6" />
    <path d="M9 9l6 6" />
  </svg>
);

const SolutionIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const OptimizeIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

ContextEvolutionSlide.propTypes = {
  beforeCode: PropTypes.string,
  afterCode: PropTypes.string,
  beforeMetrics: PropTypes.shape({
    lines: PropTypes.number,
    sections: PropTypes.number,
    complexity: PropTypes.number,
    maintainability: PropTypes.string
  }),
  afterMetrics: PropTypes.shape({
    lines: PropTypes.number,
    sections: PropTypes.number,
    complexity: PropTypes.number,
    maintainability: PropTypes.string
  }),
  problems: PropTypes.arrayOf(PropTypes.string),
  solutions: PropTypes.arrayOf(PropTypes.string),
  optimizations: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string
};

export default ContextEvolutionSlide;