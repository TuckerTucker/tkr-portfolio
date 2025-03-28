# Tucker's Portfolio Documentation

This documentation covers the components, utilities, and architecture of the UX portfolio project.

## Project Structure

- `components/` - Reusable UI components
- `pages/` - Next.js page components
- `styles/` - Global styles and CSS modules
- `types/` - TypeScript type definitions
- `utils/` - Utility functions and helpers
- `stories/` - Ladle component stories

## Component Documentation

Components are documented using TypeScript interfaces and JSDoc comments. Each component includes:

- Purpose and usage examples
- Props interface with descriptions
- Accessibility considerations
- Related stories in Ladle

## Development Tools

### Ladle
Component development and testing environment. Run with:
```bash
npm run ladle
```

### JSDoc
API documentation generator. Generate docs with:
```bash
npm run docs
```

Watch mode for development:
```bash
npm run docs:watch
```

## Type System

The project uses TypeScript with comprehensive type definitions for:

- Theme configuration (colors, spacing, etc.)
- Component props
- Data structures (projects, process steps)
- Animation variants

See `src/types/components.ts` for core type definitions.

## Style Guide

Components follow these conventions:

- Props interfaces with JSDoc comments
- Consistent naming patterns
- Accessibility-first development
- Responsive design patterns
- Animation and interaction patterns

## Contributing

1. Document new components with JSDoc comments
2. Create Ladle stories for visual testing
3. Update type definitions as needed
4. Generate documentation before committing
