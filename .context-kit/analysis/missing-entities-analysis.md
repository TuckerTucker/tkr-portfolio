# Missing Entities and Relations Analysis

## Executive Summary

After analyzing the codebase structure and comparing it with the current knowledge graph, several key entities and relationships are missing. The knowledge graph is heavily focused on AI Skills components (planned) and infrastructure services, but lacks representation for:

1. **Most actual UI components** currently implemented
2. **HTML slide components** that are core to the portfolio
3. **Core application files** and hooks
4. **Project data structure** and content relationships
5. **Storybook stories** that document existing components

## Missing Component Entities

### Core UI Components (Found in codebase, missing from KG)
- **Badge** (`src/components/ui/badge.jsx`) - Status/label component
- **Button** (`src/components/ui/button.jsx`) - Base button with variants
- **Card** (`src/components/ui/card.jsx`) - Container component with subcomponents
- **Carousel** (`src/components/ui/carousel.jsx`) - Base carousel functionality
- **DropdownMenu** (`src/components/ui/dropdown-menu.jsx`) - Radix-based dropdown
- **Sheet** (`src/components/ui/sheet.jsx`) - Modal/drawer component
- **Skeleton** (`src/components/ui/skeleton.jsx`) - Loading placeholder

### Layout Components
- **Footer** (`src/components/layout/footer.jsx`) - Site footer

### Feature Components
- **BulletListContainer** (`src/components/feature/bullet-list-container.jsx`)
- **ContentSection** (`src/components/feature/content-section.jsx`)
- **Description** (`src/components/feature/description.jsx`)

### Custom Components
- **Branding** (`src/components/custom/branding.jsx`) - Brand display
- **BulletList** (`src/components/custom/bullet-list.jsx`) - Styled lists
- **CardHeader** (`src/components/custom/card-header.jsx`)
- **ColorBlock** (`src/components/custom/color-block.jsx`) - Theme color display
- **ProjectCardList** (`src/components/custom/project-card-list.jsx`)
- **ProjectInfo** (`src/components/custom/project-info.jsx`)

### Common Components
- **ImageLightbox** (`src/components/common/ImageLightbox.jsx`) - Image modal viewer

## Missing HTML Slide Components

The portfolio's core feature is the HTML slide system, but most slide components are missing:

### Existing Slide Components (Missing from KG)
- **SlideWrapper** (`src/components/html-slides/slide-wrapper.jsx`) - Base wrapper
- **BeforeAfter** (`src/components/html-slides/BeforeAfter.jsx`)
- **BornToTheWorld** (`src/components/html-slides/BornToTheWorld.jsx`)
- **DesignSystem** (`src/components/html-slides/DesignSystem.jsx`)
- **InteractiveCards** (`src/components/html-slides/InteractiveCards.jsx`)
- **InteractiveCode** (`src/components/html-slides/InteractiveCode.jsx`)
- **NutrienShowcase** (`src/components/html-slides/NutrienShowcase.jsx`)
- **PortfolioShowcase** (`src/components/html-slides/PortfolioShowcase.jsx`)
- **ProcessTimeline** (`src/components/html-slides/ProcessTimeline.jsx`)
- **ProjectIntro** (`src/components/html-slides/ProjectIntro.jsx`)
- **SkillsMatrix** (`src/components/html-slides/SkillsMatrix.jsx`)
- **TechStack** (`src/components/html-slides/TechStack.jsx`)
- **TheOffHoursCreative** (`src/components/html-slides/TheOffHoursCreative.jsx`)
- **TheSparkAndTheArt** (`src/components/html-slides/TheSparkAndTheArt.jsx`)
- **WorldplayShowcase** (`src/components/html-slides/WorldplayShowcase.jsx`)
- **UserPersona** (`src/components/html-slides/UserPersona.jsx`)
- **UserFlow** (`src/components/html-slides/UserFlow.jsx`)
- **UsabilityMetrics** (`src/components/html-slides/UsabilityMetrics.jsx`)

## Missing Core Application Entities

### Application Files
- **App** (`src/App.jsx`) - DUPLICATE: Exists in KG but different file path
- **Main** (`src/main.jsx`) - React entry point

### Hooks and Utilities
- **useProjects** (`src/hooks/useProjects.js`) - Project data hook
- **utils** (`src/lib/utils.js`) - Shared utilities (cn function)

### Data Entities
- **ProjectsData** (`public/data/projects.json`) - Central project content
- **ProjectDefinition** - Individual project entities from JSON

## Missing Storybook Stories

Many Storybook stories exist but aren't represented:

### Theme Stories
- **Colors** (`stories/theme/Colors.stories.jsx`)
- **Typography** (`stories/theme/Typography.stories.jsx`)
- **ColorBlock** (`stories/theme/ColorBlock.stories.jsx`)

### UI Stories
- **Badge** (`stories/ui/Badge.stories.jsx`)
- **Button** (`stories/ui/Button.stories.jsx`)
- **Card** (`stories/ui/Card.stories.jsx`)
- **Carousel** (`stories/ui/Carousel.stories.jsx`)
- **DropdownMenu** (`stories/ui/DropdownMenu.stories.jsx`)
- **ThemeToggle** (`stories/ui/ThemeToggle.stories.jsx`)

### Layout Stories
- **Header** (`stories/header/Header.stories.jsx`)
- **Footer** (`stories/footer/Footer.stories.jsx`)
- **Branding** (`stories/header/Branding.stories.jsx`)

### Content Stories
- **HtmlSlides** (`stories/content/HtmlSlides.stories.jsx`)

### Custom Stories
- **BulletList** (`stories/custom/BulletList.stories.jsx`)

### Navigation Stories
- **CustomProjectPicker** (`stories/navigation/CustomProjectPicker.stories.jsx`)

## Missing Relations

### Component Dependencies
Many components use other components but these relationships aren't captured:

1. **Card** system relationships (CardHeader, CardContent, CardFooter)
2. **Carousel** system relationships (CarouselContent, CarouselItem, etc.)
3. **Dropdown** → **Radix UI** dependencies
4. **HTML Slides** → **SlideWrapper** relationships
5. **ProjectCard** → **Badge** dependencies
6. **ImageCarousel** → **Carousel** base component usage

### Data Flow Relations
1. **useProjects** → **ProjectsData** dependency
2. **App** → **useProjects** usage
3. **CustomProjectPicker** → **useProjects** dependency
4. **ProjectCard** → **ProjectDefinition** rendering

### Story Documentation Relations
All missing story files should have **DOCUMENTS** relationships with their respective components.

## Recommendations

### Priority 1: Core Components
Add all missing UI, layout, and feature components as these are actively used in the application.

### Priority 2: HTML Slides System
The slide components are the portfolio's main feature - these should be well-represented in the knowledge graph.

### Priority 3: Data Flow
Map the data flow from JSON → hooks → components to understand content relationships.

### Priority 4: Storybook Coverage
Complete the Storybook story documentation relationships for comprehensive component mapping.

### Priority 5: Dependency Mapping
Add component-to-component dependency relationships for better architectural understanding.

## Impact Assessment

Adding these entities would:
- **Increase entity count** from 36 to approximately 80+ entities
- **Better represent actual codebase** vs. planned features
- **Improve component discovery** for development tasks
- **Complete Storybook documentation mapping**
- **Enable better architectural analysis** through dependency relationships