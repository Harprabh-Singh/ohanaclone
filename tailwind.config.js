export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Archivo Black', 'sans-serif'],
        body: ['Work Sans', 'sans-serif'],
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-33.333%)' },
        },
      },
      colors: {
        'teal-dark': '#0A2E2A',
        'teal-mid': '#0E3B36',
        'teal-card': '#163D38',
        cream: '#FAF7F1',
        'cream-dark': '#EDE9E0',
        magenta: '#C42D78',
        'magenta-dark': '#A02060',
        gold: '#B6912E',
        'text-dark': '#1A1A1A',
        'text-mid': '#4A4A4A',
        white: '#FFFFFF',
      },
      boxShadow: {
        depth: '0 30px 80px rgba(0,0,0,0.24)',
      },
      backgroundImage: {
        'surface-texture': "radial-gradient(circle at top, rgba(255,255,255,0.08), transparent 25%), radial-gradient(circle at 20% 90%, rgba(255,255,255,0.04), transparent 20%)",
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
