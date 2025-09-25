import React from 'react';
import htmlSlideComponents from '@/components/html-slides';
import { ThemeProvider } from '../../src/hooks/useTheme';

export default {
  title: 'Content/HTML Slides',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'All HTML slide components available in the application.',
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
};

// TechStack
export const TechStack = () => {
  const Component = htmlSlideComponents.TechStack;
  return (
    <Component 
      title="Full-Stack Technology Arsenal"
      technologies={[
        { name: "React", icon: "⚛️", description: "UI Framework" },
        { name: "TypeScript", icon: "📘", description: "Type Safety" },
        { name: "Node.js", icon: "🟢", description: "Backend Runtime" },
        { name: "PostgreSQL", icon: "🐘", description: "Database" },
        { name: "GraphQL", icon: "◈", description: "API Layer" },
        { name: "Docker", icon: "🐳", description: "Containerization" },
        { name: "AWS", icon: "☁️", description: "Cloud Platform" },
        { name: "Jest", icon: "🃏", description: "Testing Framework" }
      ]}
    />
  );
};

// ProcessTimeline
export const ProcessTimeline = () => {
  const Component = htmlSlideComponents.ProcessTimeline;
  return (
    <Component 
      title="UX Design Process"
      description="User-centered design methodology"
      activeStage={2}
      stages={[
        { 
          name: "Discover", 
          description: "Research & understand users", 
          deliverable: "User Insights Report" 
        },
        { 
          name: "Define", 
          description: "Frame the problem & goals", 
          deliverable: "Problem Statement" 
        },
        { 
          name: "Design", 
          description: "Create & prototype solutions", 
          deliverable: "Interactive Prototypes" 
        },
        { 
          name: "Test", 
          description: "Validate with real users", 
          deliverable: "Usability Report" 
        },
        { 
          name: "Deliver", 
          description: "Implement & launch", 
          deliverable: "Design System" 
        }
      ]}
    />
  );
};

// BeforeAfter
export const BeforeAfter = () => {
  const Component = htmlSlideComponents.BeforeAfter;
  return (
    <Component 
      title="Dashboard Redesign"
      beforeImage="/slides/shaw/beached_balls.png"
      afterImage="/slides/tucker/knitten.png"
      beforeLabel="Legacy UI"
      afterLabel="Modern Design"
      defaultPosition={50}
    />
  );
};

// UserPersona
export const UserPersona = () => {
  const Component = htmlSlideComponents.UserPersona;
  return (
    <Component 
      name="Alex Thompson"
      role="Product Manager"
      avatar="/slides/tucker/ramoon.png"
      demographics={{
        "Age": "35",
        "Location": "San Francisco, CA",
        "Tech Level": "Advanced",
        "Industry": "SaaS"
      }}
      goals={[
        "Ship features faster without sacrificing quality",
        "Improve team collaboration and communication",
        "Make data-driven product decisions",
        "Reduce time spent in meetings"
      ]}
      painPoints={[
        "Information scattered across multiple tools",
        "Difficulty tracking feature progress",
        "Manual reporting takes too much time",
        "Hard to see the big picture"
      ]}
      behaviors={[
        "Checks metrics first thing every morning",
        "Prefers visual over text-heavy interfaces",
        "Collaborates across 3-4 different time zones",
        "Constantly switching between mobile and desktop"
      ]}
      quote="I need a single source of truth that my entire team can rally around."
    />
  );
};

// DesignSystem
export const DesignSystem = () => {
  const Component = htmlSlideComponents.DesignSystem;
  return (
    <Component 
      title="Brand Design System"
      colors={[
        {
          name: "Primary",
          variants: [
            { name: "Primary", hex: "#613CB0" },
            { name: "Primary Dark", hex: "#4A2E85" },
            { name: "Primary Light", hex: "#8B5CF6" }
          ]
        },
        {
          name: "Semantic",
          variants: [
            { name: "Success", hex: "#10B981" },
            { name: "Warning", hex: "#F59E0B" },
            { name: "Error", hex: "#EF4444" },
            { name: "Info", hex: "#3B82F6" }
          ]
        },
        {
          name: "Neutral",
          variants: [
            { name: "Gray 900", hex: "#111827" },
            { name: "Gray 700", hex: "#374151" },
            { name: "Gray 500", hex: "#6B7280" },
            { name: "Gray 300", hex: "#D1D5DB" },
            { name: "Gray 100", hex: "#F3F4F6" }
          ]
        }
      ]}
      typography={[
        {
          name: "Headings",
          variants: [
            {
              name: "Display",
              specs: "72px / 800",
              fontSize: "72px",
              fontWeight: "800",
              sample: "Impact Statement"
            },
            {
              name: "H1",
              specs: "48px / 700",
              fontSize: "48px",
              fontWeight: "700",
              sample: "Page Headlines"
            },
            {
              name: "H2",
              specs: "36px / 600",
              fontSize: "36px",
              fontWeight: "600",
              sample: "Section Headers"
            }
          ]
        },
        {
          name: "Body",
          variants: [
            {
              name: "Large",
              specs: "18px / 400",
              fontSize: "18px",
              fontWeight: "400",
              lineHeight: "1.75",
              sample: "Enhanced readability for longer content blocks"
            },
            {
              name: "Regular",
              specs: "16px / 400",
              fontSize: "16px",
              fontWeight: "400",
              lineHeight: "1.5",
              sample: "Standard body text for general content"
            }
          ]
        }
      ]}
      components={[
        {
          name: "Button",
          description: "Primary CTA with hover and focus states",
          image: "/slides/tucker/knitten.png"
        },
        {
          name: "Card",
          description: "Elevated content container with subtle shadows",
          image: "/slides/tucker/ramoon.png"
        }
      ]}
    />
  );
};

