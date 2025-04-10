/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
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
    "bg-primary",
    "bg-secondary",
    "bg-nutrien",
    "bg-worldplay",
    "bg-shaw",
    "bg-accent",
    "bg-background",
    "bg-card",
    "bg-text"
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
        background: "#F5F5F5",
        card: "#FFFFFF",
        text: "#333333",
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
