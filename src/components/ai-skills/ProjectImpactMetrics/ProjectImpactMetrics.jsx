import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * ProjectImpactMetrics - Quantified results display with multiple visualization options
 * Features before/after KPIs, bar/line/circular charts, and accessibility support
 *
 * Features:
 * - Before/after metrics comparison
 * - Multiple visualization types (bar, line, circular)
 * - Animated counters and progress bars
 * - Accessibility (ARIA labels, keyboard navigation)
 * - Mobile-responsive design
 * - Theme-aware charts
 */
const ProjectImpactMetrics = ({
  metrics = [],
  visualizationType = 'bar',
  title = 'Project Impact Metrics',
  subtitle,
  showAnimation = true,
  animationDuration = 2000,
  className,
  ...props
}) => {
  const [animatedValues, setAnimatedValues] = useState({});
  const [currentVisualization, setCurrentVisualization] = useState(visualizationType);
  const [isMobile, setIsMobile] = useState(false);

  // Check if the screen is mobile-sized
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Animate metric values
  useEffect(() => {
    if (showAnimation && metrics.length > 0) {
      const startTime = Date.now();

      const animateValue = (start, end, duration, callback) => {
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Easing function (ease-out)
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const current = start + (end - start) * easeOut;

          callback(current);

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        animate();
      };

      const newAnimatedValues = {};

      metrics.forEach((metric, index) => {
        const beforeValue = typeof metric.before === 'number' ? metric.before : 0;
        const afterValue = typeof metric.after === 'number' ? metric.after : 0;

        // Animate before value
        animateValue(0, beforeValue, animationDuration, (value) => {
          setAnimatedValues(prev => ({
            ...prev,
            [`${index}_before`]: value
          }));
        });

        // Animate after value with slight delay
        setTimeout(() => {
          animateValue(0, afterValue, animationDuration, (value) => {
            setAnimatedValues(prev => ({
              ...prev,
              [`${index}_after`]: value
            }));
          });
        }, animationDuration * 0.2);
      });
    } else {
      // Set final values without animation
      const finalValues = {};
      metrics.forEach((metric, index) => {
        finalValues[`${index}_before`] = typeof metric.before === 'number' ? metric.before : 0;
        finalValues[`${index}_after`] = typeof metric.after === 'number' ? metric.after : 0;
      });
      setAnimatedValues(finalValues);
    }
  }, [metrics, showAnimation, animationDuration]);

  const formatValue = (value, metric) => {
    if (typeof value !== 'number') return value;

    const roundedValue = Math.round(value);

    if (metric.suffix) {
      return `${roundedValue}${metric.suffix}`;
    }

    if (metric.prefix) {
      return `${metric.prefix}${roundedValue}`;
    }

    return roundedValue.toLocaleString();
  };

  const calculateImprovement = (before, after) => {
    if (typeof before !== 'number' || typeof after !== 'number') return 0;
    if (before === 0) return after > 0 ? 100 : 0;
    return ((after - before) / Math.abs(before)) * 100;
  };

  const renderBarChart = (metric, index) => {
    const beforeValue = animatedValues[`${index}_before`] || 0;
    const afterValue = animatedValues[`${index}_after`] || 0;
    const maxValue = Math.max(
      typeof metric.before === 'number' ? metric.before : 0,
      typeof metric.after === 'number' ? metric.after : 0,
      1
    );

    const beforePercentage = (beforeValue / maxValue) * 100;
    const afterPercentage = (afterValue / maxValue) * 100;

    return (
      <div className="space-y-3">
        {/* Before Bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-muted-foreground">Before</span>
            <span className="text-sm font-bold text-foreground">
              {formatValue(beforeValue, metric)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${beforePercentage}%` }}
              role="progressbar"
              aria-valuenow={beforeValue}
              aria-valuemin={0}
              aria-valuemax={maxValue}
            />
          </div>
        </div>

        {/* After Bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-muted-foreground">After</span>
            <span className="text-sm font-bold text-foreground">
              {formatValue(afterValue, metric)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${afterPercentage}%` }}
              role="progressbar"
              aria-valuenow={afterValue}
              aria-valuemin={0}
              aria-valuemax={maxValue}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderCircularChart = (metric, index) => {
    const beforeValue = typeof metric.before === 'number' ? metric.before : 0;
    const afterValue = typeof metric.after === 'number' ? metric.after : 0;
    const animatedBefore = animatedValues[`${index}_before`] || 0;
    const animatedAfter = animatedValues[`${index}_after`] || 0;

    const improvement = calculateImprovement(beforeValue, afterValue);
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const improvementPercentage = Math.min(Math.abs(improvement), 100);
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (improvementPercentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center space-y-2">
        {/* Circular Progress */}
        <div className="relative">
          <svg
            className="w-24 h-24 transform -rotate-90"
            viewBox="0 0 100 100"
          >
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={cn(
                "transition-all duration-1000",
                improvement >= 0 ? "text-green-500" : "text-red-500"
              )}
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">
                {improvement >= 0 ? '+' : ''}{Math.round(improvement)}%
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="text-center space-y-1">
          <div className="flex items-center space-x-4 text-xs">
            <div>
              <span className="text-muted-foreground">Before: </span>
              <span className="font-medium text-foreground">
                {formatValue(animatedBefore, metric)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">After: </span>
              <span className="font-medium text-foreground">
                {formatValue(animatedAfter, metric)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLineChart = (metric, index) => {
    const beforeValue = typeof metric.before === 'number' ? metric.before : 0;
    const afterValue = typeof metric.after === 'number' ? metric.after : 0;
    const maxValue = Math.max(beforeValue, afterValue, 1);

    const beforeY = 60 - (beforeValue / maxValue) * 40;
    const afterY = 60 - (afterValue / maxValue) * 40;

    return (
      <div className="space-y-2">
        {/* Mini Line Chart */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
          <svg viewBox="0 0 100 60" className="w-full h-16">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-300 dark:text-gray-600"/>
              </pattern>
            </defs>
            <rect width="100" height="60" fill="url(#grid)" />

            {/* Line */}
            <line
              x1="20"
              y1={beforeY}
              x2="80"
              y2={afterY}
              stroke="currentColor"
              strokeWidth="2"
              className={cn(
                afterValue >= beforeValue ? "text-green-500" : "text-red-500"
              )}
            />

            {/* Points */}
            <circle cx="20" cy={beforeY} r="3" fill="currentColor" className="text-red-500" />
            <circle cx="80" cy={afterY} r="3" fill="currentColor" className="text-green-500" />

            {/* Labels */}
            <text x="20" y="55" textAnchor="middle" className="text-xs fill-current text-muted-foreground">
              Before
            </text>
            <text x="80" y="55" textAnchor="middle" className="text-xs fill-current text-muted-foreground">
              After
            </text>
          </svg>
        </div>

        {/* Values */}
        <div className="flex justify-between text-sm">
          <div className="text-center">
            <div className="font-bold text-red-600 dark:text-red-400">
              {formatValue(animatedValues[`${index}_before`] || 0, metric)}
            </div>
            <div className="text-xs text-muted-foreground">Before</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-green-600 dark:text-green-400">
              {formatValue(animatedValues[`${index}_after`] || 0, metric)}
            </div>
            <div className="text-xs text-muted-foreground">After</div>
          </div>
        </div>
      </div>
    );
  };

  const renderMetric = (metric, index) => {
    const improvement = calculateImprovement(
      typeof metric.before === 'number' ? metric.before : 0,
      typeof metric.after === 'number' ? metric.after : 0
    );

    return (
      <div
        key={index}
        className="bg-card border border-border rounded-lg p-4 space-y-4"
      >
        {/* Header */}
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-foreground">
            {metric.label}
          </h4>
          {metric.description && (
            <p className="text-xs text-muted-foreground">
              {metric.description}
            </p>
          )}
        </div>

        {/* Visualization */}
        <div>
          {currentVisualization === 'bar' && renderBarChart(metric, index)}
          {currentVisualization === 'line' && renderLineChart(metric, index)}
          {currentVisualization === 'circular' && renderCircularChart(metric, index)}
        </div>

        {/* Impact Badge */}
        {improvement !== 0 && (
          <div className="flex justify-center">
            <span className={cn(
              "text-xs px-2 py-1 rounded-full font-medium",
              improvement > 0
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
            )}>
              {improvement > 0 ? '+' : ''}{Math.round(improvement)}% impact
            </span>
          </div>
        )}
      </div>
    );
  };

  if (!metrics || metrics.length === 0) {
    return (
      <div className={cn(
        "w-full bg-muted rounded-lg border border-border p-8 text-center",
        className
      )}>
        <div className="text-muted-foreground">No metrics data provided</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full bg-background rounded-lg border border-border overflow-hidden",
        className
      )}
      role="region"
      aria-label="Project Impact Metrics"
      {...props}
    >
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {title}
            </h2>
            {subtitle && (
              <p className="text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>

          {/* Visualization Controls */}
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={currentVisualization === 'bar' ? 'default' : 'outline'}
              onClick={() => setCurrentVisualization('bar')}
              aria-label="Bar chart view"
            >
              <BarIcon className="w-4 h-4" />
              {!isMobile && <span className="ml-1">Bar</span>}
            </Button>
            <Button
              size="sm"
              variant={currentVisualization === 'line' ? 'default' : 'outline'}
              onClick={() => setCurrentVisualization('line')}
              aria-label="Line chart view"
            >
              <LineIcon className="w-4 h-4" />
              {!isMobile && <span className="ml-1">Line</span>}
            </Button>
            <Button
              size="sm"
              variant={currentVisualization === 'circular' ? 'default' : 'outline'}
              onClick={() => setCurrentVisualization('circular')}
              aria-label="Circular chart view"
            >
              <CircleIcon className="w-4 h-4" />
              {!isMobile && <span className="ml-1">Circular</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6">
        <div className={cn(
          "grid gap-6",
          metrics.length === 1 ? "grid-cols-1" :
          metrics.length === 2 ? "grid-cols-1 lg:grid-cols-2" :
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        )}>
          {metrics.map((metric, index) => renderMetric(metric, index))}
        </div>
      </div>
    </div>
  );
};

// Icon components
const BarIcon = ({ className }) => (
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
    <line x1="12" x2="12" y1="20" y2="10" />
    <line x1="18" x2="18" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="16" />
  </svg>
);

const LineIcon = ({ className }) => (
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
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

const CircleIcon = ({ className }) => (
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
    <path d="M8 12l2 2 4-4" />
  </svg>
);

ProjectImpactMetrics.propTypes = {
  metrics: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    description: PropTypes.string,
    before: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    after: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    prefix: PropTypes.string,
    suffix: PropTypes.string
  })),
  visualizationType: PropTypes.oneOf(['bar', 'line', 'circular']),
  title: PropTypes.string,
  subtitle: PropTypes.string,
  showAnimation: PropTypes.bool,
  animationDuration: PropTypes.number,
  className: PropTypes.string
};

export default ProjectImpactMetrics;