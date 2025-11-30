/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // or 'media'
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        highcontrast: '#000',
        highcontrastText: '#FFD700', // gold text
      },
      gridTemplateColumns: {
        'auto': 'repeat(auto-fit, minmax(200px, 1fr))',
      },
      animation: {
        'spin-slow': 'spin 6s linear infinite', // slower spin
      },
      typography: {
        DEFAULT: {
          css: {
            'p': { marginTop: '1rem', marginBottom: '1rem' },
            'ol': { listStyleType: 'decimal', marginLeft: '1.5rem' },
            'li': { marginBottom: '0.25rem' },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
