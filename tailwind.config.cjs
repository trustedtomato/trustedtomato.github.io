const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    screens: {
      xs: '360px',
      lg: '890px',
      xl: '1450px'
    },
    container: {
      center: true,
      screens: {
        xs: '360px',
        lg: '890px'
      },
      padding: {
        DEFAULT: '16px',
        lg: '32px'
      }
    },
    extend: {
      gradientColorStops: {
        25: '25%',
        33: '33%',
        66: '66%',
        75: '75%'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))'
      },
      keyframes: {
        slideIn: {
          '0%': {
            transform: 'translateY(15%)'
          },
          '100%': {
            transform: 'translateY(0%)'
          }
        },
        slideOut: {
          '0%': {
            transform: 'translateY(0%)'
          },
          '100%': {
            transform: 'translateY(-10%)'
          }
        },
        fadeIn: {
          '0%': {
            opacity: '0'
          },
          '100%': {
            opacity: '1'
          }
        },
        fadeOut: {
          '0%': {
            opacity: '1'
          },
          '100%': {
            opacity: '0'
          }
        }
      },
      animation: {
        slideIn: 'slideIn 0.15s cubic-bezier(0, 0, 0.2, 1)',
        slideOut: 'slideOut 0.15s cubic-bezier(0, 0, 0.2, 1)',
        fadeIn: 'fadeIn 0.15s cubic-bezier(0, 0, 0.2, 1)',
        fadeOut: 'fadeOut 0.15s cubic-bezier(0, 0, 0.2, 1)'
      },
      boxShadow: {
        apparent: '0px 4px 8px 2px rgba(0, 0, 0, 0.25);'
      },
      colors: {
        'theme-dark': '#2D1C00',
        'theme-light': '#FFFBF4',
        'theme-cta': '#AD0606'
      }
    }
  },
  plugins: [
    plugin(({ addBase, addVariant }) => {
      addVariant('is-open', '&.is-open')
      addBase({
        '.no-margin-collapse': {
          'padding-top': '0.1px',
          'padding-bottom': '0.1px'
        }
      })
    })
  ]
}
