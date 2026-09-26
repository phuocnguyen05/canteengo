/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-card': 'var(--bg-card)',
        'bg-input': 'var(--bg-input)',
        'bg-hover': 'var(--bg-hover)',
        'bg-elevated': 'var(--bg-elevated)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'border-base': 'var(--border-color)',
        'border-gold': 'var(--border-gold)',
        'gold': 'var(--gold)',
        'gold-hover': 'var(--gold-hover)',
        'gold-dark': 'var(--gold-dark)',
        'success': 'var(--success)',
        'warning': 'var(--warning)',
        'danger': 'var(--danger)',
        'info': 'var(--info)',
        dark: {
          bg: 'var(--bg-primary)',
          card: 'var(--bg-card)',
          hover: 'var(--bg-hover)',
          border: 'var(--border-color)',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Be Vietnam Pro"', '"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(232, 184, 75, 0.25)',
        'gold-glow-sm': '0 0 15px -3px rgba(232, 184, 75, 0.2)',
        'dark-card': '0 8px 30px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
}
