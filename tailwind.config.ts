import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';
import defaultTheme from 'tailwindcss/defaultTheme';

const typographyConfig = (theme: (path: string) => string) => ({
  DEFAULT: {
    css: {
      ':first-child': {
        marginTop: theme('margin.0'),
      },
      'h1, h2, h3, h4, h5, h6': {
        fontWeight: theme('fontWeight.semibold'),
        letterSpacing: theme('letterSpacing.tight'),
        marginBottom: theme('margin.4'),
        '+ h1, + h2, + h3, + h4, + h5, + h6': {
          marginTop: theme('margin.0'),
        },
      },
      h1: { fontSize: theme('fontSize.3xl'), marginTop: theme('margin.16') },
      h2: { fontSize: theme('fontSize.2xl') },
      h3: { fontSize: theme('fontSize.xl') },
      h4: { fontSize: theme('fontSize.lg') },
      h5: { fontSize: theme('fontSize.base') },
      h6: { fontSize: theme('fontSize.base') },
      table: {
        boxShadow: `0 0 0 1px ${theme('colors.gray.200')}`,
        borderRadius: theme('borderRadius.md'),
        overflow: 'hidden',
        p: { margin: 0 },
        th: {
          paddingTop: '0.5714286em',
          paddingRight: '0.5714286em',
          paddingBottom: '0.5714286em',
          paddingLeft: '0.5714286em',
          backgroundColor: theme('colors.gray.100'),
          '&:not(:last-child)': {
            borderRightWidth: '1px',
            borderRightColor: theme('colors.gray.200'),
          },
        },
        'tbody td, tfoot td': {
          paddingLeft: '0.5714286em',
          '&:not(:last-child)': {
            borderRightWidth: '1px',
            borderRightColor: theme('colors.gray.200'),
          },
        },
      },
      code: { '&::before, &::after': { display: 'none' } },
      pre: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme('colors.gray.200'),
      },
    },
  },
  invert: {
    css: {
      table: {
        boxShadow: `0 0 0 1px ${theme('colors.gray.700')}`,
        th: {
          backgroundColor: theme('colors.gray.800'),
          '&:not(:last-child)': { borderRightColor: theme('colors.gray.700') },
        },
        'tbody td, tfoot td': {
          '&:not(:last-child)': { borderRightColor: theme('colors.gray.700') },
        },
      },
      pre: { borderColor: theme('colors.gray.800') },
    },
  },
});

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/providers/**/*.{ts,tsx}',
    './src/hooks/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    screens: {
      xs: '475px',
      ...defaultTheme.screens,
    },
    extend: {
      colors: {
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
          foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'hsl(var(--success) / <alpha-value>)',
          foreground: 'hsl(var(--success-foreground) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning) / <alpha-value>)',
          foreground: 'hsl(var(--warning-foreground) / <alpha-value>)',
        },
        brand: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', ...defaultTheme.fontFamily.sans],
        mono: ['var(--font-geist-mono)', ...defaultTheme.fontFamily.mono],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      typography: typographyConfig,
    },
  },
  plugins: [animate, typography],
};

export default config;
