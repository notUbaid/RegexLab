const c = (n) => `rgb(var(--c-${n}) / <alpha-value>)`;
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      borderRadius: { sm: '3px', DEFAULT: '4px', md: '5px', lg: '6px', xl: '8px', '2xl': '10px' },
      colors: {
        hl: 'rgb(var(--hl) / <alpha-value>)',
        background: c('bg'), surface: c('surface'), 'surface-elevated': c('elev'), 'surface-subtle': c('subtle'),
        border: c('border'), 'border-subtle': 'rgb(var(--c-text) / 0.08)', 'border-glow': 'rgb(var(--c-primary) / 0.4)',
        foreground: c('text'), 'foreground-muted': c('muted'), 'foreground-dim': c('dim'),
        muted: c('elev'), card: c('surface'),
        primary: { DEFAULT: c('primary'), hover: 'rgb(var(--c-primary) / 0.85)', glow: 'rgb(var(--c-primary) / 0.35)', foreground: c('primary-fg') },
        accent: { cyan: '#4cc9f0', indigo: '#7aa2ff', violet: '#c58bff', fuchsia: '#ff6fae', emerald: '#36cfa0', amber: '#ffd166', rose: '#ff8a5b' },
        group: { 0: '#ffd63d', 1: '#ff6cb4', 2: '#46d4ff', 3: '#76e06a', 4: '#ff9e42', 5: '#b28cff', 6: '#ff6b6b', 7: '#5eeabe' },
      },
      fontFamily: {
        sans: ['Bricolage Grotesque', 'system-ui', 'sans-serif'],
        mono: ['Spline Sans Mono', 'ui-monospace', 'Consolas', 'monospace'],
      },
      transitionTimingFunction: { smooth: 'cubic-bezier(0.16, 1, 0.3, 1)', spring: 'cubic-bezier(0.32, 0.72, 0, 1)' },
      boxShadow: { bezel: 'none', 'glow-primary': '0 0 0 3px rgb(var(--c-primary) / 0.18)', 'inner-bezel': 'none' },
      animation: { 'pulse-subtle': 'pulseSubtle 2.5s ease-in-out infinite', shimmer: 'shimmer 2s linear infinite' },
      keyframes: {
        pulseSubtle: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};
