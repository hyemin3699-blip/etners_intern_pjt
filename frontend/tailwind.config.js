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
      },
    },
  },
  plugins: [],
};
