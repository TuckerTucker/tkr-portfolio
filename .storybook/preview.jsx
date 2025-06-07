import './tailwind.css';
import { StorybookThemeProvider } from './StorybookThemeProvider';
import { useEffect } from 'react';

export const decorators = [
  (Story, context) => {
    const theme = context.globals.theme || 'light';
    
    useEffect(() => {
      // Apply the theme class to the document root
      const root = document.documentElement;
      const body = document.body;
      
      console.log('Storybook theme decorator:', theme); // Debug log
      
      if (theme === 'dark') {
        root.classList.add('dark');
        body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
      }
    }, [theme]);

    return (
      <StorybookThemeProvider theme={theme}>
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
          <Story />
        </div>
      </StorybookThemeProvider>
    );
  }
];

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'light',
    toolbar: {
      icon: 'circlehollow',
      items: [
        { value: 'light', icon: 'sun', title: 'Light' },
        { value: 'dark', icon: 'moon', title: 'Dark' },
      ],
      showName: true,
    },
  },
};

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      }
    },
    backgrounds: {
      disable: true, // Disable default backgrounds since we're using theme
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
      },
    },
  },
};

export default preview;
