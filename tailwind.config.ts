import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#102317",
        mist: "#f4f7f4",
        moss: "#1d4d2b",
        sand: "#dfe9e2",
        rust: "#49a642",
        forest: "#0a331c",
        lime: "#49a642",
        canvas: "#f6faf7",
        line: "#d8e5dc",
        panel: "#fcfefd"
      },
      boxShadow: {
        panel: "0 20px 60px rgba(10, 51, 28, 0.08)",
        soft: "0 8px 30px rgba(10, 51, 28, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
