import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#071A2F",
          50: "#0B2440",
          100: "#0A2039",
          900: "#071A2F",
        },
        techblue: {
          DEFAULT: "#146EF5",
          50: "#E8F1FE",
          100: "#D3E4FD",
          600: "#146EF5",
          700: "#105AD0",
        },
        electric: {
          DEFAULT: "#3B82F6",
          500: "#3B82F6",
        },
        graphite: {
          DEFAULT: "#111827",
          900: "#111827",
        },
        lightgray: {
          DEFAULT: "#F3F6FA",
        },
        accentred: {
          DEFAULT: "#E53935",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(16, 24, 40, 0.04), 0 1px 3px 0 rgba(16, 24, 40, 0.06)",
        lift: "0 4px 12px -2px rgba(7, 26, 47, 0.12), 0 2px 6px -2px rgba(7, 26, 47, 0.08)",
      },
      borderRadius: {
        card: "0.75rem",
      },
      keyframes: {
        "route-dash": {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "route-dash": "route-dash 2s ease-in-out infinite",
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;