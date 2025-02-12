import type { Config } from 'tailwindcss'
import { PluginAPI } from 'tailwindcss/types/config'

const config: Config = {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  safelist: [
    'grid-cols-1',
    'grid-cols-2',
    'grid-cols-3',
    'grid-cols-4',
    'outline-nord-11',
    'outline-nord-13',
    'outline-nord-14'
  ],
  theme: {
    extend: {
      colors: {
        conifer: {
          100: '#18201f',
          200: '#1b2423',
          300: '#232f2d',
          400: '#2b3b37',
          500: '#384d48',
          600: '#455e59',
          700: '#67837e',
          800: '#a8c7c0',
          900: '#dde5ed'
        },
        floral: {
          red: '#f37653',
          orange: '#ffc757',
          yellow: '#ffff57',
          green: '#a7e372',
          blue: '#79caf6',
          lilac: '#d488e7'
        },
        'nord-0': '#2E3440',
        'nord-1': '#3B4252',
        'nord-2': '#434C5E',
        'nord-3': '#4C566A',
        'nord-4': '#D8DEE9',
        'nord-5': '#E5E9F0',
        'nord-6': '#ECEFF4',
        'nord-7': '#8FBCBB',
        'nord-8': '#88C0D0',
        'nord-9': '#81A1C1',
        'nord-10': '#5E81AC',
        'nord-11': '#BF616A',
        'nord-12': '#D08770',
        'nord-13': '#EBCB8B',
        'nord-14': '#A3BE8C',
        'nord-15': '#B48EAD',
        'nord--1': '#242933',
        'nord-11-dark': '#83353d',
        'nord-11-light': '#dca8ad',
        'nord-13-dark': '#dca332',
        'nord-13-light': '#faf1e0',
        'nord-14-dark': '#709353',
        'nord-14-light': '#d8e4ce'
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji'
        ],
        odachi: ['Odachi', 'sans-serif'],
        robotica: ['Robotica', 'sans-serif']
      }
    }
  },
  plugins: [
    require('tailwind-corner-smoothing'),
    function ({ addBase }: PluginAPI) {
      addBase({
        ':root': {
          '--nord-0': '#2E3440',
          '--nord-1': '#3B4252',
          '--nord-2': '#434C5E',
          '--nord-3': '#4C566A',
          '--nord-4': '#D8DEE9',
          '--nord-5': '#E5E9F0',
          '--nord-6': '#ECEFF4',
          '--nord-7': '#8FBCBB',
          '--nord-8': '#88C0D0',
          '--nord-9': '#81A1C1',
          '--nord-10': '#5E81AC',
          '--nord-11': '#BF616A',
          '--nord-12': '#D08770',
          '--nord-13': '#EBCB8B',
          '--nord-14': '#A3BE8C',
          '--nord-15': '#B48EAD',
          '--nord--1': '#242933',
          '--nord-11-dark': '#83353d',
          '--nord-11-light': '#dca8ad',
          '--nord-13-dark': '#dca332',
          '--nord-13-light': '#faf1e0',
          '--nord-14-dark': '#709353',
          '--nord-14-light': '#d8e4ce'
        }
      })
    }
  ]
}

export default config
