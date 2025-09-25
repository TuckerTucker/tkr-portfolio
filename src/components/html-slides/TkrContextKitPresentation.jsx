import React from 'react';
import PropTypes from 'prop-types';
import ImageCarousel from '@/components/feature/image-carousel';
import ContentSection from '@/components/feature/content-section';

/**
 * TKR Context Kit Project Presentation  
 * Uses existing ImageCarousel component with HTML slides for Agent Experience (AGx) design
 */
const TkrContextKitPresentation = ({ className = "" }) => {
  // Slide content for the 5-slide AGx design explanation
  const slideItems = [
    {
      type: 'html',
      component: 'InteractiveCards',
      props: {
        title: "Agent Experience (AGx) Design Philosophy",
        items: [
          {
            id: "agx-concept",
            icon: "🧠",
            label: "AGx Concept",
            content: "Agent Experience (AGx) Design treats AI agents as primary users with their own needs, preferences, and cognitive patterns. Just as UX design optimizes for human interaction patterns, AGx design creates information architectures and interfaces specifically tailored for how AI agents process, understand, and interact with systems.",
            image: "images/example-310x310.png",
            imagePosition: "left",
            imageAlt: "AI agent interacting with optimized data structures"
          },
          {
            id: "user-research",
            icon: "🔬",
            label: "AI User Research",
            content: "We conducted user research directly with AI agents, iterating on YAML architectures based on their feedback about information density, semantic clarity, and processing efficiency. This human-AI collaborative design process revealed insights about how agents consume context differently than humans.",
            image: "images/example-310x310.png",
            imagePosition: "right",
            imageAlt: "Collaborative design session between human and AI"
          },
          {
            id: "system-impact",
            icon: "⚡",
            label: "System Impact",
            content: "The result is a 70% reduction in token usage while maintaining information density, persistent context that eliminates repetitive explanations, and conversational systems that make every human-AI interaction more effective and productive.",
            image: "images/example-310x310.png",
            imagePosition: "left",
            imageAlt: "Performance metrics showing efficiency improvements"
          }
        ]
      },
      alt: "Agent Experience design philosophy and approach"
    },
    {
      type: 'html',
      component: 'UserPersona',
      props: {
        name: "AI Agent",
        role: "Primary User",
        demographics: {
          "Processing": "Token-based",
          "Memory": "Conversation-scoped", 
          "Strength": "File operations",
          "Weakness": "Context rebuilding"
        },
        goals: [
          "Understand project structure immediately",
          "Focus on problem-solving, not problem-discovery", 
          "Access comprehensive context upfront",
          "Maintain consistency across conversations"
        ],
        painPoints: [
          "Relearning project architecture in every conversation",
          "Spending time on context discovery vs actual work",
          "Inconsistent understanding between sessions",
          "Token waste on repetitive explanations"
        ],
        behaviors: [
          "Processes structured data more efficiently than prose",
          "Prefers hierarchical information organization", 
          "Benefits from semantic vocabulary systems",
          "Excels with progressive disclosure patterns"
        ],
        quote: "Give me comprehensive context upfront so I can focus on solving your actual problems."
      },
      alt: "AI Agent user persona showing needs and behaviors"
    },
    {
      type: 'html',
      component: 'DesignSystem',
      props: {
        title: "The _project.yml Context Architecture",
        typography: [
          {
            name: "Semantic Anchors",
            variants: [
              {
                name: "&tech-stack",
                specs: "Reusable definition",
                sample: "Creates shared vocabulary, reduces token count",
                fontFamily: "monospace",
                fontSize: "14px"
              },
              {
                name: "~service_oriented", 
                specs: "Concept reference",
                sample: "Defines architectural patterns consistently",
                fontFamily: "monospace", 
                fontSize: "14px"
              },
              {
                name: "Progressive Disclosure",
                specs: "Layered information",
                sample: "High-level meta → detailed operational patterns",
                fontSize: "16px"
              }
            ]
          }
        ],
        colors: [
          {
            name: "Information Hierarchy",
            variants: [
              { name: "Meta", hex: "#3B82F6" },
              { name: "Architecture", hex: "#10B981" }, 
              { name: "Operations", hex: "#F59E0B" },
              { name: "Context", hex: "#8B5CF6" }
            ]
          },
          {
            name: "Token Efficiency", 
            variants: [
              { name: "Before: 1000 lines", hex: "#EF4444" },
              { name: "After: 300 lines", hex: "#10B981" },
              { name: "Compression: 70%", hex: "#3B82F6" }
            ]
          }
        ]
      },
      alt: "YAML context architecture showing semantic anchors and information hierarchy"
    },
    {
      type: 'html',
      component: 'SkillsMatrix',
      props: {
        title: "AGx Design - Agent Experience as Primary User",
        categories: [
          { id: "research", name: "User Research" },
          { id: "architecture", name: "Information Architecture" },
          { id: "patterns", name: "Interaction Patterns" }
        ],
        skills: [
          {
            id: "agent-interviews",
            name: "Agent Interviews",
            category: "research", 
            proficiency: 5,
            description: "Regularly asking AI agents what they need to better understand contexts",
            experience: "Daily conversations",
            projects: ["Context format optimization", "Vocabulary system design"]
          },
          {
            id: "yaml-design",
            name: "YAML Architecture", 
            category: "architecture",
            proficiency: 5,
            description: "Agents preferred YAML's hierarchical structure over JSON/Mermaid",
            experience: "Format comparison studies",
            projects: ["Semantic anchor system", "Progressive disclosure patterns"]
          },
          {
            id: "consumption-patterns",
            name: "Consumption Patterns",
            category: "patterns",
            proficiency: 5, 
            description: "Understanding how AI agents process and utilize contextual information",
            experience: "Iterative feedback loops",
            projects: ["Token optimization", "Cognitive load reduction"]
          },
          {
            id: "vocabulary-systems",
            name: "Shared Vocabulary",
            category: "architecture",
            proficiency: 4,
            description: "Creating domain-specific language for projects",
            experience: "Semantic anchor implementation",
            projects: ["Context compression", "Consistency systems"]
          }
        ]
      },
      alt: "Skills matrix showing AGx design capabilities and agent-focused UX research"
    },
    {
      type: 'html',
      component: 'TechStack',
      props: {
        title: "Service-Oriented Architecture for Modularity",
        technologies: [
          {
            name: "React Dashboard",
            icon: "⚛️", 
            description: "Human visual interface"
          },
          {
            name: "Knowledge Graph",
            icon: "🕸️",
            description: "Component relationships"
          },
          {
            name: "MCP Integration", 
            icon: "🔌",
            description: "Persistent AI memory"
          },
          {
            name: "Specialized Agents",
            icon: "🤖",
            description: "11 context-specific agents"
          },
          {
            name: "YAML Context",
            icon: "📋",
            description: "Semantic anchor system"
          },
          {
            name: "Auto-Update",
            icon: "🔄", 
            description: "Context stays current"
          }
        ]
      },
      alt: "Service-oriented architecture components enabling modular AI collaboration"
    },
    {
      type: 'html',
      component: 'InteractiveCards',
      props: {
        title: "Key AGx Design Innovations",
        items: [
          {
            id: "semantic-anchors",
            icon: "⚓",
            label: "Semantic Anchors",
            content: "YAML anchors create reusable definitions that agents can reference efficiently. Instead of repeating 'TypeScript + React + SQLite' multiple times, we define &tech-stack once and reference it, reducing tokens by 70% while maintaining semantic clarity for AI comprehension.",
            image: "images/example-310x310.png",
            imagePosition: "right",
            imageAlt: "YAML anchor system showing reusable definitions"
          },
          {
            id: "progressive-disclosure",
            icon: "📈",
            label: "Progressive Context",
            content: "Information architecture follows AI cognitive patterns - high-level metadata first, then detailed operational context. This mirrors how agents naturally process information: understanding scope before diving into implementation details.",
            image: "images/example-310x310.png",
            imagePosition: "left",
            imageAlt: "Layered information architecture diagram"
          },
          {
            id: "persistent-memory",
            icon: "🧠",
            label: "Persistent Memory",
            content: "MCP integration provides agents with persistent context across conversations. No more rebuilding understanding from scratch - agents maintain project knowledge, architectural decisions, and historical context between sessions.",
            image: "images/example-310x310.png",
            imagePosition: "right",
            imageAlt: "AI memory system maintaining context across sessions"
          }
        ]
      },
      alt: "Core innovations in Agent Experience design methodology"
    },
    {
      type: 'html',
      component: 'ProcessTimeline',
      props: {
        title: "Conversational Systems Design",
        description: "Building entire systems for human-AI collaboration where conversation is the primary interface",
        stages: [
          {
            name: "Dual Interfaces",
            description: "Humans get visual dashboards, agents get structured data - same information, optimal formats",
            deliverable: "Interface Strategy"
          },
          {
            name: "Agent Orchestration", 
            description: "Parallel agents update different parts, consolidation agent synthesizes results",
            deliverable: "Workflow Design"
          },
          {
            name: "Persistent Context",
            description: "Eliminates need to re-establish project understanding in each conversation", 
            deliverable: "Memory System"
          },
          {
            name: "Historical Learning",
            description: "System for recurring bugs/solutions and architectural changes with reasoning",
            deliverable: "Knowledge Base"
          },
          {
            name: "Collaboration Framework", 
            description: "Designed specifically for how humans and AI can work together effectively",
            deliverable: "AGx Standards"
          }
        ],
        activeStage: 2
      },
      alt: "Process timeline showing evolution from problem to conversational systems design"
    }
  ];

  const descriptionText = `tkr-context-kit represents pioneering work in Agent Experience (AGx) Design - essentially UX design for AI agents. By conducting user research with AI agents themselves and designing information architecture for their consumption patterns, this project demonstrates how we can create systems that optimize human-AI collaboration.

The breakthrough insight was treating AI agents as primary users with their own needs, preferences, and cognitive patterns. This led to designing semantic architectures, progressive context disclosure, and conversational memory systems that make every interaction more effective.`;

  const bulletPoints = [
    "Agent Experience (AGx) design with AI agents as primary users",
    "User research conducted directly with AI agents for iterative feedback",
    "Semantic anchor YAML system reducing token count by 70% while maintaining information density", 
    "Service-oriented architecture enabling modular AI collaboration tools",
    "Conversational systems design for persistent context and memory across interactions"
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
        title="tkr-context-kit: Pioneering Agent Experience (AGx) Design"
        description={descriptionText}
        bullets={bulletPoints} 
        className="max-w-6xl mx-auto"
      />
    </div>
  );
};

TkrContextKitPresentation.propTypes = {
  className: PropTypes.string,
};

export default TkrContextKitPresentation;