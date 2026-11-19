// Colours come from CSS variables in src/styles/index.css, so one class (e.g. bg-surface)
// works in both the dark and the light theme.
const color = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: color('bg'),
        surface: color('surface'),
        'surface-subtle': color('subtle'),
        'surface-elevated': color('elev'),
        border: color('border'),
        foreground: color('text'),
        'foreground-muted': color('muted'),
        'foreground-dim': color('dim'),
        hl: color('hl'),
        ok: color('ok'),
        warn: color('warn'),
        err: color('err'),
      },
      fontFamily: {
        sans: ['Bricolage Grotesque', 'system-ui', 'sans-serif'],
        mono: ['Spline Sans Mono', 'ui-monospace', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
