import type { Config } from 'tailwindcss'

export default {
  content: ["./src/**/*.{html,js,ts,tsx}"], // Inclui arquivos TypeScript
  theme: {
    extend: {
      fontFamily: {
        russo: ['"Russo One"', 'sans-serif'], // Mant‚m a fonte customizada
      },
    },
  },
  plugins: [],
} satisfies Config
