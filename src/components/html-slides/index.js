// HTML Slide Component Registry
// Import component implementations as they're created
import TechStack from './TechStack';
import ProcessTimeline from './ProcessTimeline';
import BeforeAfter from './BeforeAfter';
import UserPersona from './UserPersona';
import DesignSystem from './DesignSystem';
import UserFlow from './UserFlow';
import UsabilityMetrics from './UsabilityMetrics';
import SkillsMatrix from './SkillsMatrix';
import InteractiveCards from './InteractiveCards';
import BornToTheWorld from './BornToTheWorld';
import TheSparkAndTheArt from './TheSparkAndTheArt';
import TheOffHoursCreative from './TheOffHoursCreative';
import TkrKanbanPresentation from './TkrKanbanPresentation';
import TkrContextKitPresentation from './TkrContextKitPresentation';
import PortfolioShowcase from './PortfolioShowcase';
import WorldplayShowcase from './WorldplayShowcase';
import NutrienShowcase from './NutrienShowcase';
import withSlideTheme from './slide-wrapper';

// Wrap all components with our theme-aware wrapper
const ThemedTechStack = withSlideTheme(TechStack);
const ThemedProcessTimeline = withSlideTheme(ProcessTimeline);
const ThemedBeforeAfter = withSlideTheme(BeforeAfter);
const ThemedUserPersona = withSlideTheme(UserPersona);
const ThemedDesignSystem = withSlideTheme(DesignSystem);
const ThemedUserFlow = withSlideTheme(UserFlow);
const ThemedUsabilityMetrics = withSlideTheme(UsabilityMetrics);
const ThemedSkillsMatrix = withSlideTheme(SkillsMatrix);
const ThemedInteractiveCards = withSlideTheme(InteractiveCards);
const ThemedBornToTheWorld = withSlideTheme(BornToTheWorld);
const ThemedTheSparkAndTheArt = withSlideTheme(TheSparkAndTheArt);
const ThemedTheOffHoursCreative = withSlideTheme(TheOffHoursCreative);
const ThemedTkrKanbanPresentation = withSlideTheme(TkrKanbanPresentation);
const ThemedTkrContextKitPresentation = withSlideTheme(TkrContextKitPresentation);
const ThemedPortfolioShowcase = withSlideTheme(PortfolioShowcase);
const ThemedWorldplayShowcase = withSlideTheme(WorldplayShowcase);
const ThemedNutrienShowcase = withSlideTheme(NutrienShowcase);

// Export component registry map
const htmlSlideComponents = {
  TechStack: ThemedTechStack,
  ProcessTimeline: ThemedProcessTimeline,
  BeforeAfter: ThemedBeforeAfter,
  UserPersona: ThemedUserPersona,
  DesignSystem: ThemedDesignSystem,
  UserFlow: ThemedUserFlow,
  UsabilityMetrics: ThemedUsabilityMetrics,
  SkillsMatrix: ThemedSkillsMatrix,
  InteractiveCards: ThemedInteractiveCards,
  BornToTheWorld: ThemedBornToTheWorld,
  TheSparkAndTheArt: ThemedTheSparkAndTheArt,
  TheOffHoursCreative: ThemedTheOffHoursCreative,
  TkrKanbanPresentation: ThemedTkrKanbanPresentation,
  TkrContextKitPresentation: ThemedTkrContextKitPresentation,
  PortfolioShowcase: ThemedPortfolioShowcase,
  WorldplayShowcase: ThemedWorldplayShowcase,
  NutrienShowcase: ThemedNutrienShowcase,
};

export default htmlSlideComponents;