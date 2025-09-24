import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  TrendingUp,
  Target,
  Award,
  Brain,
  CheckCircle,
  Circle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Lightbulb,
  Star,
  AlertCircle,
  Zap,
  Rocket
} from 'lucide-react';

// Assessment stages and questions
const assessmentStages = [
  {
    id: 'awareness',
    title: 'AI Awareness',
    description: 'Understanding AI capabilities and limitations',
    color: 'blue',
    questions: [
      {
        id: 'q1',
        text: 'How familiar are you with different AI model types (LLMs, Vision, etc.)?',
        options: [
          { value: 1, text: 'Not familiar', score: 1 },
          { value: 2, text: 'Basic understanding', score: 2 },
          { value: 3, text: 'Good understanding', score: 3 },
          { value: 4, text: 'Expert level', score: 4 }
        ]
      },
      {
        id: 'q2',
        text: 'Do you understand AI limitations and potential biases?',
        options: [
          { value: 1, text: 'Not aware', score: 1 },
          { value: 2, text: 'Somewhat aware', score: 2 },
          { value: 3, text: 'Well aware', score: 3 },
          { value: 4, text: 'Expert awareness', score: 4 }
        ]
      }
    ]
  },
  {
    id: 'prompting',
    title: 'Prompt Engineering',
    description: 'Crafting effective prompts for AI interactions',
    color: 'green',
    questions: [
      {
        id: 'q3',
        text: 'How well can you write clear, specific prompts?',
        options: [
          { value: 1, text: 'Basic prompts only', score: 1 },
          { value: 2, text: 'Decent prompts', score: 2 },
          { value: 3, text: 'Good prompt structure', score: 3 },
          { value: 4, text: 'Advanced techniques', score: 4 }
        ]
      },
      {
        id: 'q4',
        text: 'Do you use iterative prompt refinement?',
        options: [
          { value: 1, text: 'Never', score: 1 },
          { value: 2, text: 'Sometimes', score: 2 },
          { value: 3, text: 'Often', score: 3 },
          { value: 4, text: 'Always systematically', score: 4 }
        ]
      }
    ]
  },
  {
    id: 'integration',
    title: 'Workflow Integration',
    description: 'Incorporating AI into daily workflows',
    color: 'purple',
    questions: [
      {
        id: 'q5',
        text: 'How well do you integrate AI into your workflows?',
        options: [
          { value: 1, text: 'Rarely use AI', score: 1 },
          { value: 2, text: 'Occasional use', score: 2 },
          { value: 3, text: 'Regular integration', score: 3 },
          { value: 4, text: 'Seamless workflow', score: 4 }
        ]
      },
      {
        id: 'q6',
        text: 'Do you use AI for complex, multi-step tasks?',
        options: [
          { value: 1, text: 'Never', score: 1 },
          { value: 2, text: 'Simple tasks only', score: 2 },
          { value: 3, text: 'Moderate complexity', score: 3 },
          { value: 4, text: 'Highly complex tasks', score: 4 }
        ]
      }
    ]
  },
  {
    id: 'collaboration',
    title: 'AI Collaboration',
    description: 'Working effectively with AI as a partner',
    color: 'orange',
    questions: [
      {
        id: 'q7',
        text: 'How well do you collaborate with AI iteratively?',
        options: [
          { value: 1, text: 'One-shot queries', score: 1 },
          { value: 2, text: 'Basic follow-ups', score: 2 },
          { value: 3, text: 'Good back-and-forth', score: 3 },
          { value: 4, text: 'Expert collaboration', score: 4 }
        ]
      },
      {
        id: 'q8',
        text: 'Do you effectively verify and refine AI outputs?',
        options: [
          { value: 1, text: 'Use without checking', score: 1 },
          { value: 2, text: 'Basic verification', score: 2 },
          { value: 3, text: 'Thorough validation', score: 3 },
          { value: 4, text: 'Systematic refinement', score: 4 }
        ]
      }
    ]
  },
  {
    id: 'innovation',
    title: 'AI Innovation',
    description: 'Creating novel AI-powered solutions',
    color: 'red',
    questions: [
      {
        id: 'q9',
        text: 'How creatively do you apply AI to solve problems?',
        options: [
          { value: 1, text: 'Standard use cases', score: 1 },
          { value: 2, text: 'Some creativity', score: 2 },
          { value: 3, text: 'Creative applications', score: 3 },
          { value: 4, text: 'Innovative solutions', score: 4 }
        ]
      },
      {
        id: 'q10',
        text: 'Do you experiment with new AI tools and techniques?',
        options: [
          { value: 1, text: 'Stick to basics', score: 1 },
          { value: 2, text: 'Occasional exploration', score: 2 },
          { value: 3, text: 'Regular experimentation', score: 3 },
          { value: 4, text: 'Cutting-edge adoption', score: 4 }
        ]
      }
    ]
  }
];

