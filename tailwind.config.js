/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        brand: {
          red: '#ef4444',
          'red-dark': '#dc2626',
          'red-light': '#fee2e2',
        },
        glass: {
          white: 'rgba(255, 255, 255, 0.7)',
          dark: 'rgba(15, 23, 42, 0.8)',
        }
      },
      boxShadow: {
        'premium': '0 20px 50px -12px rgba(0, 0, 0, 0.1)',
        'crystal': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'neo': '8px 8px 0px 0px rgba(0, 0, 0, 1)',
        'neo-sm': '4px 4px 0px 0px rgba(0, 0, 0, 1)',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
      }
    },
  },
  plugins: [],
}
