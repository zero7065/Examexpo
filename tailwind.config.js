/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-2": "var(--bg-2)",
        "bg-3": "var(--bg-3)",
        subtle: "var(--subtle)",
        border: "var(--border)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        primary: {
          DEFAULT: "var(--primary)",
          dim: "var(--primary-dim)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          dim: "var(--accent-dim)",
        },
        danger: "var(--danger)",
        success: "var(--success)",
        surface: "var(--bg)",
        "surface-2": "var(--bg-2)",
      },
      fontFamily: {
        sora: ["Sora", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "var(--card-shadow)",
      }
    },
  },
  plugins: [],
}
