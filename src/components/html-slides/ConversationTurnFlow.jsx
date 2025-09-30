import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DynamicIcon from '../ui/DynamicIcon';

/**
 * ConversationTurnFlow - Shows how YAML persists across conversation turns
 * Demonstrates the value of persistent context
 */
const ConversationTurnFlow = ({ className = "" }) => {
  const [currentTurn, setCurrentTurn] = useState(0);

  const turns = [
    {
      turn: 1,
      userMessage: 'What components are in my portfolio?',
      withoutYAML: {
        steps: [
          'Search for component files',
          'List directories',
          'Read multiple files',
          'Analyze structure'
        ],
        time: '8-12 seconds',
        tokens: '~3,200',
        response: 'After exploring your codebase, I found 33 components across 3 directories...'
      },
      withYAML: {
        steps: [
          'Load YAML context (instant)',
          'Already knows structure',
          'Respond immediately'
        ],
        time: '1-2 seconds',
        tokens: '~1,400',
        response: 'Your portfolio has 33 components: 18 HTML slides, 8 layout components, and 7 UI components...'
      }
    },
    {
      turn: 2,
      userMessage: 'How does TicTacToe relate to other components?',
      withoutYAML: {
        steps: [
          'Find TicTacToe.jsx again',
          'Re-read the file',
          'Search for imports',
          'Check related files'
        ],
        time: '6-10 seconds',
        tokens: '~2,800',
        response: 'Let me search for TicTacToe... Found it. Now checking relationships...'
      },
      withYAML: {
        steps: [
          'Reference yaml context',
          'Look up relationships map',
          'Provide answer'
        ],
        time: '1-2 seconds',
        tokens: '~800',
        response: 'TicTacToe imports useState & useEffect, is used in agentic_ai_kanban project slide...'
      }
    },
    {
      turn: 3,
      userMessage: "Let's update TicTacToe to add a score tracker",
      withoutYAML: {
        steps: [
          'Find file location again',
          'Read current implementation',
          'Make modifications',
          'Write changes'
        ],
        time: '5-8 seconds',
        tokens: '~2,400',
        response: 'Let me locate and read TicTacToe.jsx first...'
      },
      withYAML: {
        steps: [
          'Reference file location from yaml context',
          'Retreive specific file',
          'Apply changes'
        ],
        time: '2-3 seconds',
        tokens: '~1,200',
        response: 'Reading TicTacToe.jsx from src/components/html-slides/...'
      }
    }
  ];

  const currentTurnData = turns[currentTurn];
  const withoutTotal = turns.slice(0, currentTurn + 1).reduce((sum, t) =>
    sum + parseInt(t.withoutYAML.tokens.replace(/[~,]/g, '')), 0
  );
  const withTotal = turns.slice(0, currentTurn + 1).reduce((sum, t) =>
    sum + parseInt(t.withYAML.tokens.replace(/[~,]/g, '')), 0
  );

  return (
    <div className={`flex flex-col h-full p-4 md:p-6 ${className}`}>
      <h2 className="font-heading text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--slide-title)' }}>
        Context Persistence Across Turns
      </h2>
      <p className="text-sm mb-4 opacity-80" style={{ color: 'var(--slide-text)' }}>
        See how YAML context eliminates repetitive exploration
      </p>

      {/* Turn Navigation */}
      <div className="flex gap-2 mb-4">
        {turns.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentTurn(index)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              currentTurn === index ? 'ring-2' : ''
            }`}
            style={{
              backgroundColor: currentTurn === index ? 'var(--slide-card-bg)' : 'transparent',
              border: '1px solid var(--slide-card-border)',
              color: 'var(--slide-text)',
              ringColor: 'var(--slide-card-border)'
            }}
          >
            Turn {index + 1}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* User Question */}
        <div className="lg:w-80">
          <div
            className="p-4 rounded-lg h-full"
            style={{
              backgroundColor: 'var(--slide-card-bg)',
              border: '2px solid var(--slide-card-border)'
            }}
          >
            {/* User Message - Chat Bubble Style */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <DynamicIcon
                  name="User"
                  size={24}
                  style={{ color: 'var(--slide-text)' }}
                  ariaLabel="User icon"
                />
                <span className="text-sm font-bold" style={{ color: 'var(--slide-text)' }}>
                  Tucker
                </span>
      
              </div>
              <div
                className="p-4 rounded-xl relative"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  border: '3px solid rgba(59, 130, 246, 0.5)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
              >
                <div className="text-base font-semibold" style={{ color: 'var(--slide-text)' }}>
                  "{currentTurnData.userMessage}"
                </div>
              </div>
            </div>

            {/* Cumulative Stats */}
            <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--slide-card-border)' }}>
              <div className="font-semibold text-xs mb-2 opacity-80" style={{ color: 'var(--slide-text)' }}>
                Cumulative Tokens:
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-xs opacity-80" style={{ color: 'var(--slide-text)' }}>
                    Without YAML
                  </span>
                  <span className="font-mono font-bold text-sm text-red-500">
                    {withoutTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs opacity-80" style={{ color: 'var(--slide-text)' }}>
                    context-kit.yml
                  </span>
                  <span className="font-mono font-bold text-sm text-green-500">
                    {withTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-1.5 border-t" style={{ borderColor: 'var(--slide-card-border)' }}>
                  <span className="text-xs font-semibold" style={{ color: 'var(--slide-text)' }}>
                    Savings
                  </span>
                  <span className="font-bold text-sm text-green-500">
                    {Math.round(((withoutTotal - withTotal) / withoutTotal) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Columns */}
        <div className="flex-1 grid md:grid-cols-2 gap-3 min-h-0">
          {/* Without YAML */}
          <div className="flex flex-col min-h-0">
            <div className="mb-2 flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              <DynamicIcon
                name="Bot"
                size={24}
                style={{ color: '#ef4444' }}
                ariaLabel="AI Agent icon"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-red-500">
                  
                </span>
                <span className="text-xs opacity-80 flex items-center gap-1" style={{ color: 'var(--slide-text)' }}>
                  
                  Without YAML
                </span>
              </div>
            </div>
            <div
              className="flex-1 p-3 rounded-lg overflow-y-auto"
              style={{
                backgroundColor: 'var(--slide-card-bg)',
                border: '2px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              <div className="space-y-3">
                {/* Steps */}
                <div>
                 
                  <div className="space-y-1.5">
                    {currentTurnData.withoutYAML.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="text-xs p-1.5 rounded"
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.2)',
                          color: 'var(--slide-text)'
                        }}
                      >
                        {step}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div className="pt-2 border-t" style={{ borderColor: 'var(--slide-card-border)' }}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs opacity-60" style={{ color: 'var(--slide-text)' }}>
                      Time
                    </span>
                    <span className="text-xs font-bold text-red-500">
                      {currentTurnData.withoutYAML.time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs opacity-60" style={{ color: 'var(--slide-text)' }}>
                      Tokens
                    </span>
                    <span className="text-xs font-mono font-bold text-red-500">
                      {currentTurnData.withoutYAML.tokens}
                    </span>
                  </div>
                </div>

                {/* Response Preview - Chat Bubble Style */}
                <div className="pt-2 border-t" style={{ borderColor: 'var(--slide-card-border)' }}>
                  <div className="text-xs font-bold mb-2 text-red-500 flex items-center gap-1">
                    <DynamicIcon name="MessageCircle" size={24} style={{ color: '#ef4444' }} />
                  
                  </div>
                  <div
                    className="p-3 rounded-lg text-sm"
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      border: '2px solid rgba(239, 68, 68, 0.4)',
                      color: 'var(--slide-text)',
                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)'
                    }}
                  >
                    <span className="font-medium">"{currentTurnData.withoutYAML.response}"</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* With YAML */}
          <div className="flex flex-col min-h-0">
            <div className="mb-2 flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
              <DynamicIcon
                name="Bot"
                size={24}
                style={{ color: '#10b981' }}
                ariaLabel="AI Agent icon"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-green-500">
                  
                </span>
                <span className="text-xs opacity-80 flex items-center gap-1" style={{ color: 'var(--slide-text)' }}>
                  context-kit.yml
                </span>
              </div>
            </div>
            <div
              className="flex-1 p-3 rounded-lg overflow-y-auto"
              style={{
                backgroundColor: 'var(--slide-card-bg)',
                border: '2px solid rgba(34, 197, 94, 0.3)'
              }}
            >
              <div className="space-y-3">
                {/* Steps */}
                <div>
                  
                  <div className="space-y-1.5">
                    {currentTurnData.withYAML.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="text-xs p-1.5 rounded"
                        style={{
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          color: 'var(--slide-text)'
                        }}
                      >
                        {step}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div className="pt-2 border-t" style={{ borderColor: 'var(--slide-card-border)' }}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs opacity-60" style={{ color: 'var(--slide-text)' }}>
                      Time
                    </span>
                    <span className="text-xs font-bold text-green-500">
                      {currentTurnData.withYAML.time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs opacity-60" style={{ color: 'var(--slide-text)' }}>
                      Tokens
                    </span>
                    <span className="text-xs font-mono font-bold text-green-500">
                      {currentTurnData.withYAML.tokens}
                    </span>
                  </div>
                </div>

                {/* Response Preview - Chat Bubble Style */}
                <div className="pt-2 border-t" style={{ borderColor: 'var(--slide-card-border)' }}>
                  <div className="text-xs font-bold mb-2 text-green-500 flex items-center gap-1">
                    <DynamicIcon name="MessageCircle" size={24} style={{ color: '#10b981' }} />
                
                  </div>
                  <div
                    className="p-3 rounded-lg text-sm"
                    style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.15)',
                      border: '2px solid rgba(34, 197, 94, 0.4)',
                      color: 'var(--slide-text)',
                      boxShadow: '0 2px 8px rgba(34, 197, 94, 0.2)'
                    }}
                  >
                    <span className="font-medium">"{currentTurnData.withYAML.response}"</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ConversationTurnFlow.propTypes = {
  className: PropTypes.string
};

export default ConversationTurnFlow;