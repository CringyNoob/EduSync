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
        primary: {
          DEFAULT: '#4A2FB8',      // Darker purple
          light: '#7C6FBD',        // Muted light purple
          dark: '#2A1A5E',         // Very dark purple
          darker: '#1A0F3E',       // Almost black purple
        },
        accent: {
          cyan: '#00A3CC',         // Darker cyan
          purple: '#6B5FA0',       // Muted purple accent
        },
        background: {
          dark: '#0F0A1E',         // Very dark background
          darker: '#0A0614',       // Even darker
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #2A1A5E 0%, #4A2FB8 100%)',
        'gradient-accent': 'linear-gradient(135deg, #00A3CC 0%, #4A2FB8 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}
