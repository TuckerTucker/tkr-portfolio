import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * DualInterfaceDemo - Interactive toggle between human and AI views
 * Features smooth transitions, guided demo scenarios, and real-time sync
 *
 * Features:
 * - Toggle between human and AI interfaces
 * - Smooth 200ms transitions with ease-in-out
 * - Guided demo scenarios
 * - Real-time synchronization
 * - Mobile-responsive design
 * - Accessibility support
 */
const DualInterfaceDemo = ({
  scenarios = [],
  initialMode = 'human',
  autoDemo = false,
  demoDuration = 4000,
  className,
  ...props
}) => {
  const [activeMode, setActiveMode] = useState(initialMode);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
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

  // Auto demo functionality
  useEffect(() => {
    if (autoDemo && scenarios.length > 0) {
      const interval = setInterval(() => {
        handleModeToggle();
      }, demoDuration);

      return () => clearInterval(interval);
    }
  }, [autoDemo, demoDuration, activeMode]);

  const handleModeToggle = () => {
    setIsTransitioning(true);

    setTimeout(() => {
      setActiveMode(prev => prev === 'human' ? 'ai' : 'human');
      setIsTransitioning(false);
    }, 100); // Half of transition duration
  };

  const handleScenarioChange = (index) => {
    if (index !== currentScenario) {
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentScenario(index);
        setIsTransitioning(false);
      }, 100);
    }
  };

  const currentScenarioData = scenarios[currentScenario] || {};
  const currentInterface = currentScenarioData[activeMode] || {};

  return (
    <div
      className={cn(
        "relative w-full bg-background rounded-lg border border-border overflow-hidden",
        className
      )}
      role="region"
      aria-label="Dual Interface Demo"
      {...props}
    >
      {/* Demo Controls */}
      <div className="p-4 bg-muted border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Mode Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-foreground mr-2">
              View Mode:
            </span>
            <div className="flex bg-background rounded-lg border border-border p-1">
              <button
                onClick={() => !isTransitioning && setActiveMode('human')}
                className={cn(
                  "px-3 py-1 text-sm font-medium rounded transition-all duration-200 ease-in-out",
                  activeMode === 'human'
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-pressed={activeMode === 'human'}
                aria-label="Switch to human interface view"
              >
                Human
              </button>
              <button
                onClick={() => !isTransitioning && setActiveMode('ai')}
                className={cn(
                  "px-3 py-1 text-sm font-medium rounded transition-all duration-200 ease-in-out",
                  activeMode === 'ai'
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-pressed={activeMode === 'ai'}
                aria-label="Switch to AI interface view"
              >
                AI
              </button>
            </div>

            {/* Toggle Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleModeToggle}
              disabled={isTransitioning}
              aria-label="Toggle between human and AI views"
            >
              <ToggleIcon className="w-4 h-4" />
              {!isMobile && <span className="ml-2">Toggle</span>}
            </Button>
          </div>

          {/* Scenario Selector */}
          {scenarios.length > 1 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-foreground">
                Scenario:
              </span>
              <select
                value={currentScenario}
                onChange={(e) => handleScenarioChange(Number(e.target.value))}
                className={cn(
                  "text-sm bg-background border border-border rounded px-2 py-1",
                  "text-foreground"
                )}
                aria-label="Select demo scenario"
              >
                {scenarios.map((scenario, index) => (
                  <option key={index} value={index}>
                    {scenario.title || `Scenario ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Scenario Description */}
        {currentScenarioData.description && (
          <div className="mt-3 text-sm text-muted-foreground">
            {currentScenarioData.description}
          </div>
        )}
      </div>

      {/* Interface Display */}
      <div className="relative min-h-[400px] bg-background">
        <div
          className={cn(
            "absolute inset-0 transition-all duration-200 ease-in-out",
            isTransitioning ? "opacity-0 transform translate-y-2" : "opacity-100 transform translate-y-0"
          )}
        >
          {/* Interface Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-4 h-4 rounded-full",
                activeMode === 'human' ? "bg-blue-500" : "bg-purple-500"
              )} />
              <h3 className="text-lg font-semibold text-foreground">
                {activeMode === 'human' ? 'Human Interface' : 'AI-Enhanced Interface'}
              </h3>
            </div>

            {/* Sync Status */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">
                Synced
              </span>
            </div>
          </div>

          {/* Interface Content */}
          <div className="p-6 space-y-4">
            {/* Title */}
            {currentInterface.title && (
              <h4 className="text-xl font-bold text-foreground">
                {currentInterface.title}
              </h4>
            )}

            {/* Content Sections */}
            {currentInterface.sections && (
              <div className="space-y-4">
                {currentInterface.sections.map((section, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-4 rounded-lg border border-border",
                      section.type === 'input' && "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
                      section.type === 'output' && "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
                      section.type === 'analysis' && "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800",
                      section.type === 'action' && "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="text-sm font-semibold text-foreground">
                        {section.title}
                      </h5>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full font-medium",
                        section.type === 'input' && "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
                        section.type === 'output' && "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
                        section.type === 'analysis' && "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
                        section.type === 'action' && "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300"
                      )}>
                        {section.type}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {section.content}
                    </div>
                    {section.actions && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {section.actions.map((action, actionIndex) => (
                          <Button
                            key={actionIndex}
                            size="sm"
                            variant={action.primary ? "default" : "outline"}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Key Differences */}
            {currentInterface.keyDifferences && (
              <div className="mt-6 p-4 bg-accent/50 rounded-lg border border-border">
                <h5 className="text-sm font-semibold text-foreground mb-2">
                  Key {activeMode === 'human' ? 'Manual' : 'AI-Enhanced'} Features
                </h5>
                <ul className="space-y-1">
                  {currentInterface.keyDifferences.map((difference, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start">
                      <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      {difference}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Demo Progress */}
      {scenarios.length > 1 && (
        <div className="px-4 py-3 bg-muted border-t border-border">
          <div className="flex justify-center space-x-2">
            {scenarios.map((_, index) => (
              <button
                key={index}
                onClick={() => handleScenarioChange(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors duration-200",
                  index === currentScenario
                    ? "bg-primary"
                    : "bg-border hover:bg-muted-foreground"
                )}
                aria-label={`Go to scenario ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Toggle icon component
const ToggleIcon = ({ className }) => (
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
    <path d="M16 3h5v5" />
    <path d="M8 3H3v5" />
    <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" />
    <path d="m15 9 6-6" />
  </svg>
);

// Check icon component
const CheckIcon = ({ className }) => (
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
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

DualInterfaceDemo.propTypes = {
  scenarios: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    human: PropTypes.shape({
      title: PropTypes.string,
      sections: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.oneOf(['input', 'output', 'analysis', 'action']).isRequired,
        title: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        actions: PropTypes.arrayOf(PropTypes.shape({
          label: PropTypes.string.isRequired,
          primary: PropTypes.bool
        }))
      })),
      keyDifferences: PropTypes.arrayOf(PropTypes.string)
    }),
    ai: PropTypes.shape({
      title: PropTypes.string,
      sections: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.oneOf(['input', 'output', 'analysis', 'action']).isRequired,
        title: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        actions: PropTypes.arrayOf(PropTypes.shape({
          label: PropTypes.string.isRequired,
          primary: PropTypes.bool
        }))
      })),
      keyDifferences: PropTypes.arrayOf(PropTypes.string)
    })
  })),
  initialMode: PropTypes.oneOf(['human', 'ai']),
  autoDemo: PropTypes.bool,
  demoDuration: PropTypes.number,
  className: PropTypes.string
};

export default DualInterfaceDemo;