// UserFlow
export const UserFlow = () => {
  const Component = htmlSlideComponents.UserFlow;
  return (
    <Component 
      title="E-commerce Checkout Flow"
      description="Optimized for conversion with minimal friction"
      flowSteps={[
        {
          label: "Cart",
          title: "Shopping Cart Review",
          description: "Users review their selected items",
          userActions: [
            "View cart items and prices",
            "Update quantities",
            "Apply discount codes",
            "Calculate shipping"
          ],
          systemResponse: "Real-time price updates and inventory check",
          decisionPoints: ["Continue shopping", "Proceed to checkout"],
          image: "/slides/tucker/knitten.png"
        },
        {
          label: "Account",
          title: "Account Selection",
          description: "Choose between guest or registered checkout",
          userActions: [
            "Sign in to existing account",
            "Create new account",
            "Continue as guest"
          ],
          systemResponse: "Pre-fill saved information for returning users",
          decisionPoints: ["Guest checkout", "Create account"],
        },
        {
          label: "Shipping",
          title: "Shipping Information",
          description: "Enter delivery details",
          userActions: [
            "Enter shipping address",
            "Select shipping method",
            "Add delivery instructions"
          ],
          systemResponse: "Address validation and shipping cost calculation",
          decisionPoints: ["Standard shipping", "Express shipping"],
        },
        {
          label: "Payment",
          title: "Payment Method",
          description: "Secure payment processing",
          userActions: [
            "Select payment method",
            "Enter payment details",
            "Review order total"
          ],
          systemResponse: "Payment validation and fraud detection",
          decisionPoints: ["Credit card", "PayPal", "Apple Pay"],
        },
        {
          label: "Confirm",
          title: "Order Confirmation",
          description: "Final review and submission",
          userActions: [
            "Review complete order",
            "Accept terms",
            "Place order"
          ],
          systemResponse: "Order processing and confirmation email",
          decisionPoints: ["Place order", "Edit order"],
          image: "/slides/tucker/ramoon.png"
        }
      ]}
    />
  );
};

// UsabilityMetrics
export const UsabilityMetrics = () => {
  const Component = htmlSlideComponents.UsabilityMetrics;
  return (
    <Component 
      title="Mobile App Usability Test Results"
      participants={24}
      metrics={[
        {
          name: "Task Success Rate",
          value: "87%",
          percentage: 87,
          description: "Users completing all tasks without assistance"
        },
        {
          name: "User Satisfaction",
          value: "4.6/5",
          percentage: 92,
          description: "Average rating from post-test survey"
        },
        {
          name: "Error Rate",
          value: "12%",
          percentage: 12,
          description: "Tasks with at least one error"
        },
        {
          name: "Time on Task",
          value: "-23%",
          percentage: 77,
          description: "Reduction compared to previous version"
        }
      ]}
      tasks={[
        {
          name: "Create New Account",
          description: "Register and verify email",
          successRate: 96,
          avgTime: "2:15"
        },
        {
          name: "Find and Purchase Item",
          description: "Search, add to cart, and checkout",
          successRate: 83,
          avgTime: "4:32"
        },
        {
          name: "Update Profile Settings",
          description: "Change notification preferences",
          successRate: 91,
          avgTime: "1:08"
        },
        {
          name: "Contact Customer Support",
          description: "Find and use help chat",
          successRate: 79,
          avgTime: "1:45"
        }
      ]}
      insights={[
        {
          type: "positive",
          title: "Intuitive Navigation",
          description: "Users praised the bottom navigation pattern, finding it familiar and easy to use",
          impact: "high",
          action: "Maintain current navigation structure"
        },
        {
          type: "negative",
          title: "Search Filters Confusion",
          description: "40% of users struggled to find and apply product filters",
          impact: "high",
          action: "Redesign filter UI with clearer labels and icons"
        },
        {
          type: "info",
          title: "Mobile-First Preference",
          description: "85% of users prefer mobile app over desktop for quick tasks",
          impact: "medium",
          action: "Prioritize mobile feature development"
        },
        {
          type: "negative",
          title: "Checkout Steps Unclear",
          description: "Users uncertain about remaining steps in checkout process",
          impact: "medium",
          action: "Add progress indicator to checkout flow"
        }
      ]}
    />
  );
};

