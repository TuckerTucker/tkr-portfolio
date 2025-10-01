import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { User, Bot, Lightbulb } from 'lucide-react';

/**
 * ConversationExamples Component
 *
 * Displays AI agent user research conversations with chat-style message bubbles,
 * showing iterative feedback and design decisions.
 *
 * Used to demonstrate "user research WITH agents" in AGx Design methodology.
 */
const ConversationExamples = ({
  title = "User Research with AI Agents",
  subtitle = "Iterative design decisions through agent feedback",
  conversations = []
}) => {
  const [activeConversation, setActiveConversation] = useState(0);

  const getMessageStyle = (type) => {
    switch (type) {
      case 'human':
        return {
          bubble: 'bg-blue-500 text-white ml-0 mr-12',
          container: 'justify-start',
          icon: <User className="w-5 h-5" />,
          iconBg: 'bg-blue-600'
        };
      case 'agent':
        return {
          bubble: 'bg-purple-500 text-white ml-12 mr-0',
          container: 'justify-end',
          icon: <Bot className="w-5 h-5" />,
          iconBg: 'bg-purple-600'
        };
      case 'decision':
        return {
          bubble: 'bg-yellow-100 dark:bg-yellow-900 text-gray-900 dark:text-yellow-100 border-2 border-yellow-500 mx-8',
          container: 'justify-center',
          icon: <Lightbulb className="w-5 h-5" />,
          iconBg: 'bg-yellow-500'
        };
      default:
        return {
          bubble: 'bg-gray-300 text-gray-900',
          container: 'justify-start',
          icon: null,
          iconBg: 'bg-gray-400'
        };
    }
  };

  const currentConversation = conversations[activeConversation] || { topic: '', exchanges: [] };

  return (
    <div className="flex h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
      {/* Left Side - Title and Conversation Selector */}
      <div className="w-1/3 p-6 md:p-8 border-r border-slate-300 dark:border-slate-700 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {subtitle}
            </p>
          )}
        </div>

        {/* Conversation Selector */}
        {conversations.length > 1 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Conversations
            </h3>
            {conversations.map((conv, idx) => (
              <button
                key={idx}
                onClick={() => setActiveConversation(idx)}
                className={`
                  px-4 py-3 rounded-lg font-medium text-left transition-all
                  ${activeConversation === idx
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-slate-600 hover:shadow-md'
                  }
                `}
              >
                <div className="text-xs font-semibold opacity-70 mb-1">
                  {idx + 1} of {conversations.length}
                </div>
                <div className="text-sm leading-snug">
                  {conv.topic}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Side - Conversation Display */}
      <div className="flex-1 flex flex-col p-6 md:p-8 overflow-hidden">
        {/* Current Conversation Topic */}
        <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {currentConversation.topic}
          </h3>
        </div>

        {/* Conversation Messages */}
        <div className="flex-1 space-y-6 overflow-y-auto pb-4 pr-2">
          {currentConversation.exchanges.map((exchange, idx) => {
            const style = getMessageStyle(exchange.type);

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 ${style.container} animate-fade-in`}
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                {/* Icon */}
                {exchange.type !== 'decision' && (
                  <div className={`
                    flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                    ${style.iconBg} text-white shadow-md
                    ${exchange.type === 'agent' ? 'order-2' : ''}
                  `}>
                    {style.icon}
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`
                  relative max-w-3xl px-5 py-4 rounded-2xl shadow-md
                  ${style.bubble}
                  ${exchange.type === 'decision' ? 'text-center' : ''}
                `}>
                  {/* Speaker Name */}
                  <div className={`
                    text-sm font-semibold mb-2 opacity-90
                    ${exchange.type === 'decision' ? 'flex items-center justify-center gap-2' : ''}
                  `}>
                    {exchange.type === 'decision' && <Lightbulb className="w-4 h-4" />}
                    {exchange.speaker}
                  </div>

                  {/* Message Content */}
                  <div className={`
                    text-base leading-relaxed whitespace-pre-wrap
                    ${exchange.type === 'decision' ? 'font-medium' : ''}
                  `}>
                    {exchange.message}
                  </div>

                  {/* Timestamp (optional) */}
                  {exchange.timestamp && (
                    <div className="text-xs mt-2 opacity-70">
                      {exchange.timestamp}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

ConversationExamples.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  conversations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      topic: PropTypes.string.isRequired,
      exchanges: PropTypes.arrayOf(
        PropTypes.shape({
          type: PropTypes.oneOf(['human', 'agent', 'decision']).isRequired,
          speaker: PropTypes.string.isRequired,
          message: PropTypes.string.isRequired,
          timestamp: PropTypes.string
        })
      ).isRequired
    })
  ).isRequired
};

export default ConversationExamples;
