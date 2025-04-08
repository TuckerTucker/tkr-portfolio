import React from 'react';
import { Button } from '@/components/ui/button'; // Using alias defined in jsconfig.json
import { Mail } from 'lucide-react';

export const Default = () => <Button>Default Button</Button>;
export const Secondary = () => <Button variant="secondary">Secondary</Button>;
export const Destructive = () => <Button variant="destructive">Destructive</Button>;
export const Outline = () => <Button variant="outline">Outline</Button>;
export const Ghost = () => <Button variant="ghost">Ghost</Button>;
export const Link = () => <Button variant="link">Link</Button>;
export const WithIcon = () => (
  <Button>
    <Mail className="mr-2 h-4 w-4" /> Login with Email
  </Button>
);
export const IconOnly = () => (
  <Button variant="outline" size="icon">
    <Mail className="h-4 w-4" />
  </Button>
);
export const Loading = () => (
    <Button disabled>
      {/* Use a loading spinner component here if available, or text */}
      <span className="animate-spin mr-2">⏳</span>
      Please wait
    </Button>
);

// Add story metadata if needed
Default.storyName = 'Default';
Secondary.storyName = 'Secondary Variant';
Destructive.storyName = 'Destructive Variant';
Outline.storyName = 'Outline Variant';
Ghost.storyName = 'Ghost Variant';
Link.storyName = 'Link Variant';
WithIcon.storyName = 'With Icon';
IconOnly.storyName = 'Icon Only';
Loading.storyName = 'Loading State';

// Group stories under a title
export default {
  title: 'UI Primitives/Button (shadcn)',
};
