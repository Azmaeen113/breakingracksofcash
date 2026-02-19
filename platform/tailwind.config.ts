/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          cyan: '#00FFF0',
          pink: '#FF2D95',
          purple: '#B026FF',
          green: '#39FF14',
          dark: '#0A0014',
          mid: '#0D0221',
          card: '#130428',
          gold: '#FFD700',
          orange: '#FF6B00',
          red: '#FF1744',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'fire-border': 'fireBorder 2s ease-in-out infinite',
        'float-up': 'floatUp 2s ease-out forwards',
        'spin-slow': 'spin 4s linear infinite',
        'ember': 'ember 3s ease-out infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0,255,240,0.2), 0 0 30px rgba(176,38,255,0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(0,255,240,0.4), 0 0 50px rgba(176,38,255,0.2)' },
        },
        fireBorder: {
          '0%, 100%': { borderColor: '#FF6B00' },
          '33%': { borderColor: '#FF1744' },
          '66%': { borderColor: '#FFD700' },
        },
        floatUp: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-60px)' },
        },
        ember: {
          '0%': { opacity: '0', transform: 'translateY(0) scale(0.5)' },
          '20%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'translateY(-100vh) scale(0)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
};
