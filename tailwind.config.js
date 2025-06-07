/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./stories/**/*.{js,ts,jsx,tsx}",
    "./.storybook/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  safelist: [
    "text-primary",
    "text-secondary",
    "text-nutrien",
    "text-worldplay",
    "text-shaw",
    "text-accent",
    "bg-primary",
    "bg-secondary",
    "bg-nutrien",
    "bg-worldplay",
    "bg-shaw",
    "bg-accent"
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
        // Use CSS variables for theme-aware colors
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        card: "rgb(var(--color-card) / <alpha-value>)",
        "card-foreground": "rgb(var(--color-card-foreground) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        input: "rgb(var(--color-input) / <alpha-value>)",
        ring: "rgb(var(--color-ring) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        "muted-foreground": "rgb(var(--color-muted-foreground) / <alpha-value>)",
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
