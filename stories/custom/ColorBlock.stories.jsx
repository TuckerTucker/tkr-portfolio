import React from 'react';
import ColorBlock from '@/components/custom/color-block'; // Use alias

// Import theme colors from Tailwind config (or define manually if easier)
// Note: Accessing Tailwind config directly in stories can be complex.
// For simplicity, we'll manually define the theme colors used in examples.
const themeColors = {
  primary: "#613CB0",
  secondary: "#FF8800",
  nutrien: "#9ad441",
  worldplay: "#00a4e4",
  shaw: "#0488c1",
  accent: "#00A3FF",
  text: "#333333",
};

export const Default = () => <ColorBlock />;
Default.storyName = 'Default (Fallback Color)';

export const PrimaryColor = () => <ColorBlock backgroundColor={themeColors.primary} />;
PrimaryColor.storyName = 'Primary Color';

export const SecondaryColor = () => <ColorBlock backgroundColor={themeColors.secondary} />;
SecondaryColor.storyName = 'Secondary Color';

export const ProjectColors = () => (
  <div className="flex space-x-4">
    <ColorBlock backgroundColor={themeColors.nutrien} />
    <ColorBlock backgroundColor={themeColors.worldplay} />
    <ColorBlock backgroundColor={themeColors.shaw} />
    <ColorBlock backgroundColor={themeColors.secondary} /> {/* Kanban color */}
  </div>
);
ProjectColors.storyName = 'Project Colors';

export const CustomSize = () => (
  <ColorBlock
    backgroundColor={themeColors.accent}
    width="100px"
    height="50px"
    borderRadius="8px"
  />
);
CustomSize.storyName = 'Custom Size & Radius';

export default {
  title: 'Custom Components/Color Block',
  component: ColorBlock, // Optional: Link component for controls addon
  argTypes: { // Optional: Define controls for props
    backgroundColor: { control: 'color' },
    width: { control: 'text' },
    height: { control: 'text' },
    borderRadius: { control: 'text' },
    marginRight: { control: 'text' },
    className: { control: 'text' },
  },
};
