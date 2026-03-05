import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ndp-blue':       '#2200CC',
        'ndp-blue-dark':  '#1600A8',
        'ndp-blue-mid':   '#6644EE',
        'ndp-bg':         '#F5F4FF',
        'ndp-surface':    '#FFFFFF',
        'ndp-border':     '#E8E5FF',
        'ndp-text':       '#0D0A2E',
        'ndp-muted':      '#7370A0',
        'ndp-gold':       '#C9A84C',
        'ndp-gold-light': '#F0E4B0',
        'ndp-gold-dark':  '#A68830',
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'slide-in':   'slideIn 0.35s ease-out',
        'bounce-in':  'bounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bounceIn: {
          '0%':   { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
