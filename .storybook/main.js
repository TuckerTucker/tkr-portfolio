import { join, dirname } from 'path';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-onboarding'),
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-vitest'),
    getAbsolutePath("@storybook/addon-docs")
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
  core: {
    builder: {
      name: '@storybook/builder-vite',
      options: {
        viteConfigPath: undefined,
      },
    },
  },
  managerHead: (head) => `
    ${head}
    <base href="/storybook/">
  `,
  viteFinal: async (config) => {
    // Set base URL for GitHub Pages deployment
    config.base = '/storybook/';
    
    // Ensure aliases are defined
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    
    // Override the useTheme module for Storybook
    config.resolve.alias['@/hooks/useTheme'] = join(dirname(import.meta.url.replace('file://', '')), './StorybookThemeProvider.jsx');
    config.resolve.alias['../../hooks/useTheme.jsx'] = join(dirname(import.meta.url.replace('file://', '')), './StorybookThemeProvider.jsx');
    config.resolve.alias['../src/hooks/useTheme'] = join(dirname(import.meta.url.replace('file://', '')), './StorybookThemeProvider.jsx');
    
    return config;
  },
};

export default config;