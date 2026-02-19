/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        admin: {
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          accent: '#3b82f6',
          success: '#22c55e',
          warning: '#eab308',
          danger: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
