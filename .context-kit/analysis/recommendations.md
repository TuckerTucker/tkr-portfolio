# Knowledge Graph Enhancement Recommendations

## Current State vs Reality Gap

The knowledge graph currently has 36 entities and 23 relations, but analysis reveals it's heavily skewed toward:
- **Planned AI Skills components** (5 entities) that don't exist yet
- **Infrastructure services** (5 entities) from the context-kit system
- **Limited representation** of actual portfolio components

**Reality**: The portfolio has 80+ actual components, hooks, and files that should be represented.

## Immediate Actions

### 1. Add Core UI Component Entities (High Priority)

```yaml
# Missing shadcn/ui style components
- Badge (src/components/ui/badge.jsx)
- Button (src/components/ui/button.jsx)
- Card (src/components/ui/card.jsx)
- Carousel (src/components/ui/carousel.jsx)
- DropdownMenu (src/components/ui/dropdown-menu.jsx)
- Sheet (src/components/ui/sheet.jsx)
- Skeleton (src/components/ui/skeleton.jsx)
```

### 2. Complete HTML Slides System (Critical)

The slide system is the portfolio's core feature but most components are missing:

```yaml
# Core presentation components
- SlideWrapper (base wrapper for all slides)
- BeforeAfter, BornToTheWorld, DesignSystem
- InteractiveCards, InteractiveCode
- NutrienShowcase, PortfolioShowcase, WorldplayShowcase
- ProcessTimeline, ProjectIntro, SkillsMatrix, TechStack
- UserPersona, UserFlow, UsabilityMetrics
- TheOffHoursCreative, TheSparkAndTheArt
```

### 3. Add Application Architecture Entities

```yaml
# Core app structure
- Main (src/main.jsx) - React entry point
- useProjects (src/hooks/useProjects.js) - Data fetching hook
- utils (src/lib/utils.js) - Shared utilities
- ProjectsData (public/data/projects.json) - Content source
```

### 4. Complete Storybook Documentation Mapping

Add all missing story entities and their **DOCUMENTS** relationships:

```yaml
# Theme stories: Colors, Typography, ColorBlock
# UI stories: Badge, Button, Card, Carousel, DropdownMenu, ThemeToggle
# Layout stories: Header, Footer, Branding
# Content stories: HtmlSlides
# Custom stories: BulletList
# Navigation stories: CustomProjectPicker
```

## Relationship Enhancement

### Component Dependencies
Map actual component usage relationships:

```yaml
# Example missing relationships:
Card → CardHeader, CardContent, CardFooter (CONTAINS)
ImageCarousel → Carousel (USES)
ProjectCard → Badge (USES)
CustomProjectPicker → DropdownMenu (USES)
All HTML slides → SlideWrapper (EXTENDS)
```

### Data Flow Relationships
```yaml
# Data flow mapping:
useProjects → ProjectsData (FETCHES)
App → useProjects (USES)
CustomProjectPicker → useProjects (USES)
ProjectCard → ProjectDefinition (RENDERS)
```

## Knowledge Graph Restructuring

### Rebalance Entity Types
**Current imbalance:**
- 5 AISkillsComponents (planned, don't exist)
- 6 UIComponents (actual, but missing many more)

**Recommended balance:**
- Prioritize existing components over planned ones
- Add comprehensive UI component coverage
- Maintain AI Skills planning but don't let it dominate

### Entity Categorization Strategy
```yaml
# Recommended entity type distribution:
UIComponent: ~25 entities (actual implemented components)
Slide: ~18 entities (HTML slide components)
Story: ~15 entities (Storybook documentation)
Hook: ~3 entities (React hooks)
Utility: ~3 entities (shared utilities)
Data: ~5 entities (JSON data sources)
AISkillsComponent: 5 entities (keep planned components)
Service: 4 entities (keep infrastructure)
```

## Implementation Strategy

### Phase 1: Foundation (Immediate)
1. Add all missing UI components
2. Add HTML slide system
3. Add core application entities (App, Main, hooks)

### Phase 2: Documentation (Week 2)
1. Add all missing Storybook stories
2. Create DOCUMENTS relationships
3. Map component dependencies

### Phase 3: Data Architecture (Week 3)
1. Add project data entities
2. Map data flow relationships
3. Create content-to-component relationships

### Phase 4: Optimization (Ongoing)
1. Review and validate relationships
2. Add missing component dependencies
3. Enhance entity metadata

## Expected Outcomes

After implementation:
- **Entity count**: 36 → ~80+ entities
- **Relation count**: 23 → ~150+ relations
- **Representation accuracy**: Currently ~40% → Target 95%
- **Developer utility**: Significantly improved component discovery
- **Documentation completeness**: Full Storybook mapping

## Automation Recommendations

Consider automating entity creation for:
1. **Component scanning** - Auto-detect React components
2. **Story mapping** - Auto-link stories to components
3. **Import analysis** - Auto-detect component dependencies
4. **Data relationship mapping** - Track data flow through hooks

This would maintain knowledge graph accuracy as the codebase evolves.