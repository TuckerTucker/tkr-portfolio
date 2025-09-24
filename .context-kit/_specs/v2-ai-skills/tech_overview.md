# New Component Specifications

## 1. AIInteractionShowcase

### Purpose
Demonstrates the dual-interface concept where humans and AI agents interact with the same data through different modalities, showcasing how different users need different interaction patterns while maintaining data consistency.

### Props
```typescript
{
  title: string;                    // "Human-AI Collaboration"
  description?: string;              // Brief explanation of the concept
  
  humanInterface: {
    type: 'visual' | 'drag-drop' | 'form' | 'canvas';
    preview: string | ReactNode;    // Screenshot or live component
    label: string;                   // "Human Interface"
    description: string;             // "Drag and drop for visual organization"
    interactions: string[];          // ["Drag cards", "Visual feedback", "Instant preview"]
  };
  
  aiInterface: {
    type: 'code' | 'json' | 'yaml' | 'markdown';
    content: string;                 // Actual code/data to display
    label: string;                   // "AI Agent Interface"
    description: string;             // "Direct file manipulation"
    language: string;                // For syntax highlighting
    interactions: string[];          // ["Parse JSON", "Update fields", "Validate structure"]
  };
  
  sharedData: {
    label: string;                   // "Shared Data Model"
    schema?: object;                 // Optional data schema visualization
    flow: 'bidirectional' | 'human-to-ai' | 'ai-to-human';
    syncIndicator?: boolean;         // Show real-time sync animation
  };
  
  examples?: {
    action: string;                  // "Move task to Done"
    humanResult: string;             // "Card animates to new column"
    aiResult: string;                // "JSON status field updates to 'complete'"
  }[];
  
  highlightDifferences?: boolean;   // Emphasize the contrast
  showLiveDemo?: boolean;           // Interactive demonstration
  className?: string;
}
```

### Visual Layout
```
+----------------------------------------------------------+
|  Title & Description                                      |
+------------------+------------------+--------------------+
|  Human Interface |   Shared Data    |   AI Interface     |
|  [Visual Preview]|   [Data Flow]    |   [Code Display]   |
|                  |   ←→ Sync ←→     |                    |
|  • Interaction 1 |                  |   • Interaction 1  |
|  • Interaction 2 |   Schema View    |   • Interaction 2  |
+------------------+------------------+--------------------+
|  Example Actions (if provided)                           |
+----------------------------------------------------------+
```

### Key Features
- Split-screen comparison with clear visual separation
- Animated data flow indicators between interfaces
- Syntax highlighting for code views
- Optional live interaction demo
- Mobile responsive: stacks vertically on small screens
- Theme-aware code highlighting

---

## 2. ContextEvolutionSlide

### Purpose
Visualizes the optimization journey of reducing context size while maintaining information density, specifically showcasing YAML semantic anchors and context compression techniques.

### Props
```typescript
{
  title: string;                    // "Context Optimization"
  
  before: {
    label: string;                  // "Before: Verbose Context"
    content: string;                // Original YAML/JSON content
    lineCount: number;              // 1000
    tokenCount?: number;            // 45,000
    issues: string[];               // ["Repetitive definitions", "Token bloat"]
    language: 'yaml' | 'json';
    highlightProblems?: number[];  // Line numbers to highlight as problematic
  };
  
  after: {
    label: string;                  // "After: Semantic Anchors"
    content: string;                // Optimized content
    lineCount: number;              // 300
    tokenCount?: number;            // 12,000
    improvements: string[];         // ["70% reduction", "Reusable anchors"]
    language: 'yaml' | 'json';
    highlightSolutions?: number[];  // Line numbers showing improvements
  };
  
  optimization: {
    technique: string;              // "YAML Semantic Anchors"
    description: string;            // How it works
    benefits: {
      label: string;
      value: string | number;
      improvement: string;          // "+73%" or "-70%"
      type: 'increase' | 'decrease';
    }[];
  };
  
  comparison: {
    mode: 'side-by-side' | 'overlay' | 'slider' | 'animated';
    showDiff?: boolean;            // Highlight actual changes
    showMetrics?: boolean;         // Display metrics prominently
  };
  
  semanticAnchors?: {
    name: string;                   // "&tech-stack"
    usageCount: number;            // 5
    description: string;           // "Reused across contexts"
  }[];
  
  animateTransition?: boolean;     // Animate the optimization
  className?: string;
}
```

