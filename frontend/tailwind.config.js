/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5",
        secondary: "#6b7280",
        dark: "#1f2937",
        neu: {
          DEFAULT: "#e2e8f0",
          dark: "#d1d9e6",
          shadow: "#b8c0cc",
          light: "#ffffff",
        },
      },
      boxShadow: {
        neu: "6px 6px 14px #b8c0cc, -6px -6px 14px #ffffff",
        "neu-lg": "10px 10px 24px #b8c0cc, -10px -10px 24px #ffffff",
        "neu-sm": "3px 3px 7px #b8c0cc, -3px -3px 7px #ffffff",
        "neu-inset": "inset 4px 4px 10px #b8c0cc, inset -4px -4px 10px #ffffff",
        "neu-inset-sm":
          "inset 2px 2px 6px #b8c0cc, inset -2px -2px 6px #ffffff",
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-in-out",
        slideUp: "slideUp 0.5s ease-out",
        slideDown: "slideDown 0.5s ease-out",
        slideIn: "slideIn 0.4s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
