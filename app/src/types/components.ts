/**
 * Theme colors used throughout the portfolio
 */
export interface ThemeColors {
  /** Sage green color used for Nutrien project */
  nutrien: string;
  /** Golden yellow color used for Worldplay project */
  worldplay: string;
  /** Purple color used for Shaw project */
  shaw: string;
  /** Pink/Mauve color used for Taskboard project */
  taskboard: string;
  /** Dark gray color used for general UI elements */
  tucker: string;
}

/**
 * Spacing units used for consistent layout
 */
export interface SpacingUnits {
  /** 8px spacing unit */
  small: string;
  /** 16px spacing unit */
  medium: string;
  /** 24px spacing unit */
  large: string;
  /** 32px spacing unit */
  xl: string;
}

/**
 * Animation variants available for components
 */
export interface AnimationVariants {
  /** Slide in from left animation */
  slideFromLeft: string;
  /** Slide in from right animation */
  slideFromRight: string;
  /** Fade in animation */
  fadeIn: string;
}

/**
 * Process step image
 */
export interface ProcessImage {
  /** URL to the image */
  url: string;
  /** Image caption */
  caption: string;
}

/**
 * Content for each process step
 */
export interface ProcessContent {
  /** Markdown content for the step */
  content: string;
  /** Images related to the step */
  images: ProcessImage[];
}

/**
 * Project process steps
 */
export interface ProcessSteps {
  /** Understanding phase content */
  understand: ProcessContent;
  /** Solution phase content */
  solve: ProcessContent;
  /** Creation phase content */
  create: ProcessContent;
  /** Verification phase content */
  verify: ProcessContent;
}

/**
 * Project data structure
 */
export interface Project {
  /** Unique identifier for the project */
  id: string;
  /** Company name */
  company: string;
  /** Project title */
  title: string;
  /** Role in the project */
  role: string;
  /** URL to project preview image */
  image: string;
  /** Theme color for the project */
  color: string;
  /** Project process documentation */
  process: ProcessSteps;
}
