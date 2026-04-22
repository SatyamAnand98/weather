import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7faf8",
          100: "#eef4f1",
          200: "#d7e3df",
          500: "#60736d",
          700: "#33433e",
          900: "#17211e"
        },
        weather: {
          sky: "#75c7d3",
          teal: "#1c9a9b",
          leaf: "#79a86b",
          sun: "#f3b84b",
          coral: "#ef7d64",
          rain: "#4f8fc0"
        }
      },
      boxShadow: {
        soft: "0 18px 60px rgba(38, 55, 49, 0.12)",
        lift: "0 12px 28px rgba(38, 55, 49, 0.16)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: []
};

export default config;
