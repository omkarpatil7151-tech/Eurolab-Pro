import type { Config } from "tailwindcss";

export default {
  content: ["./app/index.html", "./app/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lab: {
          50: "#eff8ff",
          100: "#dbeefe",
          500: "#2478e8",
          600: "#1d63c2",
          700: "#174f9e",
          900: "#123766"
        }
      },
      boxShadow: {
        panel: "0 18px 45px rgba(15, 23, 42, 0.08)"
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;
