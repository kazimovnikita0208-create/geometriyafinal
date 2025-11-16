/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Фирменные цвета студии "Геометрия"
        primary: '#5833b6',
        'primary-dark': '#4527a0',
        'primary-light': '#7e57c2',
      },
    },
  },
  plugins: [],
}
