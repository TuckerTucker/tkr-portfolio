import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";

/**
 * UsabilityMetrics HTML Slide Component
 * Displays usability test results and metrics in a visual format.
 * Includes completion rates, time on task, and satisfaction scores.
 */
const UsabilityMetrics = ({
  title = "Usability Test Results",
  participants = 0,
  metrics = [],
  tasks = [],
  insights = [],
  className,
  isMobile, // Extract isMobile prop to prevent DOM warnings
  ...props
}) => {
  const [activeTab, setActiveTab] = useState('metrics');
  
  // Calculate average task success rate
  const avgSuccessRate = tasks.length 
    ? tasks.reduce((sum, task) => sum + task.successRate, 0) / tasks.length 
    : 0;
    
  // Color function for metrics
  const getMetricColor = (value, threshold1 = 33, threshold2 = 66) => {
    if (value < threshold1) return 'bg-red-500';
    if (value < threshold2) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={cn("w-full h-full flex flex-col p-6 bg-gradient-to-r from-gray-900 to-gray-800", className)} {...props}>
      <div className="mb-5 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading text-white">{title}</h2>
          <p className="text-sm text-gray-400">{participants} participants</p>
        </div>
        
        {/* Tab navigation */}
        <div className="flex space-x-2 bg-gray-700 rounded-lg p-1">
          <button 
            className={cn(
              "px-3 py-1 text-sm rounded-md transition-colors",
              activeTab === 'metrics' 
                ? "bg-blue-500 text-white" 
                : "text-gray-300 hover:text-white"
            )}
            onClick={() => setActiveTab('metrics')}
          >
            Metrics
          </button>
          <button 
            className={cn(
              "px-3 py-1 text-sm rounded-md transition-colors",
              activeTab === 'tasks' 
                ? "bg-blue-500 text-white" 
                : "text-gray-300 hover:text-white"
            )}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks
          </button>
          <button 
            className={cn(
              "px-3 py-1 text-sm rounded-md transition-colors",
              activeTab === 'insights' 
                ? "bg-blue-500 text-white" 
                : "text-gray-300 hover:text-white"
            )}
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </button>
        </div>
      </div>
      
      {/* Content area */}
      <div className="flex-grow overflow-auto">
        {/* Metrics tab */}
        {activeTab === 'metrics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall success rate */}
            <div className="bg-gray-800 rounded-lg p-5 flex flex-col items-center justify-center">
              <div className="mb-3 text-center">
                <h3 className="text-sm uppercase tracking-wider text-gray-400">Overall Success Rate</h3>
              </div>
              
              <div className="relative w-40 h-40">
                {/* Circle progress */}
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    stroke="#374151"
                    strokeWidth="10"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    stroke={avgSuccessRate >= 66 ? "#10B981" : avgSuccessRate >= 33 ? "#F59E0B" : "#EF4444"}
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - avgSuccessRate / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                {/* Percentage text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{Math.round(avgSuccessRate)}%</span>
                </div>
              </div>
              
              <p className="mt-4 text-sm text-gray-400 text-center">
                Average success rate across all tasks
              </p>
            </div>
            
            {/* Key metrics */}
            <div className="bg-gray-800 rounded-lg p-5">
              <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-4">Key Metrics</h3>
              
              <div className="space-y-5">
                {metrics.map((metric, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-white">{metric.name}</span>
                      <span className="text-sm text-white">{metric.value}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full",
                          getMetricColor(metric.percentage)
                        )}
                        style={{ width: `${metric.percentage}%` }}
                      />
                    </div>
                    {metric.description && (
                      <p className="mt-1 text-xs text-gray-400">{metric.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Tasks tab */}
        {activeTab === 'tasks' && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-700 flex items-center text-sm font-medium text-gray-400">
              <div className="w-1/2">Task</div>
              <div className="w-1/4 text-center">Success Rate</div>
              <div className="w-1/4 text-center">Avg. Time</div>
            </div>
            
            <div className="divide-y divide-gray-700">
              {tasks.map((task, index) => (
                <div key={index} className="px-5 py-4 flex items-center">
                  <div className="w-1/2">
                    <h4 className="text-sm font-medium text-white">{task.name}</h4>
                    {task.description && (
                      <p className="text-xs text-gray-400 mt-1">{task.description}</p>
                    )}
                  </div>
                  
                  <div className="w-1/4 text-center">
                    {/* Success rate */}
                    <div className="inline-flex items-center">
                      <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden mr-2">
                        <div 
                          className={getMetricColor(task.successRate)}
                          style={{ width: `${task.successRate}%`, height: '100%' }}
                        />
                      </div>
                      <span className="text-sm text-white">{task.successRate}%</span>
                    </div>
                  </div>
                  
                  <div className="w-1/4 text-center">
                    {/* Average time */}
                    <span className="text-sm text-white">{task.avgTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Insights tab */}
        {activeTab === 'insights' && (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-5">
                <div className="flex items-start">
                  {/* Icon based on type */}
                  <div className={cn(
                    "w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center mr-3",
                    insight.type === 'positive' ? 'bg-green-500/20 text-green-400' :
                    insight.type === 'negative' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                  )}>
                    {insight.type === 'positive' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : insight.type === 'negative' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <h4 className={cn(
                      "text-sm font-medium mb-1",
                      insight.type === 'positive' ? 'text-green-400' :
                      insight.type === 'negative' ? 'text-red-400' :
                      'text-blue-400'
                    )}>
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-300">{insight.description}</p>
                    
                    {insight.action && (
                      <div className="mt-3 bg-gray-700 p-3 rounded border-l-4 border-blue-500">
                        <span className="text-xs font-medium text-blue-400 block mb-1">Action Taken:</span>
                        <p className="text-xs text-gray-300">{insight.action}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Impact indicator */}
                  {insight.impact && (
                    <div className="ml-2 flex-shrink-0">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        insight.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                        insight.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      )}>
                        {insight.impact} impact
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

UsabilityMetrics.propTypes = {
  title: PropTypes.string,
  participants: PropTypes.number,
  metrics: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      percentage: PropTypes.number.isRequired, // 0-100
      description: PropTypes.string
    })
  ),
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      successRate: PropTypes.number.isRequired, // 0-100
      avgTime: PropTypes.string.isRequired
    })
  ),
  insights: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['positive', 'negative', 'info']).isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      impact: PropTypes.oneOf(['high', 'medium', 'low']),
      action: PropTypes.string
    })
  ),
  className: PropTypes.string
};

export default UsabilityMetrics;