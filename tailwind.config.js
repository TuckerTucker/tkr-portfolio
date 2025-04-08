/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#613CB0",  // tucker color
        secondary: "#FF8800",  // taskboard color
        nutrien: "#9ad441",
        worldplay: "#00a4e4",
        shaw: "#0488c1",
        accent: "#00A3FF",
        background: "#F5F5F5",
        card: "#FFFFFF",
        text: "#333333",
      },
      fontFamily: {
        sans: ["'Ellograph CF'", 'sans-serif'], // Default body font
        heading: ["'Graphite Std'", 'sans-serif'], // Heading font
        // Note: 'Graphite Std' is also part of the default sans stack in .clinerules,
        // but we explicitly define heading and body fonts here for clarity.
        // The full stack from .clinerules is "'Graphite Std', 'Ellograph CF', sans-serif"
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
