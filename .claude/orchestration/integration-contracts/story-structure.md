# Storybook Story Structure Contract

## File Naming Convention
```
stories/{category}/{ComponentName}.stories.jsx
```

## Story Template Structure
```javascript
import { ComponentName } from '../../src/components/{path}';

export default {
  title: '{Category}/{ComponentName}',
  component: ComponentName,
  parameters: {
    layout: 'centered', // or 'fullscreen', 'padded'
    docs: {
      description: {
        component: 'Brief description of the component'
      }
    }
  },
  argTypes: {
    // Define interactive controls
  },
  tags: ['autodocs']
};

export const Default = {
  args: {
    // Default props
  }
};

export const Variant = {
  args: {
    // Variant props
  }
};
```

## Required Story Variants
1. **Default** - Basic usage with minimal props
2. **Playground** - Interactive story with controls
3. **States** - Different component states (loading, error, disabled)
4. **Sizes** - If component has size variants
5. **Themes** - Light/dark mode examples where relevant

## Accessibility Requirements
- Include `aria-label` examples
- Document keyboard navigation
- Show focus states
- Include screen reader descriptions

## Import Paths
- Components: `../../src/components/{category}/{name}`
- Utilities: `../../src/lib/utils`
- Icons: `lucide-react`
- Styles: Use Tailwind classes

## Testing Checklist
- [ ] Story renders without errors
- [ ] All props are documented
- [ ] Interactive controls work
- [ ] Accessibility features documented
- [ ] Follows existing story patterns