/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        'surface-subtle': 'var(--color-surface-subtle)',
        border: 'var(--color-border)',
        'border-subtle': 'var(--color-border-subtle)',
        'border-glow': 'var(--color-border-glow)',
        foreground: 'var(--color-text)',
        'foreground-muted': 'var(--color-text-muted)',
        'foreground-dim': 'var(--color-text-dim)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          glow: 'var(--color-primary-glow)',
          foreground: 'var(--color-primary-fg)',
        },
        accent: {
          cyan: '#06b6d4',
          indigo: '#6366f1',
          violet: '#8b5cf6',
          fuchsia: '#d946ef',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
        group: {
          0: '#38bdf8', // Match full: Sky blue
          1: '#818cf8', // Group 1: Indigo
          2: '#c084fc', // Group 2: Purple
          3: '#34d399', // Group 3: Emerald
          4: '#fbbf24', // Group 4: Amber
          5: '#f472b6', // Group 5: Pink
          6: '#2dd4bf', // Group 6: Teal
          7: '#fb7185', // Group 7: Rose
        }
      },
      fontFamily: {
        sans: ['Geist', 'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', 'monospace'],
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring': 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      boxShadow: {
        'bezel': '0 0 0 1px var(--color-border-subtle), 0 8px 30px -10px rgba(0,0,0,0.4)',
        'glow-primary': '0 0 25px -5px var(--color-primary-glow)',
        'inner-bezel': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
};
