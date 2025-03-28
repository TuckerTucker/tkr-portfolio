/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./.ladle/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nutrien: '#9ad441',
        worldplay: '#00a4e4',
        shaw: '#0488c1',
        taskboard: '#cc7c5e',
        tucker: '#333333',
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
