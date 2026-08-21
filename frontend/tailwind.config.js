/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        background: "#070707",
        panel: "#111111",
        orange: "#ff641f",
        muted: "#8b8b8b",
      },

      boxShadow: {
        orange:
          "0 0 35px rgba(255, 100, 31, 0.15)",
      },
    },
  },

  plugins: [],
};
