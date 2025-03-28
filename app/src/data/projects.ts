/**
 * Project process step type
 * @typedef {Object} ProcessStep
 * @property {string} content - Markdown content for the step
 * @property {Array<{url: string, caption: string}>} images - Images associated with the step
 */
interface ProcessStep {
  content: string;
  images: Array<{
    url: string;
    caption: string;
  }>;
}

/**
 * Project process type
 * @typedef {Object} Process
 * @property {ProcessStep} understand - Understanding phase content
 * @property {ProcessStep} solve - Solution phase content
 * @property {ProcessStep} create - Creation phase content
 * @property {ProcessStep} verify - Verification phase content
 */
interface Process {
  understand: ProcessStep;
  solve: ProcessStep;
  create: ProcessStep;
  verify: ProcessStep;
}

/**
 * Project type
 * @typedef {Object} Project
 * @property {string} id - Unique identifier
 * @property {string} company - Company name
 * @property {string} title - Project title
 * @property {string} role - Role in the project
 * @property {string} [image] - Preview image URL (relative to /public)
 * @property {string} [color] - Theme color
 * @property {Process} process - Project process content
 */
export interface Project {
  id: string;
  company: string;
  title: string;
  role: string;
  image?: string; // Path relative to /public
  color?: string;
  process: Process;
}

const placeholderImage = `/images/placeholder.svg`; // Placeholder path

/**
 * Sample project data
 */
export const projects: Project[] = [
  {
    id: '1',
    company: 'Nutrien',
    title: 'Design System',
    role: 'UX Designer',
    image: '/images/nutrien-card.png', // Example path
    color: '#8DA89C',
    process: {
      understand: {
        content: '# Understanding Phase\n\nAnalysis of existing design patterns...',
        images: [{ url: '/images/nutrien-understand-1.png', caption: 'Initial Audit'}],
      },
      solve: {
        content: '# Solution Phase\n\nProposed component architecture...',
        images: [{ url: '/images/nutrien-solve-1.png', caption: 'Component Diagram'}],
      },
      create: {
        content: '# Creation Phase\n\nImplementation of core components...',
        images: [{ url: '/images/nutrien-create-1.png', caption: 'Button Component'}],
      },
      verify: {
        content: '# Verification Phase\n\nUsability testing results...',
        images: [{ url: '/images/nutrien-verify-1.png', caption: 'Test Results'}],
      },
    },
  },
  {
    id: '2',
    company: 'Worldplay',
    title: 'Game Analytics',
    role: 'UX Designer',
    image: '/images/worldplay-card.png', // Example path
    color: '#E6B655',
    process: {
      understand: {
        content: '# Understanding Phase\n\nResearch on player behavior...',
        images: [{ url: '/images/worldplay-understand-1.png', caption: 'User Persona'}],
      },
      solve: {
        content: '# Solution Phase\n\nData visualization strategy...',
        images: [{ url: '/images/worldplay-solve-1.png', caption: 'Dashboard Wireframe'}],
      },
      create: {
        content: '# Creation Phase\n\nDashboard implementation...',
        images: [{ url: '/images/worldplay-create-1.png', caption: 'Live Dashboard'}],
      },
      verify: {
        content: '# Verification Phase\n\nA/B testing results...',
        images: [{ url: '/images/worldplay-verify-1.png', caption: 'A/B Test Results'}],
      },
    },
  },
  {
    id: '3',
    company: 'Shaw',
    title: 'Mobile App',
    role: 'UX Designer',
    image: '/images/shaw-card.png', // Example path
    color: '#9B8EB8',
    process: {
      understand: {
        content: '# Understanding Phase\n\nUser journey mapping...',
        images: [{ url: '/images/shaw-understand-1.png', caption: 'Journey Map'}],
      },
      solve: {
        content: '# Solution Phase\n\nInformation architecture...',
        images: [{ url: '/images/shaw-solve-1.png', caption: 'App IA'}],
      },
      create: {
        content: '# Creation Phase\n\nPrototype development...',
        images: [{ url: '/images/shaw-create-1.png', caption: 'High-Fidelity Mockup'}],
      },
      verify: {
        content: '# Verification Phase\n\nBeta testing feedback...',
        images: [{ url: '/images/shaw-verify-1.png', caption: 'User Feedback'}],
      },
    },
  },
  {
    id: '4',
    company: 'Taskboard',
    title: 'Project Management',
    role: 'UX Designer',
    image: '/images/taskboard-card.png', // Example path
    color: '#C69B9B',
    process: {
      understand: {
        content: '# Understanding Phase\n\nWorkflow analysis...',
        images: [{ url: '/images/taskboard-understand-1.png', caption: 'Workflow Diagram'}],
      },
      solve: {
        content: '# Solution Phase\n\nTask organization system...',
        images: [{ url: '/images/taskboard-solve-1.png', caption: 'Kanban Concept'}],
      },
      create: {
        content: '# Creation Phase\n\nInterface development...',
        images: [{ url: '/images/taskboard-create-1.png', caption: 'Board UI'}],
      },
      verify: {
        content: '# Verification Phase\n\nProductivity metrics...',
        images: [{ url: '/images/taskboard-verify-1.png', caption: 'Metrics Dashboard'}],
      },
    },
  },
];

/**
 * Get a project by ID
 * @param {string} id - Project ID
 * @returns {Project | undefined} Project data or undefined if not found
 */
export function getProjectById(id: string): Project | undefined {
  return projects.find(project => project.id === id);
}

/**
 * Get all projects
 * @returns {Project[]} Array of all projects
 */
export function getAllProjects(): Project[] {
  return projects;
}
