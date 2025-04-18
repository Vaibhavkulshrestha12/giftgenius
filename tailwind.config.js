/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f6',
          100: '#fce7ef',
          200: '#fad0e0',
          300: '#f7adc7',
          400: '#f280a2',
          500: '#ea4f7c',
          600: '#d62e5e',
          700: '#b31d47',
          800: '#961b3d',
          900: '#7c1b39',
          950: '#450a1c',
        },
        secondary: {
          50: '#f4f3ff',
          100: '#ebe9fe',
          200: '#d9d5fe',
          300: '#beb5fd',
          400: '#9f8bfb',
          500: '#8059f9',
          600: '#6d3cf0',
          700: '#5c2de0',
          800: '#4b26bc',
          900: '#3e2499',
          950: '#261665',
        },
        accent: {
          50: '#fff9ed',
          100: '#fff1d3',
          200: '#ffe0a6',
          300: '#ffc970',
          400: '#ffaa36',
          500: '#ff8d0f',
          600: '#ff6a05',
          700: '#cc4602',
          800: '#9f3908',
          900: '#80310c',
          950: '#451505',
        },
      },
      boxShadow: {
        '3d': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), inset 0 -15px 15px -15px rgba(0, 0, 0, 0.1)',
        'button': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 -2px 0 0 rgba(255, 255, 255, 0.1) inset, 0 2px 0 0 rgba(0, 0, 0, 0.1) inset',
        'card': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'typing': 'typing 1.5s steps(3) infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        typing: {
          '0%': { content: '"."' },
          '33%': { content: '".."' },
          '66%': { content: '"..."' }
        }
      }
    },
  },
  plugins: [],
};