### Visual Layout
```
+----------------------------------------------------------+
|  Context Optimization: From 1000 to 300 Lines            |
+----------------------------------------------------------+
|  [=========Progress Bar=========] 70% Reduction          |
+----------------------------------------------------------+
|  Before (1000 lines)     |     After (300 lines)         |
|  +--------------------+  |  +----------------------+     |
|  | project:           |  |  | project:             |     |
|  |   tech:            |  |  |   tech: *tech-stack  |     |
|  |     - React        |  |  | anchors:             |     |
|  |     - Node         |  |  |   tech-stack: &tech  |     |
|  |     - TypeScript   |  |  |     - React          |     |
|  |   ...              |  |  |     - Node           |     |
|  +--------------------+  |  +----------------------+     |
+----------------------------------------------------------+
|  Semantic Anchors Used:  [&tech-stack ×5] [&patterns ×3]|
+----------------------------------------------------------+
|  Benefits: ⬇ 70% tokens | ⬆ Readability | ⬇ AI costs    |
+----------------------------------------------------------+
```

### Key Features
- Syntax-highlighted code comparison
- Visual diff highlighting
- Animated transition option showing compression
- Metrics dashboard with improvements
- Semantic anchor usage visualization
- Mobile responsive with tabs instead of side-by-side

---

## 3. DualInterfaceDemo

### Purpose
Interactive demonstration allowing users to switch between human and AI views of the same data/functionality, with live updates showing how changes in one interface affect the other.

### Props
```typescript
{
  title: string;                    // "Experience the Dual Interface"
  
  interfaces: {
    human: {
      label: string;                // "Human View"
      component: ReactNode | string; // Interactive component or image
      description: string;
      features: string[];           // ["Visual feedback", "Intuitive controls"]
      primaryAction?: {
        label: string;
        action: () => void;
      };
    };
    
    ai: {
      label: string;                // "AI Agent View"
      component: ReactNode | string; // Code view or terminal
      description: string;
      features: string[];           // ["Direct access", "Bulk operations"]
      primaryAction?: {
        label: string;
        action: () => void;
      };
    };
  };
  
  viewMode: {
    default: 'human' | 'ai' | 'split';
    allowSwitch: boolean;           // User can toggle between views
    transitionType: 'fade' | 'slide' | 'flip';
    splitRatio?: number;            // 50/50, 60/40, etc.
  };
  
  synchronization: {
    enabled: boolean;               // Show real-time sync
    delay?: number;                 // Milliseconds between updates
    showIndicator: boolean;         // Visual sync indicator
    bidirectional: boolean;         // Changes flow both ways
  };
  
  demoScenarios?: {
    id: string;
    label: string;                  // "Add New Task"
    description: string;
    humanSteps: string[];           // ["Click Add", "Type title", "Drag to column"]
    aiSteps: string[];              // ["POST /api/tasks", "Set properties", "Return JSON"]
    duration?: number;              // Animation duration
  }[];
  
  interactionPrompts?: string[];    // ["Try dragging a card", "Edit the JSON"]
  
  showCodeOutput?: boolean;         // Display console/output panel
  enableLiveEdit?: boolean;         // Allow user modifications
  className?: string;
}
```

### Visual Layout
```
+----------------------------------------------------------+
|  [Human View] [Switch Toggle] [AI View]   [Split View]   |
+----------------------------------------------------------+
|                                                          |
|  Active View Area (changes based on selection)          |
|  +----------------------------------------------------+ |
|  |  Human: Visual Interface  |  AI: Code/Terminal     | |
|  |  [Interactive Elements]   |  {JSON/YAML content}   | |
|  |                           |                         | |
|  |  ← Real-time Sync →      |                         | |
|  +----------------------------------------------------+ |
|                                                          |
|  Scenario Controls: [Add Task] [Update] [Delete]        |
|  Interaction Prompts: "Try dragging a card..."          |
+----------------------------------------------------------+
```

