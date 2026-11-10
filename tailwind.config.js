/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sentinel: {
          navy: '#071426',
          darkBlue: '#10233F',
          cyan: '#16C7E8',
          red: '#F04452',
          amber: '#F5A623',
          green: '#19B878',
          bgLight: '#F4F7FB',
          borderLight: '#E2E8F0',
          darkSurface: '#0B1E38',
          darkCard: '#0F2748',
          darkBorder: '#1A3A68'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
