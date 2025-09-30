/**
 * Component Interface Contracts for V2 AI Skills Portfolio
 * All components must implement these interfaces for guaranteed integration
 */

import { ReactNode } from 'react';

// ============================================================================
// Base Component Contracts
// ============================================================================

export interface BaseComponentProps {
  className?: string;
  id?: string;
  'aria-label'?: string;
  'data-testid'?: string;
}

export interface ThemeAwareComponentProps extends BaseComponentProps {
  theme?: 'light' | 'dark' | 'auto';
  forceTheme?: boolean;
}

export interface AnimatedComponentProps {
  animationDuration?: number;
  animationDelay?: number;
  animationType?: 'fade' | 'slide' | 'scale' | 'flip';
  animationDirection?: 'up' | 'down' | 'left' | 'right';
}

export interface ResponsiveComponentProps {
  mobileLayout?: 'stack' | 'carousel' | 'accordion';
  breakpoints?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

// ============================================================================
// Data Model Contracts
// ============================================================================

export interface ProjectData {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  category: 'ai-collaboration' | 'ux-design' | 'technical';
  featured: boolean;
  tags: string[];
  metrics?: ProjectMetrics;
  timeline?: TimelineEvent[];
}

export interface ProjectMetrics {
  before: MetricValue[];
  after: MetricValue[];
  improvement: number; // percentage
  timeframe: string;
}

export interface MetricValue {
  label: string;
  value: number;
  unit?: string;
  description?: string;
}

export interface TimelineEvent {
  id: string;
  phase: string;
  title: string;
  description: string;
  date?: string;
  emotion?: 'frustrated' | 'confused' | 'hopeful' | 'excited' | 'confident';
  confidence?: number; // 0-100
}

// ============================================================================
// Core Component Contracts
// ============================================================================

export interface AIInteractionShowcaseProps extends ThemeAwareComponentProps, AnimatedComponentProps {
  humanInterface: ReactNode;
  aiInterface: ReactNode;
  sharedData?: any;
  syncIndicators?: boolean;
  onSync?: (data: any) => void;
  layout?: 'side-by-side' | 'tabbed' | 'overlay';
}

export interface DualInterfaceDemoProps extends ThemeAwareComponentProps, AnimatedComponentProps {
  views: {
    human: ReactNode;
    ai: ReactNode;
  };
  defaultView?: 'human' | 'ai';
  transitionType?: 'fade' | 'slide' | 'flip' | '3d-rotate';
  guidedMode?: boolean;
  onViewChange?: (view: 'human' | 'ai') => void;
}

export interface ContextEvolutionSlideProps extends ThemeAwareComponentProps {
  before: {
    code: string;
    lines: number;
    issues: string[];
  };
  after: {
    code: string;
    lines: number;
    improvements: string[];
  };
  metrics?: {
    compressionRatio: number;
    readabilityScore: number;
    aiEfficiency: number;
  };
  syntaxHighlighting?: boolean;
  language?: string;
}

export interface ProjectImpactMetricsProps extends ThemeAwareComponentProps, ResponsiveComponentProps {
  metrics: ProjectMetrics;
  visualizationType?: 'bar' | 'line' | 'circular' | 'number' | 'combined';
  showImprovement?: boolean;
  animateOnScroll?: boolean;
  comparisonMode?: 'side-by-side' | 'overlay' | 'toggle';
}

export interface AgentConversationFlowProps extends ThemeAwareComponentProps, AnimatedComponentProps {
  stages: ConversationStage[];
  currentStage?: number;
  showQualityIndicators?: boolean;
  showContextEvolution?: boolean;
  interactive?: boolean;
  onStageChange?: (stage: number) => void;
}

export interface ConversationStage {
  id: string;
  name: string;
  userMessage: string;
  agentResponse: string;
  quality: {
    clarity: number; // 0-100
    effectiveness: number; // 0-100
    complexity: number; // 0-100
  };
  context?: {
    tokens: number;
    concepts: string[];
    tools?: string[];
  };
  orchestration?: {
    agents: string[];
    parallel: boolean;
  };
}

// ============================================================================
// Enhanced Existing Component Contracts
// ============================================================================

export interface EnhancedProcessTimelineProps extends ThemeAwareComponentProps {
  events: TimelineEvent[];
  showEmotions?: boolean;
  showConfidence?: boolean;
  orientation?: 'horizontal' | 'vertical';
  interactive?: boolean;
  onEventClick?: (event: TimelineEvent) => void;
}

export interface EnhancedUserPersonaProps extends ThemeAwareComponentProps {
  persona: {
    name: string;
    role: string;
    avatar?: string;
    goals: string[];
    painPoints: string[];
    tools: string[];
    interactionPreferences: string[];
    journeyStage: 'awareness' | 'consideration' | 'decision' | 'retention' | 'advocacy';
    quote?: string;
  };
  layout?: 'card' | 'detailed' | 'minimal';
}

export interface EnhancedTechStackProps extends ThemeAwareComponentProps {
  technologies: TechCategory[];
  groupBy?: 'category' | 'proficiency' | 'none';
  showProficiency?: boolean;
  showLinks?: boolean;
  interactive?: boolean;
}

export interface TechCategory {
  name: string;
  items: TechItem[];
}

export interface TechItem {
  name: string;
  icon?: string;
  proficiency?: number; // 0-100
  description?: string;
  link?: string;
  implementation?: string; // link to code
}

export interface EnhancedBeforeAfterProps extends ThemeAwareComponentProps, AnimatedComponentProps {
  before: ReactNode;
  after: ReactNode;
  comparison?: {
    metrics: MetricValue[];
    improvements: string[];
  };
  layout?: 'side-by-side' | 'slider' | 'overlay' | 'flip';
  showLabels?: boolean;
}

// ============================================================================
// Project Slide Contracts
// ============================================================================

export interface ProjectSlideProps extends ThemeAwareComponentProps, ResponsiveComponentProps {
  slideNumber: number;
  totalSlides: number;
  projectId: string;
  data: any; // Project-specific data
  onNext?: () => void;
  onPrevious?: () => void;
  showNavigation?: boolean;
  autoAdvance?: number; // seconds
}

// ============================================================================
// Interactive Demo Contracts
// ============================================================================

export interface InteractiveDemoProps extends BaseComponentProps {
  demoType: 'yaml-editor' | 'task-board' | 'progress-assessment';
  initialData?: any;
  onChange?: (data: any) => void;
  onComplete?: (result: any) => void;
  readOnly?: boolean;
  showInstructions?: boolean;
}

// ============================================================================
// Navigation Contracts
// ============================================================================

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  category?: string;
  featured?: boolean;
  icon?: string;
  badge?: string;
}