### Key Features
- Smooth view transitions with multiple modes
- Real-time synchronization visualization
- Interactive demo scenarios with guided steps
- Live editing capabilities in both interfaces
- Touch-friendly toggle for mobile
- Console output for AI operations
- Accessibility-friendly view switching

---

## 4. AgentConversationFlow

### Purpose
Visualizes the evolution of human-AI conversation patterns, showing progression from basic prompts to sophisticated agent orchestration, with emphasis on context preservation and conversation design.

### Props
```typescript
{
  title: string;                    // "Conversational Evolution"
  
  stages: {
    id: string;
    name: string;                   // "Chatter", "Prompter", etc.
    level: number;                  // 1-5
    
    conversation: {
      messages: {
        role: 'human' | 'ai' | 'system';
        content: string;
        timestamp?: string;
        tokens?: number;
        quality: 'poor' | 'good' | 'excellent';
        annotations?: string[];     // ["No context", "Generic response"]
      }[];
      
      context: {
        provided: boolean;
        type: 'none' | 'basic' | 'structured' | 'semantic';
        size?: number;              // Lines or tokens
        preview?: string;           // YAML/JSON snippet
      };
    };
    
    patterns: {
      name: string;                 // "How might I..."
      description: string;
      effectiveness: number;        // 0-100
      example: string;
    }[];
    
    capabilities: string[];         // ["Single agent", "Basic prompts"]
    limitations: string[];          // ["No memory", "Repetitive context"]
  }[];
  
  currentStage?: number;            // Highlight active stage
  
  features: {
    showTokenCount?: boolean;
    showContextEvolution?: boolean;
    animateMessages?: boolean;
    compareStages?: boolean;        // Side-by-side comparison
  };
  
  orchestration?: {
    agents: {
      name: string;
      role: string;
      color: string;                // For visual distinction
    }[];
    
    flow: {
      from: string;                  // Agent name
      to: string;                    // Agent name
      data: string;                  // What's passed
    }[];
  };
  
  improvements?: {
    metric: string;                 // "Context efficiency"
    before: number;
    after: number;
    unit: string;
  }[];
  
  className?: string;
}
```

### Visual Layout
```
+----------------------------------------------------------+
|  Conversational Evolution: From Chatter to Creator       |
+----------------------------------------------------------+
|  [Stage 1] [Stage 2] [Stage 3] [Stage 4] [Stage 5]      |
+----------------------------------------------------------+
|  Current: Stage 3 - Collaborator                        |
|                                                          |
|  Conversation:                     Context:             |
|  +----------------------+         +------------------+  |
|  | 👤 How do I...       |         | type: structured |  |
|  | 🤖 Let me help...    |         | _project.yml     |  |
|  | 👤 But what about... |         | 45 lines         |  |
|  | 🤖 Based on context..|         +------------------+  |
|  +----------------------+                               |
|                                                          |
|  Patterns Used:                   Capabilities:         |
|  • "How might I..." (85%)         ✓ Context awareness  |
|  • "Goal:" format (72%)           ✓ Memory retention   |
|                                   ✗ Multi-agent        |
|                                                          |
|  [Compare with Stage 2] [Compare with Stage 4]         |
+----------------------------------------------------------+
```

### Key Features
- Animated conversation flow
- Visual distinction between conversation qualities
- Context evolution visualization
- Pattern effectiveness meters
- Stage comparison mode
- Agent orchestration diagram for advanced stages
- Token count tracking
- Mobile-optimized conversation view

---

## 5. ProjectImpactMetrics

### Purpose
Displays quantifiable results and improvements from projects, focusing on concrete metrics, user outcomes, and learned insights with compelling data visualization.

