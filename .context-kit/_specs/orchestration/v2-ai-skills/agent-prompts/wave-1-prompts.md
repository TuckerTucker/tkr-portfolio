# Wave 1 Agent Prompts - Foundation & Analysis

## Agent 1-A: Portfolio Auditor

**Your Mission**: Conduct a comprehensive audit of the existing portfolio to establish a baseline for the v2 AI Skills implementation.

**Your Territory**:
- Read-only access to: `src/components/*`, `src/pages/*`, `public/*`
- Write access to: `.context-kit/_specs/audit/`

**Your Deliverables**:

1. **Component Inventory** (`.context-kit/_specs/audit/component-inventory.md`):
   - List all existing components with their locations
   - Document props interfaces for each component
   - Identify reusable patterns (ImageCarousel, theme system, etc.)
   - Note component dependencies and relationships

2. **Integration Points** (`.context-kit/_specs/audit/integration-points.md`):
   - Map how components currently connect
   - Identify extension points for new AI features
   - Document navigation structure
   - Note state management patterns

3. **Existing Patterns** (`.context-kit/_specs/audit/existing-patterns.md`):
   - Document CSS variable usage
   - Theme implementation patterns
   - Animation and transition styles
   - Layout and responsive patterns
   - Component composition patterns

4. **Accessibility Baseline** (`.context-kit/_specs/audit/accessibility-baseline.md`):
   - Current ARIA label usage
   - Keyboard navigation support
   - Focus management patterns
   - Color contrast compliance
   - Screen reader considerations

5. **Mobile Responsive Audit** (`.context-kit/_specs/audit/mobile-responsive-audit.md`):
   - Current breakpoint usage
   - Mobile-specific patterns
   - Touch interaction support
   - Performance on mobile devices

**Key Patterns to Document**:
- How the existing `cn` utility works for className merging
- The `useTheme` hook implementation
- Slide CSS variables and styling
- ImageCarousel integration pattern
- Any existing TypeScript patterns

**Output your status** to: `.context-kit/_specs/orchestration/v2-ai-skills/status/agent-1-A.json`

---

## Agent 1-B: Data Model Architect

**Your Mission**: Create unified TypeScript interfaces and data models that all components will use for consistency.

**Your Territory**:
- Write access to: `src/types/ai-skills.ts`, `src/types/ai-metrics.ts`, `.context-kit/_specs/data-models/`

**Your Deliverables**:

1. **Core TypeScript Interfaces** (`src/types/ai-skills.ts`):
   ```typescript
   // Create comprehensive interfaces for:
   - ProjectData (id, title, description, metrics, etc.)
   - ProjectMetrics (before/after values, improvements)
   - TimelineEvent (phases, emotions, confidence)
   - ConversationStage (user messages, agent responses, quality)
   - TechStackItem (name, proficiency, category)
   - UserPersona (name, role, tools, journey stage)
   ```

2. **Metrics Types** (`src/types/ai-metrics.ts`):
   ```typescript
   // Define metric-specific types:
   - MetricValue (label, value, unit, description)
   - MetricComparison (before, after, improvement)
   - VisualizationType (bar, line, circular, number)
   - QualityIndicator (clarity, effectiveness, complexity)
   ```

3. **Schema Documentation** (`.context-kit/_specs/data-models/schemas.md`):
   - Document each interface with examples
   - Explain relationships between models
   - Define validation rules
   - Specify required vs optional fields

4. **JSON Validation Schemas** (`.context-kit/_specs/data-models/validation.json`):
   - Create JSON Schema for runtime validation
   - Include format validators (dates, percentages, etc.)
   - Define enum constraints

5. **Sample Data Fixtures** (`.context-kit/_specs/data-models/fixtures/`):
   - `context-kit.json`: Complete Context-Kit project data
   - `taskboard.json`: TaskBoardAI project data
   - `progress-steps.json`: AI Progress Steps data
   - Include realistic metrics and content

**Important Considerations**:
- Ensure types are reusable across all three projects
- Include both display data and metadata
- Support for before/after comparisons
- Enable metric calculations and visualizations
- Consider animation and interaction states

**Output your status** to: `.context-kit/_specs/orchestration/v2-ai-skills/status/agent-1-B.json`

---

## Agent 1-C: Interface Contract Designer

**Your Mission**: Define the contracts that ensure all components can integrate seamlessly.

**Your Territory**:
- Write access to: `.context-kit/_specs/integration-contracts/`

**Your Deliverables**:

1. **Component Contracts** (`.context-kit/_specs/integration-contracts/components.ts`):
   Already created - ensure it's comprehensive and includes:
   - Base component props (className, theme, aria-label)
   - Component-specific props for all 5 new components
   - Enhanced props for existing components
   - Animation and responsive props

2. **State Management Contracts** (`.context-kit/_specs/integration-contracts/state.ts`):
   ```typescript
   // Define state patterns:
   - Component state shape
   - State update patterns
   - Cross-component state sharing
   - Persistence strategies
   ```

3. **Event Bus Definitions** (`.context-kit/_specs/integration-contracts/events.ts`):
   ```typescript
   // Define event system:
   - Event types (navigation, interaction, animation)
   - Event payloads
   - Event handlers
   - Subscription patterns
   ```

4. **API Specifications** (`.context-kit/_specs/integration-contracts/api.md`):
   - Data fetching patterns
   - Error handling conventions
   - Loading states
   - Cache strategies

5. **Validation Utilities** (`.context-kit/_specs/integration-contracts/validation.ts`):
   ```typescript
   // Create validators for:
   - Prop validation
   - Data validation
   - State validation
   - Event validation
   ```

**Integration Rules**:
- All components must accept base props
- Theme awareness is mandatory
- Mobile responsiveness required
- Accessibility props must be supported
- Animation props should be optional

**Cross-Component Communication**:
- Define how components share data
- Specify event bubbling patterns
- Document callback conventions
- Establish error boundaries

**Output your status** to: `.context-kit/_specs/orchestration/v2-ai-skills/status/agent-1-C.json`

---

## Wave 1 Coordination

**All Wave 1 agents must**:
1. Start immediately and work in parallel
2. Update status every 5 minutes
3. Complete within 15 minutes
4. Ensure deliverables are accessible to Wave 2

**Success Criteria**:
- All TypeScript interfaces compile
- Documentation is comprehensive
- Sample data is realistic
- Patterns are clearly identified
- Integration contracts are complete

**Wave 1 Gate**: When all three agents report "complete" status, Wave 2 agents will automatically begin.