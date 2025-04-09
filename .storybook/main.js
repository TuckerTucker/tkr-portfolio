/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  "stories": ["../stories/**/*.stories.@(js|jsx|ts|tsx)"],

  "addons": [
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/experimental-addon-test"
  ],

  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  },

  "viteFinal": async (config) => {
    config.css = {
      postcss: true,
      modules: {
        localsConvention: 'camelCase',
      },
    };
    return config;
  },

  docs: {
    autodocs: false
  },

  typescript: {
    reactDocgen: "react-docgen-typescript"
  }
};
export default config;
