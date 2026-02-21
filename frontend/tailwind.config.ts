import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e40af',
          light: '#dbeafe',
          dark: '#1e3a8a',
        },
        surface: '#ffffff',
        background: '#f8fafc',
        muted: '#64748b',
        success: '#16a34a',
        error: '#dc2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
    },
  },
  plugins: [],
};

export default config;