### Props
```typescript
{
  title: string;                    // "Project Impact"
  projectName: string;              // "TaskBoardAI"
  
  metrics: {
    category: 'efficiency' | 'quality' | 'adoption' | 'cost' | 'satisfaction';
    
    kpis: {
      label: string;                // "Time to Complete"
      before: {
        value: number;
        unit: string;               // "minutes", "%", "tasks"
        description?: string;
      };
      after: {
        value: number;
        unit: string;
        description?: string;
      };
      improvement: {
        value: number;
        percentage: number;
        direction: 'increase' | 'decrease';
        visualization: 'bar' | 'line' | 'circular' | 'number';
      };
      impact: 'low' | 'medium' | 'high' | 'critical';
    }[];
  }[];
  
  userOutcomes: {
    type: 'quote' | 'statistic' | 'behavior';
    content: string;
    source?: string;                // "User Interview #3"
    metric?: {
      value: number;
      label: string;
    };
    icon?: string;                   // Icon identifier
  }[];
  
  timeline?: {
    phase: string;                   // "Before", "Implementation", "After"
    duration: string;                // "2 weeks"
    milestones: {
      date: string;
      event: string;
      impact?: string;
    }[];
  }[];
  
  insights: {
    category: 'technical' | 'design' | 'process' | 'user';
    title: string;
    description: string;
    evidence?: string;               // Supporting data
    actionTaken?: string;            // What was done
    icon?: ReactNode;
  }[];
  
  visualization: {
    type: 'dashboard' | 'before-after' | 'journey' | 'mixed';
    colorScheme?: 'default' | 'success' | 'brand';
    animated?: boolean;
    interactive?: boolean;
  };
  
  highlights?: string[];             // Key achievements to emphasize
  
  className?: string;
}
```

### Visual Layout
```
+----------------------------------------------------------+
|  TaskBoardAI: Measurable Impact                          |
+----------------------------------------------------------+
|  Before → After Metrics                                  |
|  +----------------------------------------------------+  |
|  | Task Completion: 15min → 3min   ⬇ 80%   [████░]   |  |
|  | Context Switches: 8 → 2         ⬇ 75%   [████░]   |  |
|  | User Satisfaction: 6.2 → 9.1    ⬆ 47%   [░████]   |  |
|  +----------------------------------------------------+  |
|                                                          |
|  User Outcomes:                                          |
|  "I no longer lose track of tasks" - Developer          |
|  🎯 95% task completion rate (up from 67%)              |
|                                                          |
|  Key Insights:                                           |
|  +----------------------------------------------------+  |
|  | 💡 File-based architecture preferred by AI agents   |  |
|  |    Evidence: 3x faster operations vs database       |  |
|  |    Action: Adopted for all future tools             |  |
|  +----------------------------------------------------+  |
|                                                          |
|  [View Detailed Timeline] [Export Metrics]              |
+----------------------------------------------------------+
```

### Key Features
- Animated metric transitions
- Multiple visualization options
- Before/after comparisons with clear improvements
- User testimony integration
- Interactive dashboard mode
- Responsive metric cards
- Export functionality for metrics
- Color-coded impact levels
- Timeline visualization for project phases

---

## Implementation Notes

### Shared Characteristics
- All components follow the existing theme-aware wrapper pattern
- Mobile-first responsive design with specific breakpoints
- Consistent with current slide CSS variables
- Support for both light and dark themes
- Accessibility compliant with ARIA labels
- Integration with existing ImageCarousel system

### Technical Considerations
- Use existing `cn` utility for className merging
- Leverage `useTheme` hook for theme detection
- Implement suspense boundaries for heavy visualizations
- Consider lazy loading for animation libraries
- Maintain consistent prop patterns with existing components

### State Management
- Local state for interactive elements
- Optional controlled component patterns
- Preserve state during view transitions
- Support for external state management if needed

These components are designed to seamlessly integrate with your existing portfolio architecture while providing powerful new ways to tell your story about AI-human collaboration and the impact of your work.