import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          border: 'hsl(var(--sidebar-border))',
        },
        sb: {
          green: {
            DEFAULT: '#3ECF8E',
            hover: '#34B27B',
            dark: '#1C6B46',
            light: 'rgba(62, 207, 142, 0.1)',
          },
          bg: {
            dark: '#0F1117',
            light: '#F0F4F8', /* Dim slate canvas */
          },
          surface: {
            dark: '#181A20',
            light: '#F6F9FC',
          },
          sidebar: {
            dark: '#111318',
            light: '#E2E8F0', /* Dim slate sidebar */
          },
          card: {
            dark: '#1B1F26',
            hoverDark: '#232833',
            light: '#F6F9FC',
            hoverLight: '#EDF2F7',
          },
          border: {
            dark: '#2A2F3A',
            light: '#CBD5E1',
          },
        },
        success: {
          DEFAULT: '#3ECF8E',
          foreground: '#0F1117',
        },
        warning: {
          DEFAULT: '#F59E0B',
          foreground: '#FFFFFF',
        },
        info: {
          DEFAULT: '#3B82F6',
          foreground: '#FFFFFF',
        },
      },
      borderRadius: {
        '2xl': '6px',
        xl: '4px',
        lg: '4px',
        md: '3px',
        sm: '2px',
        DEFAULT: '3px',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        pulseGlow: 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
