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
import InteractiveCode from './InteractiveCode';
import BornToTheWorld from './BornToTheWorld';
import TheSparkAndTheArt from './TheSparkAndTheArt';
import TheOffHoursCreative from './TheOffHoursCreative';
import PortfolioShowcase from './PortfolioShowcase';
import WorldplayShowcase from './WorldplayShowcase';
import NutrienShowcase from './NutrienShowcase';
import ProjectIntro from './ProjectIntro';
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
const ThemedInteractiveCode = withSlideTheme(InteractiveCode);
const ThemedBornToTheWorld = withSlideTheme(BornToTheWorld);
const ThemedTheSparkAndTheArt = withSlideTheme(TheSparkAndTheArt);
const ThemedTheOffHoursCreative = withSlideTheme(TheOffHoursCreative);
const ThemedPortfolioShowcase = withSlideTheme(PortfolioShowcase);
const ThemedWorldplayShowcase = withSlideTheme(WorldplayShowcase);
const ThemedNutrienShowcase = withSlideTheme(NutrienShowcase);
const ThemedProjectIntro = withSlideTheme(ProjectIntro);

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
  InteractiveCode: ThemedInteractiveCode,
  BornToTheWorld: ThemedBornToTheWorld,
  TheSparkAndTheArt: ThemedTheSparkAndTheArt,
  TheOffHoursCreative: ThemedTheOffHoursCreative,
  PortfolioShowcase: ThemedPortfolioShowcase,
  WorldplayShowcase: ThemedWorldplayShowcase,
  NutrienShowcase: ThemedNutrienShowcase,
  ProjectIntro: ThemedProjectIntro,
};

export default htmlSlideComponents;