// SkillsMatrix
export const SkillsMatrix = () => {
  const Component = htmlSlideComponents.SkillsMatrix;
  return (
    <Component 
      title="Professional Skills Matrix"
      categories={[
        { id: "design", name: "Design" },
        { id: "frontend", name: "Frontend" },
        { id: "backend", name: "Backend" },
        { id: "tools", name: "Tools" }
      ]}
      selectedCategory="design"
      skills={[
        {
          id: "ux-research",
          name: "UX Research",
          category: "design",
          proficiency: 5,
          icon: "🔍",
          description: "User interviews, surveys, and usability testing",
          experience: "8+ years",
          projects: ["E-commerce Redesign", "Mobile Banking App", "SaaS Dashboard"]
        },
        {
          id: "ui-design",
          name: "UI Design",
          category: "design",
          proficiency: 5,
          icon: "🎨",
          description: "Visual design, layouts, and design systems",
          experience: "10+ years",
          projects: ["Design System Creation", "Brand Refresh", "Component Library"]
        },
        {
          id: "prototyping",
          name: "Prototyping",
          category: "design",
          proficiency: 4,
          icon: "📱",
          description: "Interactive prototypes and animations",
          experience: "6+ years",
          projects: ["Mobile App Prototype", "Web Animation", "Micro-interactions"]
        },
        {
          id: "react",
          name: "React",
          category: "frontend",
          proficiency: 5,
          icon: "⚛️",
          description: "Component architecture and state management",
          experience: "6+ years",
          projects: ["Portfolio Site", "Admin Dashboard", "Component Library"]
        },
        {
          id: "typescript",
          name: "TypeScript",
          category: "frontend",
          proficiency: 4,
          icon: "📘",
          description: "Type-safe JavaScript development",
          experience: "3+ years",
          projects: ["Enterprise App", "API Integration", "Testing Suite"]
        },
        {
          id: "css",
          name: "CSS/Tailwind",
          category: "frontend",
          proficiency: 5,
          icon: "🎨",
          description: "Responsive design and utility-first CSS",
          experience: "10+ years",
          projects: ["Design System", "Marketing Site", "Web App"]
        },
        {
          id: "nodejs",
          name: "Node.js",
          category: "backend",
          proficiency: 4,
          icon: "🟢",
          description: "REST APIs and server development",
          experience: "5+ years",
          projects: ["API Gateway", "Microservices", "Real-time Chat"]
        },
        {
          id: "databases",
          name: "Databases",
          category: "backend",
          proficiency: 3,
          icon: "🗄️",
          description: "PostgreSQL, MongoDB, Redis",
          experience: "4+ years",
          projects: ["Data Migration", "Query Optimization", "Caching Layer"]
        },
        {
          id: "figma",
          name: "Figma",
          category: "tools",
          proficiency: 5,
          icon: "🎯",
          description: "Design and prototyping tool",
          experience: "5+ years",
          projects: ["Design Systems", "Prototypes", "Collaboration"]
        },
        {
          id: "git",
          name: "Git/GitHub",
          category: "tools",
          proficiency: 5,
          icon: "🔧",
          description: "Version control and collaboration",
          experience: "8+ years",
          projects: ["Open Source", "Team Projects", "CI/CD"]
        }
      ]}
    />
  );
};

// BornToTheWorld
export const BornToTheWorld = () => {
  const Component = htmlSlideComponents.BornToTheWorld;
  return <Component />;
};

// TheSparkAndTheArt
export const TheSparkAndTheArt = () => {
  const Component = htmlSlideComponents.TheSparkAndTheArt;
  return <Component />;
};

// TheOffHoursCreative
export const TheOffHoursCreative = () => {
  const Component = htmlSlideComponents.TheOffHoursCreative;
  return <Component />;
};