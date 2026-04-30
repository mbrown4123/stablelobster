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
        // Exact openclaw.ai palette
        bg: {
          deep: '#050810',
          surface: '#0a0f1a',
          elevated: '#111827',
        },
        coral: {
          bright: '#ff4d4d',
          mid: '#e63946',
          dark: '#991b1b',
        },
        cyan: {
          bright: '#00e5cc',
          mid: '#14b8a6',
          glow: 'rgba(0, 229, 204, 0.4)',
        },
        text: {
          primary: '#f0f4ff',
          secondary: '#8892b0',
          muted: '#5a6480',
        },
        border: {
          subtle: 'rgba(136, 146, 176, 0.15)',
          accent: 'rgba(255, 77, 77, 0.3)',
        },
        surface: {
          card: 'rgba(10, 15, 26, 0.65)',
          cardStrong: 'rgba(10, 15, 26, 0.8)',
          overlay: 'rgba(0, 0, 0, 0.3)',
          interactive: 'rgba(255, 255, 255, 0.1)',
          interactiveHover: 'rgba(255, 255, 255, 0.2)',
          cyanSoft: 'rgba(0, 229, 204, 0.15)',
          coralSoft: 'rgba(255, 77, 77, 0.15)',
        },
        shadow: {
          coralSoft: 'rgba(255, 77, 77, 0.15)',
          coralMid: 'rgba(255, 77, 77, 0.25)',
          coralStrong: 'rgba(255, 77, 77, 0.35)',
          cyanSoft: 'rgba(0, 229, 204, 0.15)',
        },
        logo: {
          gradientStart: '#ff4d4d',
          gradientEnd: '#991b1b',
          glow: 'rgba(255, 77, 77, 0.4)',
          glowHover: 'rgba(0, 229, 204, 0.6)',
        },
        hero: {
          titleStart: '#f0f4ff',
          titleEnd: '#00e5cc',
        },
        github: {
          hoverColor: '#f0f4ff',
        },
        // Light theme overrides
        light: {
          bg: {
            deep: '#fcfeff',
            surface: '#ffffff',
            elevated: '#f5f9ff',
          },
          coral: {
            bright: '#ef4b58',
            mid: '#de3f4d',
            dark: '#c43645',
          },
          cyan: {
            bright: '#008f87',
            mid: '#00766e',
            glow: 'rgba(0, 143, 135, 0.2)',
          },
          text: {
            primary: '#0b1220',
            secondary: '#2e405c',
            muted: '#5f7290',
          },
          border: {
            subtle: 'rgba(15, 23, 42, 0.16)',
            accent: 'rgba(239, 75, 88, 0.34)',
          },
          surface: {
            card: 'rgba(255, 255, 255, 0.88)',
            cardStrong: 'rgba(255, 255, 255, 0.95)',
            overlay: 'rgba(160, 174, 194, 0.26)',
            interactive: 'rgba(15, 23, 42, 0.1)',
            interactiveHover: 'rgba(15, 23, 42, 0.16)',
            cyanSoft: 'rgba(0, 143, 135, 0.16)',
            coralSoft: 'rgba(239, 75, 88, 0.16)',
            insetHighlight: 'rgba(15, 23, 42, 0.06)',
          },
          shadow: {
            coralSoft: 'rgba(239, 75, 88, 0.19)',
            coralMid: 'rgba(239, 75, 88, 0.27)',
            coralStrong: 'rgba(239, 75, 88, 0.33)',
            cyanSoft: 'rgba(0, 143, 135, 0.22)',
            githubSoft: 'rgba(11, 18, 32, 0.2)',
          },
          logo: {
            gradientStart: '#ff7079',
            gradientEnd: '#ea4c59',
            glow: 'rgba(239, 75, 88, 0.2)',
            glowHover: 'rgba(0, 143, 135, 0.35)',
          },
          hero: {
            titleStart: '#c93342',
            titleEnd: '#f04d5a',
          },
          github: {
            hoverColor: '#0b1220',
          },
        },
      },
      fontFamily: {
        display: ['Clash Display', 'system-ui', 'sans-serif'],
        sans: ['Satoshi', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5rem' }],
        'sm': ['0.875rem', { lineHeight: '1.5rem' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.7' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '1.2' }],
        '3xl': ['1.875rem', { lineHeight: '1.2' }],
        '4xl': ['2.25rem', { lineHeight: '1' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['4.5rem', { lineHeight: '1' }],
      },
      letterSpacing: {
        'tightest': '-0.06em',
        'tighter': '-0.05em',
        'tight': '-0.03em',
        'normal': '0',
        'wide': '0.02em',
        'wider': '0.05em',
        'widest': '0.1em',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'float': 'float 4s ease-in-out infinite',
        'blink': 'blink 3s ease-in-out infinite',
        'wiggle': 'wiggle 2s ease-in-out infinite',
        'twinkle': 'twinkle 8s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        blink: {
          '0%, 90%, 100%': { opacity: '1' },
          '95%': { opacity: '0.3' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
        twinkle: {
          '0%': { opacity: '0.4' },
          '100%': { opacity: '0.7' },
        },
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'card-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px var(--logo-glow)',
        'glow-hover': '0 0 30px var(--logo-glow-hover)',
        'coral-soft': 'var(--shadow-coral-soft)',
        'coral-mid': 'var(--shadow-coral-mid)',
        'coral-strong': 'var(--shadow-coral-strong)',
        'cyan-soft': 'var(--shadow-cyan-soft)',
        'github-soft': 'var(--shadow-github-soft)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
