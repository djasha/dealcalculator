/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        // Custom colors from PRD design system
        gray: {
          900: '#111827',
          800: '#1F2937',
          700: '#374151',
          400: '#9CA3AF',
          200: '#E5E7EB',
        },
        indigo: {
          600: '#4F46E5',
          500: '#6366F1',
        },
        green: {
          400: '#4ADE80',
        },
        red: {
          400: '#F87171',
        },
      },
    },
  },
  plugins: [],
}
