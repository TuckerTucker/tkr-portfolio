import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * AIInteractionShowcase - Side-by-side comparison of human vs AI interaction patterns
 * Displays dual interfaces with sync indicators and shared data visualization
 *
 * Features:
 * - Side-by-side human vs AI views
 * - Sync indicators showing coordination
 * - Shared data visualization
 * - Mobile-responsive layout
 * - Theme-aware design
 */
const AIInteractionShowcase = ({
  humanInterface = {},
  aiInterface = {},
  sharedData = [],
  syncIndicators = [],
  showSync = true,
  className,
  ...props
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [activeSync, setActiveSync] = useState(null);

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

  // Auto-cycle through sync indicators
  useEffect(() => {
    if (showSync && syncIndicators.length > 0) {
      const interval = setInterval(() => {
        setActiveSync(current =>
          current === null ? 0 : (current + 1) % syncIndicators.length
        );
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [showSync, syncIndicators]);

  const renderInterface = (interfaceData, type) => (
    <div className={cn(
      "relative flex-1 bg-card rounded-lg border border-border overflow-hidden",
      "min-h-[400px]",
      isMobile && "min-h-[300px]"
    )}>
      {/* Interface Header */}
      <div className={cn(
        "px-4 py-3 bg-muted border-b border-border",
        "flex items-center justify-between"
      )}>
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-3 h-3 rounded-full",
            type === 'human' ? "bg-blue-500" : "bg-purple-500"
          )} />
          <h3 className="text-sm font-medium text-foreground">
            {type === 'human' ? 'Human Interface' : 'AI Interface'}
          </h3>
        </div>

        {/* Status indicator */}
        <div className={cn(
          "text-xs px-2 py-1 rounded-full",
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
        )}>
          Active
        </div>
      </div>

      {/* Interface Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        {interfaceData.title && (
          <h4 className="text-lg font-semibold text-foreground">
            {interfaceData.title}
          </h4>
        )}

        {/* Description */}
        {interfaceData.description && (
          <p className="text-sm text-muted-foreground">
            {interfaceData.description}
          </p>
        )}

        {/* Interactive Elements */}
        {interfaceData.elements && (
          <div className="space-y-2">
            {interfaceData.elements.map((element, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 rounded border border-border",
                  element.type === 'input' && "bg-input/50",
                  element.type === 'output' && "bg-accent/50",
                  element.type === 'control' && "bg-secondary/50"
                )}
              >
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  {element.type}
                </div>
                <div className="text-sm text-foreground">
                  {element.content}
                </div>
                {element.action && (
                  <Button size="sm" variant="outline" className="mt-2">
                    {element.action}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Capabilities */}
        {interfaceData.capabilities && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">Capabilities</div>
            <div className="flex flex-wrap gap-2">
              {interfaceData.capabilities.map((capability, index) => (
                <span
                  key={index}
                  className={cn(
                    "text-xs px-2 py-1 rounded-full border",
                    "bg-background text-foreground border-border"
                  )}
                >
                  {capability}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "relative w-full bg-background",
        className
      )}
      role="region"
      aria-label="AI and Human Interface Showcase"
      {...props}
    >
      {/* Main Content */}
      <div className={cn(
        "flex gap-4",
        isMobile ? "flex-col" : "flex-row"
      )}>
        {/* Human Interface */}
        {renderInterface(humanInterface, 'human')}

        {/* Sync Indicators - Only show on desktop */}
        {showSync && !isMobile && syncIndicators.length > 0 && (
          <div className="flex flex-col items-center justify-center w-16 py-8">
            {syncIndicators.map((indicator, index) => (
              <div
                key={index}
                className={cn(
                  "mb-4 p-2 rounded-full transition-all duration-300",
                  activeSync === index
                    ? "bg-primary text-primary-foreground scale-110"
                    : "bg-muted text-muted-foreground"
                )}
                title={indicator.label}
              >
                <SyncIcon className="w-4 h-4" />
              </div>
            ))}
            <div className="flex-1 w-px bg-border" />
          </div>
        )}

        {/* AI Interface */}
        {renderInterface(aiInterface, 'ai')}
      </div>

      {/* Shared Data Visualization */}
      {sharedData.length > 0 && (
        <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
          <h4 className="text-sm font-semibold text-foreground mb-3">
            Shared Data & Coordination
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sharedData.map((data, index) => (
              <div
                key={index}
                className="p-3 bg-background rounded border border-border"
              >
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  {data.type}
                </div>
                <div className="text-sm text-foreground font-medium">
                  {data.label}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {data.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sync Indicators */}
      {showSync && isMobile && syncIndicators.length > 0 && (
        <div className="mt-4 flex justify-center space-x-4">
          {syncIndicators.map((indicator, index) => (
            <div
              key={index}
              className={cn(
                "p-2 rounded-full transition-all duration-300",
                activeSync === index
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
              title={indicator.label}
            >
              <SyncIcon className="w-4 h-4" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Sync icon component
const SyncIcon = ({ className }) => (
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
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

AIInteractionShowcase.propTypes = {
  humanInterface: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    elements: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.oneOf(['input', 'output', 'control']).isRequired,
      content: PropTypes.string.isRequired,
      action: PropTypes.string
    })),
    capabilities: PropTypes.arrayOf(PropTypes.string)
  }),
  aiInterface: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    elements: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.oneOf(['input', 'output', 'control']).isRequired,
      content: PropTypes.string.isRequired,
      action: PropTypes.string
    })),
    capabilities: PropTypes.arrayOf(PropTypes.string)
  }),
  sharedData: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
  })),
  syncIndicators: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired
  })),
  showSync: PropTypes.bool,
  className: PropTypes.string
};

export default AIInteractionShowcase;