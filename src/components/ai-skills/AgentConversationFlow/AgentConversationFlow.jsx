import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * AgentConversationFlow - 5-stage conversation evolution visualization
 * Features quality indicators, context evolution, and orchestration diagrams
 *
 * Features:
 * - 5-stage conversation progression
 * - Quality indicators for each stage
 * - Context evolution tracking
 * - Interactive stage navigation
 * - Expandable details
 * - Mobile-responsive design
 * - Orchestration flow diagrams
 */
const AgentConversationFlow = ({
  stages = [],
  autoAdvance = false,
  advanceInterval = 3000,
  showQualityMetrics = true,
  showOrchestration = true,
  className,
  ...props
}) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [expandedStage, setExpandedStage] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoAdvance);

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

  // Auto-advance functionality
  useEffect(() => {
    if (isPlaying && stages.length > 0) {
      const interval = setInterval(() => {
        setCurrentStage(prev => (prev + 1) % stages.length);
      }, advanceInterval);

      return () => clearInterval(interval);
    }
  }, [isPlaying, advanceInterval, stages.length]);

  const handleStageClick = (index) => {
    setCurrentStage(index);
    setIsPlaying(false);
  };

  const toggleExpanded = (index) => {
    setExpandedStage(expandedStage === index ? null : index);
  };

  const getQualityColor = (quality) => {
    if (quality >= 90) return 'text-green-500';
    if (quality >= 75) return 'text-blue-500';
    if (quality >= 60) return 'text-yellow-500';
    if (quality >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getQualityBgColor = (quality) => {
    if (quality >= 90) return 'bg-green-500';
    if (quality >= 75) return 'bg-blue-500';
    if (quality >= 60) return 'bg-yellow-500';
    if (quality >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const renderStageIndicator = (stage, index) => (
    <div
      key={index}
      className={cn(
        "flex flex-col items-center cursor-pointer transition-all duration-200",
        index === currentStage && "transform scale-110"
      )}
      onClick={() => handleStageClick(index)}
    >
      {/* Stage Circle */}
      <div
        className={cn(
          "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200",
          index === currentStage
            ? "bg-primary border-primary text-primary-foreground"
            : index < currentStage
              ? "bg-green-500 border-green-500 text-white"
              : "bg-background border-border text-muted-foreground hover:border-primary"
        )}
      >
        {index < currentStage ? (
          <CheckIcon className="w-5 h-5" />
        ) : (
          <span className="text-sm font-bold">{index + 1}</span>
        )}
      </div>

      {/* Stage Label */}
      <div className="mt-2 text-center">
        <div className={cn(
          "text-xs font-medium",
          index === currentStage ? "text-primary" : "text-muted-foreground"
        )}>
          {stage.title || `Stage ${index + 1}`}
        </div>

        {/* Quality Score */}
        {showQualityMetrics && stage.quality !== undefined && (
          <div className={cn(
            "text-xs font-bold mt-1",
            getQualityColor(stage.quality)
          )}>
            {stage.quality}%
          </div>
        )}
      </div>

      {/* Connection Line */}
      {index < stages.length - 1 && (
        <div
          className={cn(
            "absolute top-6 left-12 w-16 h-0.5 transition-colors duration-200",
            index < currentStage ? "bg-green-500" : "bg-border"
          )}
        />
      )}
    </div>
  );

  const renderStageContent = (stage, index) => (
    <div className="space-y-4">
      {/* Stage Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground">
            {stage.title}
          </h3>
          {stage.subtitle && (
            <p className="text-sm text-muted-foreground mt-1">
              {stage.subtitle}
            </p>
          )}
        </div>

        {/* Quality Badge */}
        {showQualityMetrics && stage.quality !== undefined && (
          <div className={cn(
            "px-3 py-1 rounded-full text-white text-sm font-bold",
            getQualityBgColor(stage.quality)
          )}>
            Quality: {stage.quality}%
          </div>
        )}
      </div>

      {/* Conversation Messages */}
      {stage.messages && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {stage.messages.map((message, msgIndex) => (
            <div
              key={msgIndex}
              className={cn(
                "flex",
                message.type === 'human' ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                message.type === 'human'
                  ? "bg-primary text-primary-foreground"
                  : message.type === 'agent'
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100"
                    : "bg-muted text-muted-foreground"
              )}>
                {/* Message Header */}
                {message.sender && (
                  <div className="text-xs font-medium opacity-75 mb-1">
                    {message.sender}
                  </div>
                )}

                {/* Message Content */}
                <div className="text-sm">
                  {message.content}
                </div>

                {/* Message Metadata */}
                {message.metadata && (
                  <div className="text-xs opacity-75 mt-1 space-y-1">
                    {message.metadata.confidence && (
                      <div>Confidence: {message.metadata.confidence}%</div>
                    )}
                    {message.metadata.context && (
                      <div>Context: {message.metadata.context}</div>
                    )}
                    {message.metadata.tokens && (
                      <div>Tokens: {message.metadata.tokens}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Context Evolution */}
      {stage.contextEvolution && (
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <h4 className="text-sm font-semibold text-foreground mb-3">
            Context Evolution
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-lg font-bold text-foreground">
                {stage.contextEvolution.tokens || 0}
              </div>
              <div className="text-xs text-muted-foreground">Tokens Used</div>
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">
                {stage.contextEvolution.accuracy || 0}%
              </div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">
                {stage.contextEvolution.relevance || 0}%
              </div>
              <div className="text-xs text-muted-foreground">Relevance</div>
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">
                {stage.contextEvolution.efficiency || 0}%
              </div>
              <div className="text-xs text-muted-foreground">Efficiency</div>
            </div>
          </div>
        </div>
      )}

      {/* Orchestration Info */}
      {showOrchestration && stage.orchestration && (
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center mb-3">
            <OrchestrationIcon className="w-5 h-5 text-blue-500 mr-2" />
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              Orchestration Details
            </h4>
          </div>

          <div className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
            {stage.orchestration.agents && (
              <div>
                <span className="font-medium">Active Agents: </span>
                {stage.orchestration.agents.join(', ')}
              </div>
            )}
            {stage.orchestration.coordination && (
              <div>
                <span className="font-medium">Coordination: </span>
                {stage.orchestration.coordination}
              </div>
            )}
            {stage.orchestration.handoffs && (
              <div>
                <span className="font-medium">Handoffs: </span>
                {stage.orchestration.handoffs}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Key Improvements */}
      {stage.improvements && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">
            Key Improvements
          </h4>
          <div className="space-y-1">
            {stage.improvements.map((improvement, impIndex) => (
              <div
                key={impIndex}
                className="flex items-start text-sm text-green-700 dark:text-green-400"
              >
                <CheckIcon className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                {improvement}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (!stages || stages.length === 0) {
    return (
      <div className={cn(
        "w-full bg-muted rounded-lg border border-border p-8 text-center",
        className
      )}>
        <div className="text-muted-foreground">No conversation stages provided</div>
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
      aria-label="Agent Conversation Flow"
      {...props}
    >
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Agent Conversation Evolution
            </h2>
            <p className="text-muted-foreground">
              {stages.length}-stage progression showing quality improvements and context evolution
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pause auto-advance" : "Start auto-advance"}
            >
              {isPlaying ? (
                <PauseIcon className="w-4 h-4" />
              ) : (
                <PlayIcon className="w-4 h-4" />
              )}
              {!isMobile && (
                <span className="ml-2">
                  {isPlaying ? 'Pause' : 'Play'}
                </span>
              )}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentStage(0)}
              aria-label="Reset to first stage"
            >
              <RestartIcon className="w-4 h-4" />
              {!isMobile && <span className="ml-2">Reset</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Stage Indicators */}
      <div className="p-6 border-b border-border">
        <div className={cn(
          "flex justify-between items-center relative",
          isMobile && "overflow-x-auto pb-4"
        )}>
          {stages.map((stage, index) => renderStageIndicator(stage, index))}
        </div>
      </div>

      {/* Current Stage Content */}
      <div className="p-6">
        {stages[currentStage] && renderStageContent(stages[currentStage], currentStage)}
      </div>

      {/* Stage Details Toggle */}
      <div className="p-6 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleExpanded(currentStage)}
          className="w-full"
          aria-expanded={expandedStage === currentStage}
        >
          {expandedStage === currentStage ? 'Hide' : 'Show'} Detailed Analysis
          <ChevronIcon className={cn(
            "w-4 h-4 ml-2 transition-transform duration-200",
            expandedStage === currentStage && "rotate-180"
          )} />
        </Button>

        {/* Expanded Details */}
        {expandedStage === currentStage && stages[currentStage]?.details && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {stages[currentStage].details}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Icon components
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

const PlayIcon = ({ className }) => (
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
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

const PauseIcon = ({ className }) => (
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
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

const RestartIcon = ({ className }) => (
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

const ChevronIcon = ({ className }) => (
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
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const OrchestrationIcon = ({ className }) => (
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
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

AgentConversationFlow.propTypes = {
  stages: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    quality: PropTypes.number,
    messages: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.oneOf(['human', 'agent', 'system']).isRequired,
      sender: PropTypes.string,
      content: PropTypes.string.isRequired,
      metadata: PropTypes.shape({
        confidence: PropTypes.number,
        context: PropTypes.string,
        tokens: PropTypes.number
      })
    })),
    contextEvolution: PropTypes.shape({
      tokens: PropTypes.number,
      accuracy: PropTypes.number,
      relevance: PropTypes.number,
      efficiency: PropTypes.number
    }),
    orchestration: PropTypes.shape({
      agents: PropTypes.arrayOf(PropTypes.string),
      coordination: PropTypes.string,
      handoffs: PropTypes.string
    }),
    improvements: PropTypes.arrayOf(PropTypes.string),
    details: PropTypes.string
  })),
  autoAdvance: PropTypes.bool,
  advanceInterval: PropTypes.number,
  showQualityMetrics: PropTypes.bool,
  showOrchestration: PropTypes.bool,
  className: PropTypes.string
};

export default AgentConversationFlow;