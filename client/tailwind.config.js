/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3D1E0B',
          dark: '#291407',
          light: '#5C3215'
        },
        accent: {
          DEFAULT: '#E07856',
          light: '#FFE8D6',
          dark: '#C85A3F'
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#DC2626',
        neutral: {
          50: '#FFFBF7',
          100: '#F5E6DC',
          200: '#E8D5C4',
          300: '#D4BFA8',
          400: '#C0A99B'
        }
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.08)'
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-from-right': 'slideInFromRight 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInFromRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
