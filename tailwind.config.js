/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        blueprint: {
          DEFAULT: '#0E3A5C',
          deep: '#082C47',
        },
        signal: {
          DEFAULT: '#38BDF8',
          soft: '#7DD3FC',
        },
        status: {
          success: '#34D399',
          error: '#F87171',
          warning: '#F5A623',
        },
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'monospace'],
        sans: ['"IBM Plex Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}