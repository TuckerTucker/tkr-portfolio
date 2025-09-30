import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  FileText,
  Brain,
  TrendingUp,
  Play,
  Eye,
  Code,
  Zap,
  Target,
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';

import ContextKitYamlEditor from '@/components/ai-skills/ContextKitYamlEditor';
import TaskBoardAIDemo from '@/components/ai-skills/TaskBoardAIDemo';
import AIProgressAssessment from '@/components/ai-skills/AIProgressAssessment';

const demos = [
  {
    id: 'context-kit-yaml',
    title: 'Context-Kit YAML Editor',
    description: 'Live YAML optimization demonstrating 1000→300 line compression with semantic anchors and token efficiency.',
    icon: FileText,
    color: 'blue',
    features: [
      'Real-time YAML syntax highlighting',
      'Before/after optimization comparison',
      '70%+ compression metrics display',
      'Interactive editing with validation',
      'Semantic anchor suggestions'
    ],
    technologies: ['YAML Processing', 'Syntax Highlighting', 'Real-time Validation', 'Semantic Analysis'],
    component: ContextKitYamlEditor
  },
  {
    id: 'taskboard-ai',
    title: 'TaskBoardAI Demo',
    description: 'Working kanban board with markdown-to-JSON conversion, drag-and-drop, and dual interface switching.',
    icon: Brain,
    color: 'purple',
    features: [
      'Drag-and-drop kanban functionality',
      'Markdown to structured JSON conversion',
      'Human visual vs AI structured views',
      'File manipulation demonstrations',
      'Real-time task status updates'
    ],
    technologies: ['React DnD', 'Markdown Processing', 'JSON Transformation', 'State Management'],
    component: TaskBoardAIDemo
  },
  {
    id: 'ai-progress-assessment',
    title: 'AI Progress Assessment Tool',
    description: 'Interactive self-assessment across 5 AI skill stages with personalized recommendations and progress visualization.',
    icon: TrendingUp,
    color: 'green',
    features: [
      'Multi-stage skill evaluation',
      'Dynamic scoring and analytics',
      'Personalized improvement recommendations',
      'Progress visualization charts',
      'Next steps guidance'
    ],
    technologies: ['Interactive Forms', 'Data Visualization', 'Analytics Engine', 'Recommendation System'],
    component: AIProgressAssessment
  }
];

const DemoShowcase = ({ className = "" }) => {
  const [activeDemo, setActiveDemo] = useState(null);
  const [showOverview, setShowOverview] = useState(true);

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-800 dark:text-blue-300',
        button: 'bg-blue-500 hover:bg-blue-600',
        icon: 'text-blue-500'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-800',
        text: 'text-purple-800 dark:text-purple-300',
        button: 'bg-purple-500 hover:bg-purple-600',
        icon: 'text-purple-500'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-800 dark:text-green-300',
        button: 'bg-green-500 hover:bg-green-600',
        icon: 'text-green-500'
      }
    };
    return colors[color] || colors.blue;
  };

  const handleDemoSelect = (demo) => {
    setActiveDemo(demo);
    setShowOverview(false);
  };

  const handleBackToOverview = () => {
    setActiveDemo(null);
    setShowOverview(true);
  };

  if (!showOverview && activeDemo) {
    return (
      <div className={`w-full ${className}`}>
        {/* Navigation Header */}
        <div className="mb-6 p-4 border-b">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleBackToOverview}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Demo Showcase
            </Button>
            <div className="flex items-center gap-2">
              {React.createElement(activeDemo.icon, {
                className: `w-5 h-5 ${getColorClasses(activeDemo.color).icon}`
              })}
              <h1 className="text-xl font-semibold">{activeDemo.title}</h1>
            </div>
          </div>
        </div>

        {/* Demo Component */}
        {React.createElement(activeDemo.component, { className: "w-full" })}
      </div>
    );
  }

  return (
    <div className={`w-full max-w-7xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Sparkles className="text-purple-500" />
          AI Skills Demo Showcase
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Interactive demonstrations showcasing Tucker's technical AI capabilities through working applications
        </p>
      </div>

      {/* Demo Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {demos.map((demo) => {
          const colors = getColorClasses(demo.color);
          return (
            <Card
              key={demo.id}
              className={`p-6 border-2 ${colors.border} ${colors.bg} hover:shadow-lg transition-all duration-300 cursor-pointer group`}
              onClick={() => handleDemoSelect(demo)}
            >
              <div className="flex items-center gap-3 mb-4">
                {React.createElement(demo.icon, {
                  className: `w-8 h-8 ${colors.icon}`
                })}
                <h3 className={`text-xl font-bold ${colors.text}`}>{demo.title}</h3>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                {demo.description}
              </p>

              {/* Features */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Key Features:</h4>
                <ul className="space-y-1">
                  {demo.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className={`w-1.5 h-1.5 rounded-full ${colors.icon.replace('text-', 'bg-')} mt-2 flex-shrink-0`} />
                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>
                {demo.features.length > 3 && (
                  <p className="text-xs text-gray-500 mt-2">+{demo.features.length - 3} more features</p>
                )}
              </div>

              {/* Technologies */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {demo.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-medium bg-white/50 dark:bg-gray-800/50 rounded border"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <Button
                className={`w-full ${colors.button} text-white group-hover:scale-105 transition-transform flex items-center justify-center gap-2`}
              >
                <Play className="w-4 h-4" />
                Launch Demo
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Quick Access Section */}
      <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Experience Tucker's AI Expertise</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            These interactive demonstrations showcase real working implementations of AI-enhanced tools and workflows.
            Each demo represents practical applications of AI collaboration, automation, and optimization techniques.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Code className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Working Functionality</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Not just mockups - fully functional demonstrations with real interactions
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">AI Integration</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real examples of AI-powered optimization, analysis, and workflow enhancement
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">Practical Applications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tools and techniques that solve real-world development and collaboration challenges
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => handleDemoSelect(demos[0])}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Start with YAML Editor
            </Button>
            <Button
              onClick={() => handleDemoSelect(demos[1])}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              Try TaskBoard Demo
            </Button>
          </div>
        </div>
      </Card>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
        <p className="text-sm">
          Built with React, TypeScript, and Tailwind CSS • Mobile responsive • Accessibility compliant
        </p>
      </div>
    </div>
  );
};

export default DemoShowcase;