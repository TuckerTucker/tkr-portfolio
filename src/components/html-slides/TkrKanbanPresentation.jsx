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
      component: 'InteractiveCards',
      props: {
        title: "The Problem To Be Solved",
        items: [
          {
            id: "pain",
            icon: "😫",
            label: "Pain Point",
            content: "When coding with an AI agent it's common to track development tasks using a markdown file. The challenge is that AI can understand an entire markdown document by simply by holding it in context. A person, on the other hand, needs to read the entire document to get the same level of understanding. AI can make multiple edits the document simultaneously. While a person need to edit the document word by word.  So, what if there was a way for a Person and an AI to get the same information in a format better designed for their needs? "
          },
          {
            id: "insight",
            icon: "💡",
            label: "Insight",
            content: "Using a JSON format AI can see the plan structure instantly while a person would prefer the common kanban UI."
          },
          {
            id: "goal",
            icon: "🎯",
            label: "Goal",
            content: "Create a dual-interface kanban system where humans enjoy intuitive visual interactions while AI agents efficiently parse and modify the same task data through their preferred file-based operations - enabling true human-AI collaborative task management."
          }
        ]
      },
      alt: "Problem identification and solution approach with interactive exploration"
    },
    {
      type: 'html',
      component: 'InteractiveCards',
      props: {
        title: "Dual Interface Architecture",
        items: [
          {
            id: "mcp",
            icon: "🔌",
            label: "MCP Protocol",
            content: "The MCP server provides automatic context to AI agents, eliminating the need to include JSON examples in every prompt. This creates natural conversations where agents can immediately understand and interact with the kanban structure without requiring database management skills or repeated context establishment."
          },
          {
            id: "json",
            icon: "📄",
            label: "JSON Data Source",
            content: "File-based architecture serves as the single source of truth that both interfaces can access. AI agents leverage their existing file editing capabilities to modify tasks directly, while the JSON structure remains human-readable for transparency. The card-first design enables efficient updates - moving a card between columns requires only a single attribute change rather than restructuring the entire board."
          },
          {
            id: "webui",
            icon: "🖥️",
            label: "Web UI",
            content: "Responsive drag-and-drop interface that provides humans with the visual, tactile experience they expect from kanban boards. Real-time updates reflect changes made by either human users or AI agents, creating seamless collaboration where both parties can see the results of each other's work immediately."
          }
        ]
      },
      alt: "Dual interface approach demonstrating design for multiple user types"
    },
    {
      type: 'html',
      component: 'InteractiveCode',
      props: {
        title: "Kanban Creation Prompting",
        items: [
          {
            id: "spec",
            icon: "📋",
            label: "Spec",
            filePath: "tic-tac-toe-spec.md",
            filename: "Technical Specification"
          },
          {
            id: "plan",
            icon: "📝",
            label: "Plan",
            filePath: "tic-tac-toe-implementation.md",
            filename: "Implementation Plan"
          },
          {
            id: "prompt",
            icon: "🤖",
            label: "Prompt",
            filePath: "taskboard-prompt.md",
            filename: "AI Generation Prompt"
          },
          {
            id: "json",
            icon: "⚙️",
            label: "JSON",
            filePath: "taskboard-tic-tac-toe.json",
            filename: "Generated Kanban Board"
          }
        ]
      },
      alt: "Interactive workflow showing spec to kanban JSON generation process"
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