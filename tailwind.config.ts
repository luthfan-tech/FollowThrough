import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#FFFFFF",
        azure: {
          DEFAULT: "#00638E",
          deep: "#004A6B",
          light: "#BFD8E3",
          soft: "#8CB9CC",
          hover: "#0077ab",
        },
        onyx: {
          DEFAULT: "#000000",
          surface: "#141414",
          card: "#141414",
        },
        charcoal: {
          DEFAULT: "#2B2B2B",
          border: "#2B2B2B",
          muted: "#383838",
        },
        paper: {
          DEFAULT: "#FFFFFF",
        },
        card: {
          DEFAULT: "#141414",
          foreground: "#FFFFFF",
          muted: "#2B2B2B",
        },
        primary: {
          DEFAULT: "#00638E",
          hover: "#0077ab",
          foreground: "#ffffff",
        },
        border: "#2B2B2B",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.4s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
