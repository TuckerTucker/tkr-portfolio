/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  safelist: [
    "text-primary",
    "text-secondary",
    "text-nutrien",
    "text-worldplay",
    "text-shaw",
    "text-accent",
    "text-background",
    "text-card",
    "text-text",
    "dark:text-background-dark",
    "dark:text-card-dark",
    "dark:text-text-dark",
    "bg-primary",
    "bg-secondary",
    "bg-nutrien",
    "bg-worldplay",
    "bg-shaw",
    "bg-accent",
    "bg-background",
    "bg-card",
    "bg-text",
    "dark:bg-background-dark",
    "dark:bg-card-dark",
    "dark:bg-text-dark"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#613CB0",  // tucker color
        secondary: "#FF8800",  // taskboard color
        nutrien: "#3b5f18",
        worldplay: "#00a4e4",
        shaw: "#0488c1",
        accent: "#00A3FF",
        background: {
          light: "#F5F5F5",
          dark: "#1A1A1A",
          DEFAULT: "#F5F5F5"
        },
        card: {
          light: "#FFFFFF",
          dark: "#2A2A2A",
          DEFAULT: "#FFFFFF"
        },
        text: {
          light: "#333333",
          dark: "#F0F0F0",
          DEFAULT: "#333333"
        },
      },
      fontFamily: {
        sans: ["ellograph-cf", "sans-serif"], // Match Adobe Fonts CSS
        heading: ["graphite-std", "sans-serif"], // Match Adobe Fonts CSS
        // Note: updated to match exact font-family names from Adobe Fonts
      },
      spacing: {
        small: "8px",
        medium: "16px",
        large: "24px",
        xl: "32px",
      },
      boxShadow: {
        card: "0 2px 4px rgba(0,0,0,0.1)",
        dropdown: "0 4px 8px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [],
}
