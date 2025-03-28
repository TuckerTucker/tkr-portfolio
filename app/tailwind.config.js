/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./.ladle/**/*.{js,jsx,ts,tsx}",
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
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
  important: true,
}
