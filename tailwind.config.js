/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      colors: {
        carbon: '#030712',
        graphite: '#111827',
        ion: '#22d3ee',
        plasma: '#f43f5e',
        volt: '#a3e635',
        amberhud: '#f59e0b'
      },
      boxShadow: {
        glow: '0 0 32px rgb(34 211 238 / 0.28)',
        danger: '0 0 36px rgb(244 63 94 / 0.35)',
        glass: '0 18px 60px rgb(0 0 0 / 0.32)'
      },
      animation: {
        scan: 'scan 3s linear infinite',
        pulseGlow: 'pulseGlow 2.4s ease-in-out infinite'
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.72' },
          '50%': { opacity: '1' }
        }
      }
    }
  },
  plugins: []
};
