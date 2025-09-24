# Agent Assignments & Territorial Boundaries

## Agent Territorial Ownership Model

Each agent has exclusive ownership of specific files and directories. No two agents may modify the same file to prevent merge conflicts. Agents communicate only through defined interfaces and contracts.

## Wave 1: Foundation Agents

### Agent 1-A: Portfolio Auditor
**Role**: Analyze existing portfolio to establish baseline

**Exclusive Territory**:
- `.context-kit/_specs/audit/` (write)
- `src/components/*` (read-only)
- `src/pages/*` (read-only)
- `public/` (read-only)

**Outputs**:
```
.context-kit/_specs/audit/
├── component-inventory.md
├── integration-points.md
├── existing-patterns.md
├── accessibility-baseline.md
└── mobile-responsive-audit.md
```

**Dependencies**: None
**Consumers**: All Wave 2-5 agents

---

### Agent 1-B: Data Model Architect
**Role**: Define unified TypeScript interfaces and data structures

**Exclusive Territory**:
- `src/types/ai-skills.ts` (create)
- `src/types/ai-metrics.ts` (create)
- `.context-kit/_specs/data-models/` (write)

**Outputs**:
```
src/types/
├── ai-skills.ts        # Core interfaces
└── ai-metrics.ts       # Metric types

.context-kit/_specs/data-models/
├── schemas.md
├── validation.json
└── fixtures/
    ├── context-kit.json
    ├── taskboard.json
    └── progress-steps.json
```

**Dependencies**: None
**Consumers**: All component builders (Wave 2)

---

### Agent 1-C: Interface Contract Designer
**Role**: Define component communication contracts

**Exclusive Territory**:
- `.context-kit/_specs/integration-contracts/` (write)

**Outputs**:
```
.context-kit/_specs/integration-contracts/
├── components.ts       # Component prop interfaces
├── state.ts           # State management contracts
├── events.ts          # Event bus definitions
├── api.md            # API specifications
└── validation.ts     # Contract validators
```

**Dependencies**: None
**Consumers**: All component builders and integrators

---

## Wave 2: Component Builders

### Agent 2-A: AIInteractionShowcase Builder
**Role**: Build foundational dual-interface component

**Exclusive Territory**:
- `src/components/ai-skills/AIInteractionShowcase/` (create)

**Outputs**:
```
src/components/ai-skills/AIInteractionShowcase/
├── index.tsx
├── AIInteractionShowcase.tsx
├── styles.module.css
├── types.ts
├── hooks.ts
├── AIInteractionShowcase.test.tsx
└── AIInteractionShowcase.stories.tsx
```

**Dependencies**: Wave 1 contracts and data models
**Consumers**: Agent 2-B, Wave 3 content creators

---

### Agent 2-B: DualInterfaceDemo Builder
**Role**: Create interactive view switching component

**Exclusive Territory**:
- `src/components/ai-skills/DualInterfaceDemo/` (create)

**Outputs**:
```
src/components/ai-skills/DualInterfaceDemo/
├── index.tsx
├── DualInterfaceDemo.tsx
├── styles.module.css
├── animations.ts
├── transitions.ts
├── DualInterfaceDemo.test.tsx
└── DualInterfaceDemo.stories.tsx
```

**Dependencies**: Wave 1 contracts, Agent 2-A patterns
**Consumers**: Agent 3-B (TaskBoardAI)

---

### Agent 2-C: ContextEvolutionSlide Builder
**Role**: Build YAML optimization visualization

**Exclusive Territory**:
- `src/components/ai-skills/ContextEvolutionSlide/` (create)

**Outputs**:
```
src/components/ai-skills/ContextEvolutionSlide/
├── index.tsx
├── ContextEvolutionSlide.tsx
├── styles.module.css
├── syntax-highlighter.ts
├── metrics-calculator.ts
├── ContextEvolutionSlide.test.tsx
└── ContextEvolutionSlide.stories.tsx
```

**Dependencies**: Wave 1 data models
**Consumers**: Agent 3-A (Context-Kit)

---

### Agent 2-D: ProjectImpactMetrics Builder
**Role**: Create metrics visualization component

**Exclusive Territory**:
- `src/components/ai-skills/ProjectImpactMetrics/` (create)

**Outputs**:
```
src/components/ai-skills/ProjectImpactMetrics/
├── index.tsx
├── ProjectImpactMetrics.tsx
├── styles.module.css
├── visualizations/
│   ├── BarChart.tsx
│   ├── LineChart.tsx
│   ├── CircularProgress.tsx
│   └── NumberDisplay.tsx
├── ProjectImpactMetrics.test.tsx
└── ProjectImpactMetrics.stories.tsx
```

**Dependencies**: Wave 1 data models
**Consumers**: All Wave 3 agents

---

### Agent 2-E: AgentConversationFlow Builder
**Role**: Build conversation evolution visualization

**Exclusive Territory**:
- `src/components/ai-skills/AgentConversationFlow/` (create)

**Outputs**:
```
src/components/ai-skills/AgentConversationFlow/
├── index.tsx
├── AgentConversationFlow.tsx
├── styles.module.css
├── stages/
│   ├── StageOne.tsx
│   ├── StageTwo.tsx
│   ├── StageThree.tsx
│   ├── StageFour.tsx
│   └── StageFive.tsx
├── quality-indicators.ts
├── AgentConversationFlow.test.tsx
└── AgentConversationFlow.stories.tsx
```

