/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          gray: '#f5f5f7',
          dark: '#1d1d1f',
          subtext: '#515154',
          blue: '#0071e3',
          blueHover: '#0077ed',
          border: '#d2d2d7',
        },
        forest: {
          50: '#F0F5F1',
          100: '#DFECE1',
          200: '#BFDAC5',
          300: '#95C0A0',
          400: '#69A378',
          500: '#468656',
          600: '#346B43',
          700: '#275233',
          800: '#1F4129',
          900: '#152C1C',
          950: '#0B170E',
        },
        ivory: {
          50: '#FDFCF9',
          100: '#FAF7F2',
          200: '#F4EFE5',
          300: '#EBE2D3',
          400: '#DFD1BD',
          500: '#D1BFA4',
        },
        gold: {
          50: '#FBF8F0',
          100: '#F5EED9',
          200: '#EBDBB0',
          300: '#DFC582',
          400: '#D4AF54',
          500: '#C59C38',
          600: '#A67F29',
          700: '#826020',
          800: '#664B1D',
          900: '#503B19',
        },
      },
      borderRadius: {
        'apple-card': '18px',
        'apple-pill': '980px',
        'apple-input': '12px',
      },
      fontFamily: {
        cairo: ['Cairo', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        system: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.04)',
        'premium': '0 10px 30px -10px rgba(21, 44, 28, 0.08), 0 4px 6px -2px rgba(21, 44, 28, 0.03)',
        'floating': '0 20px 40px -15px rgba(21, 44, 28, 0.12)',
        'apple-card': '0 4px 24px rgba(0, 0, 0, 0.04)',
        'apple-card-hover': '0 10px 40px rgba(0, 0, 0, 0.08)',
        'apple-focus': '0 0 0 4px rgba(0, 113, 227, 0.15)',
        'forest-focus': '0 0 0 4px rgba(39, 82, 51, 0.15)',
      },
      transitionTimingFunction: {
        'apple-ease': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    },
  },
  plugins: [],
};
