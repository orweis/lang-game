import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heebo: ["var(--font-heebo)", "sans-serif"],
      },
      animation: {
        wiggle: "wiggle 0.4s ease-in-out",
        pop: "pop 0.3s ease-out",
        "pulse-ring": "pulse-ring 1.2s cubic-bezier(0,0,0.2,1) infinite",
      },
      keyframes: {
        wiggle: {
          "0%,100%": { transform: "rotate(-6deg)" },
          "50%": { transform: "rotate(6deg)" },
        },
        pop: {
          "0%": { transform: "scale(0.7)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(250,204,21,0.6)" },
          "70%": { boxShadow: "0 0 0 14px rgba(250,204,21,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(250,204,21,0)" },
        },
      },
      minHeight: { touch: "64px" },
      minWidth: { touch: "64px" },
    },
  },
  plugins: [],
};
export default config;
