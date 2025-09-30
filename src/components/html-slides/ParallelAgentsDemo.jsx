import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * ParallelAgentsDemo - Interactive visualization of parallel agent execution
 * Shows how multiple AI agents work simultaneously on portfolio analysis
 */
const ParallelAgentsDemo = ({ className = "" }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [agents, setAgents] = useState([
    {
      id: 'component-analyzer',
      name: 'Component Analyzer',
      icon: '🔍',
      phase: 1,
      duration: 2000,
      status: 'pending',
      progress: 0,
      result: 'Found 33 components',
      description: 'Scanning React components'
    },
    {
      id: 'import-mapper',
      name: 'Import Mapper',
      icon: '🔗',
      phase: 2,
      duration: 3000,
      status: 'pending',
      progress: 0,
      result: 'Mapped 45 dependencies',
      description: 'Analyzing imports'
    },
    {
      id: 'hooks-analyzer',
      name: 'Hooks Analyzer',
      icon: '🪝',
      phase: 2,
      duration: 3000,
      status: 'pending',
      progress: 0,
      result: 'Found 12 hook usages',
      description: 'Detecting React hooks'
    },
    {
      id: 'data-flow',
      name: 'Data Flow',
      icon: '📊',
      phase: 3,
      duration: 2000,
      status: 'pending',
      progress: 0,
      result: 'Traced 8 data flows',
      description: 'Mapping data patterns'
    }
  ]);

  const [totalTime, setTotalTime] = useState(0);

  const sequentialTime = agents.reduce((sum, agent) => sum + agent.duration, 0);
  const parallelTime = Math.max(
    agents.filter(a => a.phase === 1).reduce((sum, a) => sum + a.duration, 0),
    agents.filter(a => a.phase === 2).reduce((sum, a) => sum + a.duration, 0),
    agents.filter(a => a.phase === 3).reduce((sum, a) => sum + a.duration, 0)
  );

  useEffect(() => {
    if (!isRunning) return;

    const phases = [
      { phase: 1, duration: 2000 },
      { phase: 2, duration: 3000 },
      { phase: 3, duration: 2000 }
    ];

    let phaseIndex = 0;
    let startTime = Date.now();

    const runPhase = () => {
      if (phaseIndex >= phases.length) {
        setIsRunning(false);
        setTotalTime(parallelTime);
        return;
      }

      const { phase, duration } = phases[phaseIndex];
      setCurrentPhase(phase);

      // Start agents in this phase
      setAgents(prev => prev.map(agent =>
        agent.phase === phase
          ? { ...agent, status: 'running', progress: 0 }
          : agent
      ));

      // Animate progress
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);

        setAgents(prev => prev.map(agent =>
          agent.phase === phase && agent.status === 'running'
            ? { ...agent, progress }
            : agent
        ));

        if (progress >= 100) {
          clearInterval(interval);
          setAgents(prev => prev.map(agent =>
            agent.phase === phase
              ? { ...agent, status: 'complete', progress: 100 }
              : agent
          ));
          phaseIndex++;
          startTime = Date.now();
          setTimeout(runPhase, 500);
        }
      }, 50);
    };

    runPhase();
  }, [isRunning]);

  const handleStart = () => {
    setAgents(prev => prev.map(agent => ({ ...agent, status: 'pending', progress: 0 })));
    setCurrentPhase(0);
    setTotalTime(0);
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setAgents(prev => prev.map(agent => ({ ...agent, status: 'pending', progress: 0 })));
    setCurrentPhase(0);
    setTotalTime(0);
  };

  return (
    <div className={`flex flex-col h-full p-4 md:p-6 ${className}`}>
      <div className="flex flex-col lg:flex-row gap-4 h-full min-h-0">
        {/* Left: Agent Timeline */}
        <div className="flex-1 flex flex-col min-h-0">
          <h2 className="font-heading text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--slide-title)' }}>
            Parallel Agents in Action
          </h2>
          <p className="text-sm mb-4 opacity-80" style={{ color: 'var(--slide-text)' }}>
            Watch how multiple agents analyze tkr-portfolio simultaneously
          </p>

          {/* Agent Cards */}
          <div className="space-y-2 flex-1 overflow-y-auto mb-3 pr-2 pl-1 pt-1">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  agent.status === 'running' ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                } ${
                  agent.status === 'complete' ? 'ring-2 ring-green-500 ring-offset-1' : ''
                }`}
                style={{
                  backgroundColor: 'var(--slide-card-bg)',
                  border: '1px solid var(--slide-card-border)'
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{agent.icon}</span>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: 'var(--slide-text)' }}>
                        {agent.name}
                      </div>
                      <div className="text-xs opacity-60" style={{ color: 'var(--slide-text)' }}>
                        Wave {agent.phase} • {agent.duration / 1000}s
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-medium" style={{ color: 'var(--slide-text)' }}>
                    {agent.status === 'pending' && '⏸️'}
                    {agent.status === 'running' && '⏳'}
                    {agent.status === 'complete' && '✅'}
                  </div>
                </div>

                {/* Progress Bar */}
                {agent.status !== 'pending' && (
                  <div className="mb-1.5">
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-100 ${
                          agent.status === 'complete' ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${agent.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Description & Result */}
                <div className="text-xs opacity-80" style={{ color: 'var(--slide-text)' }}>
                  {agent.status === 'complete' ? agent.result : agent.description}
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={handleStart}
              disabled={isRunning}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--slide-card-bg)',
                border: '2px solid var(--slide-card-border)',
                color: 'var(--slide-text)'
              }}
            >
              {isRunning ? '⏳ Running...' : '▶️ Start Analysis'}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'var(--slide-card-bg)',
                border: '2px solid var(--slide-card-border)',
                color: 'var(--slide-text)'
              }}
            >
              🔄 Reset
            </button>
          </div>
        </div>

        {/* Right: Metrics & Comparison */}
        <div className="lg:w-80 flex flex-col gap-3 min-h-0">
          {/* Time Comparison */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--slide-card-bg)',
              border: '1px solid var(--slide-card-border)'
            }}
          >
            <h3 className="font-semibold text-base mb-3" style={{ color: 'var(--slide-title)' }}>
              ⏱️ Time Comparison
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs opacity-80" style={{ color: 'var(--slide-text)' }}>Sequential</span>
                  <span className="font-semibold text-sm text-red-500">{sequentialTime / 1000}s</span>
                </div>
                <div className="h-1.5 bg-red-200 dark:bg-red-900 rounded-full" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs opacity-80" style={{ color: 'var(--slide-text)' }}>Parallel</span>
                  <span className="font-semibold text-sm text-green-500">{parallelTime / 1000}s</span>
                </div>
                <div className="h-1.5 bg-green-200 dark:bg-green-900 rounded-full" />
              </div>
              <div className="pt-2 border-t" style={{ borderColor: 'var(--slide-card-border)' }}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {Math.round(((sequentialTime - parallelTime) / sequentialTime) * 100)}%
                  </div>
                  <div className="text-xs opacity-80" style={{ color: 'var(--slide-text)' }}>
                    Faster
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase Visualization - Compact */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--slide-card-bg)',
              border: '1px solid var(--slide-card-border)'
            }}
          >
            <h3 className="font-semibold text-base mb-3" style={{ color: 'var(--slide-title)' }}>
              📊 Execution Waves
            </h3>
            <div className="space-y-2">
              {[1, 2, 3].map((phase) => {
                const phaseAgents = agents.filter(a => a.phase === phase);
                const allComplete = phaseAgents.every(a => a.status === 'complete');
                const anyRunning = phaseAgents.some(a => a.status === 'running');

                return (
                  <div
                    key={phase}
                    className={`p-2 rounded ${
                      anyRunning ? 'ring-1 ring-blue-500' : ''
                    } ${
                      allComplete ? 'ring-1 ring-green-500' : ''
                    }`}
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      border: '1px solid var(--slide-card-border)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium" style={{ color: 'var(--slide-text)' }}>
                          Wave {phase}
                        </span>
                        <div className="flex gap-1">
                          {phaseAgents.map(agent => (
                            <span key={agent.id} className="text-sm">
                              {agent.icon}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs opacity-60" style={{ color: 'var(--slide-text)' }}>
                        {Math.max(...phaseAgents.map(a => a.duration)) / 1000}s
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ParallelAgentsDemo.propTypes = {
  className: PropTypes.string
};

export default ParallelAgentsDemo;