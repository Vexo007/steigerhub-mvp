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
        ink: "#13212c",
        mist: "#eef4f3",
        moss: "#32513f",
        sand: "#dcc8a6",
        rust: "#ba6b3f"
      },
      boxShadow: {
        panel: "0 18px 60px rgba(19, 33, 44, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;

