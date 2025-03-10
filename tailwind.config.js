/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        slideUpAndFade: 'slideUpAndFade 0.2s ease-in-out',
        slideDownAndFade: 'slideDownAndFade 0.2s ease-in-out',
      },
      keyframes: {
        slideUpAndFade: {
          from: { opacity: '0', transform: 'translateY(calc(100% + 30px))' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDownAndFade: {
          from: { opacity: '1', transform: 'translateY(0)' },
          to: { opacity: '0', transform: 'translateY(calc(100% + 30px))' },
        },
      },
    },
  },
  plugins: [],
}

