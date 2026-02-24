import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Charcoal base (styles.md)
        charcoal: {
          950: "#0F0F0F",
          900: "#1A1A1A",
          800: "#1E1E1E",
          700: "#252525",
          600: "#2A2A2A",
          500: "#2E2E2E",
          400: "#333333",
          300: "#737373",
          200: "#A3A3A3",
        },
        // Accent palette for data & CTAs (styles.md)
        accent: {
          violet: {
            DEFAULT: "#8B5CF6",
            400: "#A78BFA",
            500: "#8B5CF6",
            600: "#7C3AED",
          },
          cyan: { DEFAULT: "#06B6D4", 400: "#22D3EE", 500: "#06B6D4", 600: "#0891B2" },
          amber: { DEFAULT: "#F59E0B", 400: "#FBBF24", 500: "#F59E0B", 600: "#D97706" },
          rose: { DEFAULT: "#F43F5E", 400: "#FB7185", 500: "#F43F5E", 600: "#E11D48" },
          emerald: { DEFAULT: "#10B981", 400: "#34D399", 500: "#10B981", 600: "#059669" },
          blue: { DEFAULT: "#3B82F6", 400: "#60A5FA", 500: "#3B82F6", 600: "#2563EB" },
        },
        // Semantic aliases
        primary: "#8B5CF6",
        success: "#10B981",
        error: "#F43F5E",
        warning: "#F59E0B",
        info: "#3B82F6",
        // Needs / Wants category themes (styles.md)
        needs: "#06B6D4",
        wants: "#F59E0B",
        "needs-secondary": "#0E7490",
        "wants-secondary": "#B45309",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      transitionDuration: {
        DEFAULT: "300ms",
      },
      ringWidth: {
        focus: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
