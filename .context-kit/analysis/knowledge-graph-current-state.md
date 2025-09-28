# Knowledge Graph Current State Analysis

## Statistics
- **Entities**: 36
- **Relations**: 23
- **Last Analysis**: 1759017699101

## Entity Types Distribution
- **AISkillsProject**: 3 entities
- **AISkillsComponent**: 5 entities
- **UIComponent**: 6 entities
- **Component**: 6 entities
- **Service**: 4 entities
- **Story**: 2 entities
- **Project**: 1 entity
- **Portfolio**: 1 entity
- **DesignSystem**: 1 entity
- **Documentation**: 1 entity
- **Test**: 1 entity
- **Configuration**: 1 entity
- **Analyzer**: 1 entity
- **Script**: 1 entity
- **API**: 1 entity
- **Database**: 1 entity
- **Module**: 1 entity

## Key Entities

### Portfolio Core
- **TuckerPortfolio**: Main portfolio entity (v2-ai-skills development)
- **PortfolioTheme**: Design system with light/dark modes and CSS variables

### Existing UI Components
- **ImageCarousel**: Dynamic carousel with images/videos/HTML support
- **ProjectCard**: Individual project showcase card
- **ThemeToggle**: Three-way theme toggle (light/dark/system)
- **CustomProjectPicker**: Project selection dropdown
- **Header**: Main navigation and branding
- **ThemeProvider**: Global theme management context

### AI Skills Components (Planned)
- **AIInteractionShowcase**: Interactive AI-human collaboration workflows
- **DualInterfaceDemo**: Split-screen human/AI perspectives
- **ContextEvolutionSlide**: Animated context evolution visualization
- **ProjectImpactMetrics**: Visual metrics for project impact
- **AgentConversationFlow**: AI-human collaboration showcase

### AI Skills Projects (Planned)
- **ContextKitV2**: AGx Design focus
- **TaskBoardAIV2**: Dual Interface focus
- **AIProgressStepsV2**: 5-Stage Journey focus

### Services & Infrastructure
- **dashboard**: React 18 SPA (port 42001)
- **knowledge-graph**: Node.js HTTP API + SQLite (port 42003)
- **logging-client**: Multi-environment logging
- **mcp-integration**: Model Context Protocol server
- **core**: Shared type definitions and utilities

### Documentation
- **StorybookDocs**: 25+ interactive stories across categories

## Relationship Types
- **USES**: Components using other components or themes (10 relations)
- **CONTAINS**: Parent-child structural relationships (7 relations)
- **INCLUDES**: Project inclusion relationships (3 relations)
- **DOCUMENTS**: Documentation relationships (2 relations)
- **DISPLAYS**: Display/rendering relationships (1 relation)

## Key Relationships
1. Most components use **PortfolioTheme** for styling
2. **App** component uses **ThemeProvider** and contains major layout components
3. **Storybook** documentation contains and documents UI components
4. AI Skills projects include their respective specialized components
5. **Portfolio** contains all AI Skills projects