const skillLevels = {
  1: { name: 'Beginner', icon: Circle, description: 'Starting your AI journey' },
  2: { name: 'Developing', icon: Target, description: 'Building foundational skills' },
  3: { name: 'Proficient', icon: Award, description: 'Effective AI utilization' },
  4: { name: 'Advanced', icon: Star, description: 'AI power user' },
  5: { name: 'Expert', icon: Rocket, description: 'AI innovation leader' }
};

const AIProgressAssessment = ({ className = "" }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextStage = () => {
    if (currentStage < assessmentStages.length - 1) {
      setCurrentStage(currentStage + 1);
    } else {
      calculateResults();
    }
  };

  const prevStage = () => {
    if (currentStage > 0) {
      setCurrentStage(currentStage - 1);
    }
  };

  const calculateResults = () => {
    setIsCalculating(true);

    setTimeout(() => {
      const stageResults = assessmentStages.map(stage => {
        const stageAnswers = stage.questions.map(q => answers[q.id]?.score || 0);
        const avgScore = stageAnswers.reduce((sum, score) => sum + score, 0) / stageAnswers.length;
        return {
          stage: stage.id,
          title: stage.title,
          color: stage.color,
          score: avgScore,
          level: Math.round(avgScore),
          maxScore: 4
        };
      });

      const overallScore = stageResults.reduce((sum, result) => sum + result.score, 0) / stageResults.length;
      const overallLevel = Math.round(overallScore);

      const recommendations = generateRecommendations(stageResults, overallLevel);

      setResults({
        stages: stageResults,
        overall: {
          score: overallScore,
          level: overallLevel,
          title: skillLevels[overallLevel].name,
          description: skillLevels[overallLevel].description
        },
        recommendations
      });

      setIsCalculating(false);
      setShowResults(true);
    }, 2000);
  };

  const generateRecommendations = (stageResults, overallLevel) => {
    const recommendations = [];
    const weakestStages = stageResults
      .filter(stage => stage.score < 3)
      .sort((a, b) => a.score - b.score)
      .slice(0, 2);

    if (weakestStages.length > 0) {
      weakestStages.forEach(stage => {
        switch (stage.stage) {
          case 'awareness':
            recommendations.push({
              type: 'improve',
              title: 'Deepen AI Understanding',
              description: 'Study different AI model types and their applications',
              action: 'Read AI research papers and experiment with various models',
              priority: 'high'
            });
            break;
          case 'prompting':
            recommendations.push({
              type: 'improve',
              title: 'Master Prompt Engineering',
              description: 'Learn advanced prompting techniques and best practices',
              action: 'Practice with prompt libraries and A/B test your prompts',
              priority: 'high'
            });
            break;
          case 'integration':
            recommendations.push({
              type: 'improve',
              title: 'Enhance Workflow Integration',
              description: 'Identify more opportunities to incorporate AI into daily tasks',
              action: 'Audit your workflows and find AI automation opportunities',
              priority: 'medium'
            });
            break;
          case 'collaboration':
            recommendations.push({
              type: 'improve',
              title: 'Improve AI Collaboration',
              description: 'Develop better iterative dialogue with AI systems',
              action: 'Practice conversational AI interactions and refinement cycles',
              priority: 'medium'
            });
            break;
          case 'innovation':
            recommendations.push({
              type: 'improve',
              title: 'Foster AI Innovation',
              description: 'Explore creative and novel applications of AI technology',
              action: 'Join AI communities and experiment with cutting-edge tools',
              priority: 'low'
            });
            break;
        }
      });
    }

    // Add next level recommendations
    if (overallLevel < 5) {
      const nextLevel = skillLevels[overallLevel + 1];
      recommendations.push({
        type: 'next',
        title: `Progress to ${nextLevel.name} Level`,
        description: nextLevel.description,
        action: 'Focus on your weakest areas and practice advanced techniques',
        priority: 'medium'
      });
    }

    return recommendations;
  };

  const resetAssessment = () => {
    setCurrentStage(0);
    setAnswers({});
    setResults(null);
    setShowResults(false);
    setIsCalculating(false);
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
      green: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
      purple: 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300',
      orange: 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300',
      red: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
    };
    return colors[color] || colors.blue;
  };

  if (showResults && results) {
    return (
      <div className={`w-full max-w-4xl mx-auto p-6 ${className}`}>
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
            <TrendingUp className="text-green-500" />
            Your AI Skills Assessment Results
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive evaluation of your AI collaboration capabilities
          </p>
        </div>

        {/* Overall Score */}
        <Card className="p-8 mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            {React.createElement(skillLevels[results.overall.level].icon, {
              className: "w-12 h-12 text-blue-500"
            })}
            <div>
              <h3 className="text-2xl font-bold">{results.overall.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{results.overall.description}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-lg">
            <span className="font-medium">Overall Score:</span>
            <span className="font-bold text-blue-600">{results.overall.score.toFixed(1)}/4.0</span>
          </div>
        </Card>

        {/* Stage Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {results.stages.map((stage) => (
            <Card key={stage.stage} className={`p-4 border-2 ${getColorClasses(stage.color)}`}>
              <h4 className="font-semibold mb-2">{stage.title}</h4>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {stage.score.toFixed(1)}
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i < stage.level ? 'bg-current' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recommendations */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="text-yellow-500" />
            Personalized Recommendations
          </h3>
          <div className="space-y-4">
            {results.recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  rec.priority === 'high'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                    : rec.priority === 'medium'
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
                    : 'border-green-500 bg-green-50 dark:bg-green-900/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  {rec.type === 'improve' ? (
                    <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Zap className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <h4 className="font-semibold text-sm">{rec.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{rec.description}</p>
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{rec.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="text-center">
          <Button onClick={resetAssessment} className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Take Assessment Again
          </Button>
        </div>
      </div>
    );
  }

  if (isCalculating) {
    return (
      <div className={`w-full max-w-4xl mx-auto p-6 ${className}`}>
        <Card className="p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold mb-2">Calculating Your Results...</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Analyzing your responses and generating personalized recommendations
          </p>
        </Card>
      </div>
    );
  }

  const stage = assessmentStages[currentStage];
  const allStageQuestionsAnswered = stage.questions.every(q => answers[q.id]);

  return (
    <div className={`w-full max-w-4xl mx-auto p-6 ${className}`}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Brain className="text-blue-500" />
          AI Skills Assessment
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Evaluate your AI collaboration skills across 5 key areas
        </p>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 rounded-full h-2 transition-all duration-300"
              style={{ width: `${((currentStage + 1) / assessmentStages.length) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium">
            {currentStage + 1} of {assessmentStages.length}
          </span>
        </div>
      </div>

      {/* Current Stage */}
      <Card className={`p-8 border-2 ${getColorClasses(stage.color)}`}>
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">{stage.title}</h3>
          <p className="text-lg opacity-90">{stage.description}</p>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {stage.questions.map((question, qIndex) => (
            <div key={question.id}>
              <h4 className="font-semibold mb-3">{question.text}</h4>
              <div className="space-y-2">
                {question.options.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-white/50 dark:hover:bg-gray-800/50"
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.value}
                      checked={answers[question.id]?.value === option.value}
                      onChange={() => handleAnswer(question.id, option)}
                      className="w-4 h-4"
                    />
                    <span>{option.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          onClick={prevStage}
          variant="outline"
          disabled={currentStage === 0}
        >
          Previous
        </Button>

        <Button
          onClick={nextStage}
          disabled={!allStageQuestionsAnswered}
          className="flex items-center gap-2"
        >
          {currentStage === assessmentStages.length - 1 ? (
            <>
              <BarChart3 className="w-4 h-4" />
              View Results
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>

      {/* Stage Navigator */}
      <div className="flex justify-center mt-8 gap-2">
        {assessmentStages.map((s, index) => (
          <button
            key={s.id}
            onClick={() => setCurrentStage(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentStage
                ? 'bg-blue-500 scale-125'
                : index < currentStage
                ? 'bg-green-500'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
            title={s.title}
          />
        ))}
      </div>
    </div>
  );
};

export default AIProgressAssessment;