/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0f0e0c',
          50:  '#1a1814',
          100: '#242119',
          200: '#2e2a22',
        },
        gold: {
          DEFAULT: '#d4a574',
          light:  '#e8c49a',
          dark:   '#a67c4e',
        },
        parchment: {
          DEFAULT: '#f0ead6',
          dim:     '#a8a08c',
          mute:    '#6b6456',
        },
        accent: {
          DEFAULT: '#c9302c',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        site: '1400px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease both',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