**Dependencies**: Wave 1 contracts
**Consumers**: Agent 3-C (AI Progress Steps)

---

## Wave 3: Content Creators

### Agent 3-A: Context-Kit Content Creator
**Role**: Create Context-Kit project showcase

**Exclusive Territory**:
- `src/pages/projects/context-kit-v2/` (create)
- `public/images/context-kit-v2/` (create)

**Outputs**:
```
src/pages/projects/context-kit-v2/
├── index.tsx
├── slides/
│   ├── ProblemJourney.tsx
│   ├── ServiceArchitecture.tsx
│   ├── AGxDesign.tsx
│   ├── YAMLOptimization.tsx
│   └── Results.tsx
├── data.ts
└── navigation.ts
```

**Dependencies**: Wave 2 components
**Consumers**: Agent 4-A (Portfolio Integration)

---

### Agent 3-B: TaskBoardAI Content Creator
**Role**: Create TaskBoardAI project showcase

**Exclusive Territory**:
- `src/pages/projects/taskboard-ai-v2/` (create)
- `public/images/taskboard-ai-v2/` (create)

**Outputs**:
```
src/pages/projects/taskboard-ai-v2/
├── index.tsx
├── slides/
│   ├── FrustratedUser.tsx
│   ├── DualInterface.tsx
│   ├── BeforeAfter.tsx
│   ├── Architecture.tsx
│   └── Validation.tsx
├── data.ts
└── navigation.ts
```

**Dependencies**: Wave 2 components, especially DualInterfaceDemo
**Consumers**: Agent 4-A (Portfolio Integration)

---

### Agent 3-C: AI Progress Steps Content Creator
**Role**: Create AI Progress Steps showcase

**Exclusive Territory**:
- `src/pages/projects/ai-progress-steps-v2/` (create)
- `public/images/ai-progress-v2/` (create)

**Outputs**:
```
src/pages/projects/ai-progress-steps-v2/
├── index.tsx
├── slides/
│   ├── JourneyMap.tsx
│   ├── EmotionalTransitions.tsx
│   ├── SkillsMatrix.tsx
│   ├── PromptEvolution.tsx
│   └── CreatorPersona.tsx
├── data.ts
└── navigation.ts
```

**Dependencies**: Wave 2 components, especially AgentConversationFlow
**Consumers**: Agent 4-A (Portfolio Integration)

---

## Wave 4: Integration Specialists

### Agent 4-A: Portfolio Integration Specialist
**Role**: Connect new content to main portfolio

**Exclusive Territory**:
- `src/pages/index.tsx` (modify - specific sections only)
- `src/components/navigation/MainNav.tsx` (create if not exists)
- `src/pages/hive-landing.tsx` (create)

**Outputs**:
- Updated navigation with AI project links
- Hive.co-specific landing page
- Value proposition messaging
- Project filtering system

**Dependencies**: Wave 3 content
**Consumers**: End users

---

### Agent 4-B: Interactive Demo Engineer
**Role**: Create working demonstrations

**Exclusive Territory**:
- `src/demos/` (create)
- `src/utils/ai-demos/` (create)

**Outputs**:
```
src/demos/
├── ContextKitYAMLEditor.tsx
├── TaskBoardAIDemo.tsx
├── AIProgressAssessment.tsx
└── demos.module.css

src/utils/ai-demos/
├── yaml-optimizer.ts
├── task-parser.ts
├── progress-calculator.ts
└── demo-data.ts
```

**Dependencies**: Wave 2 components
**Consumers**: Wave 3 content creators (integration)

---

## Wave 5: Quality Engineers

### Agent 5-A: Responsive & Accessibility Engineer
**Role**: Ensure mobile and accessibility compliance

**Exclusive Territory**:
- All component `styles.module.css` files (modify)
- `src/utils/accessibility/` (create)

**Outputs**:
- Mobile-responsive CSS updates
- ARIA labels throughout
- Keyboard navigation support
- Focus management utilities

**Dependencies**: All previous waves
**Consumers**: End users

---

### Agent 5-B: Performance & Analytics Engineer
**Role**: Optimize performance and add tracking

**Exclusive Territory**:
- `src/utils/performance/` (create)
- `src/utils/analytics/` (create)
- `next.config.js` or `vite.config.js` (modify specific sections)

**Outputs**:
```
src/utils/performance/
├── lazy-loader.ts
├── code-splitting.ts
└── asset-optimizer.ts

src/utils/analytics/
├── tracker.ts
├── events.ts
└── config.ts
```

**Dependencies**: All previous waves
**Consumers**: Portfolio monitoring

---

## Communication Boundaries

### File-Based Communication
Agents communicate through:
1. **Import statements**: Using exported interfaces from shared types
2. **Props**: Following contracts defined in Wave 1
3. **Events**: Using event bus definitions
4. **Data files**: JSON fixtures in agreed formats

### No Direct Modifications
- Agents NEVER modify files owned by other agents
- Shared configuration uses additive patterns only
- Style conflicts resolved through CSS modules
- State managed through defined contracts

### Integration Points
- Components expose standard props interfaces
- Data flows through type-safe contracts
- Events use namespaced identifiers
- Styles scoped to prevent conflicts

## Validation Checkpoints

After each wave, validate:
1. No file ownership violations
2. All contracts honored
3. Integration tests passing
4. No merge conflicts
5. Dependencies resolved

This territorial model ensures zero conflicts while maximizing parallel execution.