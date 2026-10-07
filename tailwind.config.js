/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', '"Noto Serif SC"', 'Georgia', 'serif'],
        mono: ['"Space Mono"', '"IBM Plex Mono"', '"Noto Sans SC"', 'monospace'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif SC"', '"Noto Sans SC"', 'Songti SC', 'serif'],
      },
    },
  },
  plugins: [],
}
