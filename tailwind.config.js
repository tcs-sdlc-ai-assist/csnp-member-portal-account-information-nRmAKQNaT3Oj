/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        csnp: {
          primary: '#003366',
          'primary-dark': '#002244',
          'primary-light': '#004488',
          secondary: '#0066cc',
          'secondary-dark': '#0055aa',
          'secondary-light': '#3388dd',
          accent: '#ff6600',
          'accent-dark': '#cc5200',
          'accent-light': '#ff8833',
          neutral: {
            50: '#f8f9fa',
            100: '#e9ecef',
            200: '#dee2e6',
            300: '#ced4da',
            400: '#adb5bd',
            500: '#6c757d',
            600: '#495057',
            700: '#343a40',
            800: '#212529',
            900: '#0a0e14',
          },
          success: '#28a745',
          warning: '#ffc107',
          error: '#dc3545',
          info: '#17a2b8',
        },
      },
      ringColor: {
        csnp: '#0066cc',
      },
      ringOffsetWidth: {
        3: '3px',
      },
      outline: {
        csnp: ['2px solid #0066cc', '2px'],
      },
    },
  },
  plugins: [],
};