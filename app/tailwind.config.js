/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './.ladle/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        nutrien: '#8DA89C',
        worldplay: '#E6B655',
        shaw: '#9B8EB8',
        taskboard: '#C69B9B',
        tucker: '#2C2C2C',
      },
      scale: {
        '102': '1.02',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            h1: {
              fontWeight: '700',
            },
            h2: {
              fontWeight: '600',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
