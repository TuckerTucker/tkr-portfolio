import React from 'react';
import PropTypes from 'prop-types';
import ImageCarousel from '@/components/feature/image-carousel';
import ContentSection from '@/components/feature/content-section';

/**
 * TKR Kanban Project Presentation
 * Uses existing ImageCarousel component with HTML slides to tell the project story
 */
const TkrKanbanPresentation = ({ className = "" }) => {
  // Slide content for the 5-slide explanation
  const slideItems = [
    {
      type: 'html',
      component: 'ProcessTimeline',
      props: {
        title: "The Problem I Was Solving",
        description: "Understanding the challenge that led to TaskBoardAI",
        stages: [
          {
            name: "Pain Point",
            description: "Markdown to-do lists were hard to maintain and update effectively",
            deliverable: "Problem Definition"
          },
          {
            name: "Insight",
            description: "Need dual interface - humans want visual drag-and-drop, AI agents want structured data",
            deliverable: "Design Strategy"
          },
          {
            name: "Goal",
            description: "Create system where both users access same information in optimal formats",
            deliverable: "Solution Vision"
          }
        ],
        activeStage: 1
      },
      alt: "Problem identification and solution approach"
    },
    {
      type: 'html',
      component: 'TechStack',
      props: {
        title: "File-Based Architecture Decision",
        technologies: [
          {
            name: "JSON Data Structure",
            icon: "📄",
            description: "Human-readable, AI-friendly format"
          },
          {
            name: "File Operations",
            icon: "🔧",
            description: "AI agents' natural strength"
          },
          {
            name: "Direct Access",
            icon: "👁️",
            description: "Humans can read structure directly"
          },
          {
            name: "No Database",
            icon: "🚫",
            description: "Eliminates complexity barrier"
          },
          {
            name: "Version Control",
            icon: "📚",
            description: "Built-in change tracking"
          },
          {
            name: "Portability",
            icon: "📦",
            description: "Works anywhere files work"
          }
        ]
      },
      alt: "Technical architecture decisions and benefits"
    },
    {
      type: 'html',
      component: 'BeforeAfter',
      props: {
        title: "The MCP Integration Breakthrough",
        beforeImage: `${import.meta.env.BASE_URL}images/slides/before-mcp.png`,
        afterImage: `${import.meta.env.BASE_URL}images/slides/after-mcp.png`,
        beforeLabel: "Before: Cluttered Prompts",
        afterLabel: "After: Natural Conversation",
        defaultPosition: 30
      },
      alt: "Comparison showing MCP integration impact on AI conversations"
    },
    {
      type: 'html',
      component: 'UserFlow',
      props: {
        title: "Card-First Architecture for Real-Time Collaboration",
        description: "How single attribute changes enable responsive interactions",
        flowSteps: [
          {
            label: "Card Created",
            title: "New Task Card",
            description: "Card object created with default column assignment",
            userActions: ["User adds task title", "System assigns unique ID"],
            systemResponse: "Card appears in 'To Do' column"
          },
          {
            label: "Card Moved",
            title: "Column Change",
            description: "Single attribute update moves card between columns",
            userActions: ["Human drags card", "AI agent updates column property"],
            systemResponse: "Card instantly appears in new column",
            decisionPoints: ["Validation checks", "State consistency"]
          },
          {
            label: "Multi-User",
            title: "Collaboration",
            description: "Both humans and AI agents see changes immediately",
            userActions: ["Human sees visual update", "AI reads new JSON state"],
            systemResponse: "Synchronized state across interfaces"
          }
        ]
      },
      alt: "User flow showing card movement and real-time collaboration"
    },
    {
      type: 'html',
      component: 'UsabilityMetrics',
      props: {
        title: "Validation Through Real-World Use",
        participants: 1,
        metrics: [
          {
            name: "Daily Usage",
            value: "3+ months",
            percentage: 100,
            description: "Used tool daily while creating other projects"
          },
          {
            name: "Error Recovery",
            value: "Real-time",
            percentage: 95,
            description: "Discussed errors with AI agents for solutions"
          },
          {
            name: "Workflow Integration", 
            value: "Seamless",
            percentage: 90,
            description: "Became part of natural development process"
          }
        ],
        tasks: [
          {
            name: "Task Creation",
            description: "Adding new tasks via drag-and-drop or AI",
            successRate: 100,
            avgTime: "< 30 sec"
          },
          {
            name: "Status Updates",
            description: "Moving cards between columns",
            successRate: 100,
            avgTime: "< 5 sec"
          },
          {
            name: "AI Integration",
            description: "AI agents updating board structure",
            successRate: 95,
            avgTime: "< 10 sec"
          }
        ],
        insights: [
          {
            type: "positive",
            title: "Natural Collaboration Pattern",
            description: "The dual interface approach created intuitive human-AI collaboration",
            impact: "high"
          },
          {
            type: "positive", 
            title: "Real-Time Feedback Loop",
            description: "Using the tool while building other projects provided continuous validation",
            impact: "high"
          },
          {
            type: "info",
            title: "Evolution of Understanding",
            description: "Project evolved from markdown frustration to deeper exploration of AI-human task management",
            impact: "medium"
          }
        ]
      },
      alt: "Real-world usage metrics and insights from daily use"
    }
  ];

  const descriptionText = `TaskBoardAI demonstrates how thoughtful interface design can create seamless collaboration between humans and AI agents. By understanding each user type's natural interaction patterns and designing for their strengths, we can create systems that feel intuitive to both humans and AI.

The key insight was recognizing that successful AI interaction design isn't about making AI work like humans, but about creating complementary interfaces that leverage each user's optimal interaction modality while maintaining shared access to the same underlying data.`;

  const bulletPoints = [
    "Dual interface design - visual for humans, structured for AI",
    "File-based architecture leveraging AI agents' natural file operation skills", 
    "MCP integration eliminating repetitive context-setting",
    "Card-first architecture enabling responsive real-time collaboration",
    "Real-world validation through daily use in actual development projects"
  ];

  return (
    <div className={className}>
      {/* Hero slide carousel */}
      <div className="mb-8">
        <ImageCarousel 
          items={slideItems}
          className="aspect-video rounded-lg shadow-lg"
        />
      </div>

      {/* Supporting content */}
      <ContentSection
        title="TaskBoardAI: Designing for Human-AI Collaboration" 
        description={descriptionText}
        bullets={bulletPoints}
        className="max-w-6xl mx-auto"
      />
    </div>
  );
};

TkrKanbanPresentation.propTypes = {
  className: PropTypes.string,
};

export default TkrKanbanPresentation;