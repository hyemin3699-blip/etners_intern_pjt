/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // etners 브랜드 오렌지
        brand: {
          50: "#fff3ee",
          100: "#ffe1d2",
          400: "#ff8f63",
          500: "#ff6b35",
          600: "#e85a24",
          700: "#c24a1c",
        },
      },
      fontFamily: {
        sans: ["Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", "sans-serif"],
        hwp: ["HCR Batang", "함초롱바탕", "Batang", "serif"],
        signature: ["Nanum Pen Script", "cursive"],
      },
      keyframes: {
        fadein: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        highlightsweep: {
          "0%": { backgroundSize: "0% 100%" },
          "100%": { backgroundSize: "100% 100%" },
        },
      },
      animation: {
        fadein: "fadein 0.4s ease",
        highlightsweep: "highlightsweep 0.9s cubic-bezier(0.65,0,0.35,1) 0.15s both",
      },
    },
  },
  plugins: [],
};