export interface NavigationProps extends ThemeAwareComponentProps {
  items: NavigationItem[];
  currentPath?: string;
  layout?: 'horizontal' | 'vertical' | 'dropdown';
  showCategories?: boolean;
  onNavigate?: (item: NavigationItem) => void;
}

// ============================================================================
// Landing Section Contracts
// ============================================================================

export interface HiveLandingSectionProps extends ThemeAwareComponentProps {
  targetRole: string;
  companyName: string;
  valueProposition: string;
  keyPoints: string[];
  testimonials?: Testimonial[];
  callToAction: {
    text: string;
    href: string;
  };
}

export interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  company?: string;
}

// ============================================================================
// State Management Contracts
// ============================================================================

export interface ComponentState<T = any> {
  data: T;
  loading: boolean;
  error?: Error;
  initialized: boolean;
}

export interface ComponentActions<T = any> {
  setData: (data: T) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error) => void;
  reset: () => void;
}

// ============================================================================
// Event Contracts
// ============================================================================

export interface ComponentEvent {
  type: string;
  source: string;
  timestamp: number;
  data?: any;
}

export interface ComponentEventHandler {
  (event: ComponentEvent): void;
}

// ============================================================================
// Validation Contracts
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// ============================================================================
// Export all contracts as a namespace for easy import
// ============================================================================

export type AISkillsComponentContracts = {
  // Base
  BaseComponentProps: BaseComponentProps;
  ThemeAwareComponentProps: ThemeAwareComponentProps;
  AnimatedComponentProps: AnimatedComponentProps;
  ResponsiveComponentProps: ResponsiveComponentProps;

  // Core Components
  AIInteractionShowcaseProps: AIInteractionShowcaseProps;
  DualInterfaceDemoProps: DualInterfaceDemoProps;
  ContextEvolutionSlideProps: ContextEvolutionSlideProps;
  ProjectImpactMetricsProps: ProjectImpactMetricsProps;
  AgentConversationFlowProps: AgentConversationFlowProps;

  // Enhanced Components
  EnhancedProcessTimelineProps: EnhancedProcessTimelineProps;
  EnhancedUserPersonaProps: EnhancedUserPersonaProps;
  EnhancedTechStackProps: EnhancedTechStackProps;
  EnhancedBeforeAfterProps: EnhancedBeforeAfterProps;

  // Supporting Types
  ProjectData: ProjectData;
  ProjectMetrics: ProjectMetrics;
  MetricValue: MetricValue;
  TimelineEvent: TimelineEvent;
  ConversationStage: ConversationStage;
  TechCategory: TechCategory;
  TechItem: TechItem;
  NavigationItem: NavigationItem;
  Testimonial: Testimonial;
};