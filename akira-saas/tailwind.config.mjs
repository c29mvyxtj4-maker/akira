/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ── Akira Brand ─────────────────────────────────── */
        brand: {
          50:  '#fff0f0',
          100: '#ffdcdc',
          200: '#ffb8b8',
          300: '#ff8585',
          400: '#ff4444',
          500: '#e63946',
          600: '#cc2936',
          700: '#a81d28',
          800: '#8a1820',
          900: '#721518',
        },

        /* ── Superficies dark ────────────────────────────── */
        surface: {
          0: '#060608',
          1: '#0a0a0d',
          2: '#0f0f14',
          3: '#141419',
          4: '#1a1a21',
          5: '#202028',
        },

        /* ── Superficies light ───────────────────────────── */
        'surface-light': {
          0: '#ffffff',
          1: '#f8f8fb',
          2: '#f1f1f7',
          3: '#e8e8f0',
          4: '#dddde8',
          5: '#d0d0e0',
        },

        /* ── Bordes ──────────────────────────────────────── */
        border: {
          DEFAULT: 'rgba(255,255,255,0.07)',
          light:   'rgba(0,0,0,0.08)',
          brand:   'rgba(230,57,70,0.35)',
        },

        /* ── Texto dark ──────────────────────────────────── */
        text: {
          1: '#ffffff',
          2: '#e0e0e8',
          3: '#a0a0b0',
          4: '#606070',
          5: '#404050',
        },

        /* ── Texto light ─────────────────────────────────── */
        'text-light': {
          1: '#0a0a0d',
          2: '#1a1a28',
          3: '#505065',
          4: '#888899',
          5: '#aaaabc',
        },

        /* ── Status ──────────────────────────────────────── */
        status: {
          success: '#22c55e',
          warning: '#f59e0b',
          danger:  '#e63946',
          info:    '#3b82f6',
          purple:  '#a855f7',
        },
      },

      backgroundImage: {
        /* Degradados de fondo */
        'gradient-akira':  'linear-gradient(135deg, #060608 0%, #0f0507 50%, #060608 100%)',
        'gradient-surface': 'linear-gradient(180deg, #0a0a0d 0%, #060608 100%)',
        'gradient-brand':  'linear-gradient(135deg, #e63946 0%, #cc2936 100%)',
        'gradient-brand-soft': 'linear-gradient(135deg, rgba(230,57,70,0.15) 0%, rgba(204,41,54,0.05) 100%)',
        'gradient-card':   'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        'gradient-glow':   'radial-gradient(ellipse at top, rgba(230,57,70,0.12) 0%, transparent 60%)',
        'gradient-sidebar': 'linear-gradient(180deg, #0a0a0d 0%, #08080b 100%)',

        /* Light mode */
        'gradient-akira-light':   'linear-gradient(135deg, #ffffff 0%, #fdf0f1 50%, #ffffff 100%)',
        'gradient-brand-light':   'linear-gradient(135deg, #e63946 0%, #cc2936 100%)',
        'gradient-glow-light':    'radial-gradient(ellipse at top, rgba(230,57,70,0.08) 0%, transparent 60%)',
      },

      boxShadow: {
        'brand-sm':  '0 0 12px rgba(230,57,70,0.2)',
        'brand-md':  '0 0 24px rgba(230,57,70,0.25)',
        'brand-lg':  '0 0 48px rgba(230,57,70,0.3)',
        'card':      '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover':'0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(230,57,70,0.15)',
        'modal':     '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
        'input':     '0 0 0 2px rgba(230,57,70,0.3)',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },

      borderRadius: {
        'xl2': '1rem',
        'xl3': '1.25rem',
      },

      animation: {
        'fade-in':     'fadeIn 0.2s ease-out',
        'fade-up':     'fadeUp 0.25s ease-out',
        'slide-in':    'slideIn 0.2s ease-out',
        'pulse-brand': 'pulseBrand 2s ease-in-out infinite',
        'shimmer':     'shimmer 2s linear infinite',
        'glow':        'glow 3s ease-in-out infinite',
      },

      keyframes: {
        fadeIn:      { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        fadeUp:      { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        slideIn:     { '0%': { transform: 'translateX(-8px)', opacity: 0 }, '100%': { transform: 'translateX(0)', opacity: 1 } },
        pulseBrand:  { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
        shimmer:     { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        glow:        { '0%,100%': { boxShadow: '0 0 12px rgba(230,57,70,0.2)' }, '50%': { boxShadow: '0 0 32px rgba(230,57,70,0.5)' } },
      },
    },
  },
  plugins: [],
}