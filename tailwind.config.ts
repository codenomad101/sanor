import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sanor: {
          pink: '#FF69B4',
          'pink-light': '#FFB6C1',
          'pink-soft': '#FFC0CB',
          purple: '#660033', // Burgundy
          'purple-light': '#900048', // Lighter burgundy/magenta
          'purple-soft': '#E6E6FA',
          black: '#1A1A1A',
          white: '#FFFFFF',
        }
      },
      fontFamily: {
        logo: ['Papyrus', 'fantasy'],
        sans: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-sanor': 'linear-gradient(135deg, #FFB6C1 0%, #E6E6FA 50%, #D8BFD8 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(255,182,193,0.1) 0%, rgba(216,191,216,0.1) 100%)',
      },
    },
  },
  plugins: [],
}
export default config

