/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        taruvar: {
          primary: '#6BBF59',     // Leaf green
          secondary: '#2D7A4E',   // Deep forest green
          dark: '#1D1D1D',        // Dark text
          bg: '#F5F8F4',          // Soft light background
          accent: '#A6C36F',      // Accent earth/leaf color
          surface: '#FFFFFF',     // Clean white surface
          muted: '#5A6E5F',       // Muted natural text
          light: '#EAF3E7',       // Soft green pill badge
          card: '#F8FAF7',        // Subtle card fill
          border: '#E2EBE0',      // Soft border
          hover: '#24633F'        // Dark hover green
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(45, 122, 78, 0.08)',
        'card': '0 10px 30px -5px rgba(29, 29, 29, 0.05)',
        'glow': '0 0 25px rgba(107, 191, 89, 0.25)',
      }
    },
  },
  plugins: [],
}
