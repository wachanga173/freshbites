/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'Times New Roman', 'serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1B1B1F',
          dark: '#111114',
          light: '#2D2D33'
        },
        accent: {
          DEFAULT: '#D4A053',
          light: '#FFF4E0',
          dark: '#B8862D'
        },
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        neutral: {
          50: '#F8F8FA',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF'
        }
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'md': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'lg': '0 8px 32px rgba(0, 0, 0, 0.10)',
        'xl': '0 16px 48px rgba(0, 0, 0, 0.12)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(212, 160, 83, 0.15)',
        'glow': '0 0 24px rgba(212, 160, 83, 0.20)',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-from-right': 'slideInFromRight 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
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
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 160, 83, 0.4)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(212, 160, 83, 0.15)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
    },
  },
  plugins: [],
}
