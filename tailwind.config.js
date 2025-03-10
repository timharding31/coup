const config = {
    content: ['./app/**/*.{js,jsx,ts,tsx}'],
    safelist: [
        'leading-1',
        'leading-2',
        'leading-3',
        'leading-4',
        'leading-5',
        'leading-6',
        'leading-7',
        'leading-8',
        'grid-cols-1',
        'grid-cols-2',
        'grid-cols-3',
        'grid-cols-4',
        'grid-rows-1',
        'grid-rows-2',
        'grid-rows-3',
        'grid-rows-4',
        'outline-nord-11',
        'outline-nord-13',
        'outline-nord-14',
        'outline-nord-15',
        'outline-nord-0',
        'text-nord-0',
        'text-nord-1',
        'text-nord-2',
        'text-nord-3',
        'text-nord-4',
        'text-nord-5',
        'text-nord-6',
        'text-nord-7',
        'text-nord-8',
        'text-nord-9',
        'text-nord-10',
        'text-nord-11',
        'text-nord-12',
        'text-nord-13',
        'text-nord-14',
        'text-nord-15',
        'text-nord--1',
        'text-nord-14-dark',
        'text-purple-400',
        'text-emerald-400',
        'text-amber-400',
        'bg-nord-0',
        'bg-nord-1',
        'bg-nord-2',
        'bg-nord-3',
        'bg-nord-4',
        'bg-nord-5',
        'bg-nord-6',
        'bg-nord-7',
        'bg-nord-8',
        'bg-nord-9',
        'bg-nord-10',
        'bg-nord-11',
        'bg-nord-12',
        'bg-nord-13',
        'bg-nord-14',
        'bg-nord-15',
        'bg-nord--1'
    ],
    theme: {
        extend: {
            colors: {
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
                'nord-14-light': '#d8e4ce',
                'nord-11-darkest': '#592429'
            },
            fontFamily: {
                odachi: ['Odachi', 'sans-serif'],
                robotica: ['Robotica', 'sans-serif'],
                sansation: [
                    'Sansation',
                    'sans-serif',
                    'ui-sans-serif',
                    'system-ui',
                    'sans-serif',
                    'Apple Color Emoji',
                    'Segoe UI Emoji',
                    'Segoe UI Symbol',
                    'Noto Color Emoji'
                ]
            },
            keyframes: {
                'coin-change': {
                    '0%': { opacity: '0', transform: 'translateY(0)' },
                    '15%': { opacity: '1', transform: 'translateY(-8px)' },
                    '85%': { opacity: '1', transform: 'translateY(-8px)' },
                    '100%': { opacity: '0', transform: 'translateY(-16px)' }
                }
            },
            animation: {
                'coin-change': 'coin-change 2s ease-out forwards'
            }
        }
    },
    plugins: [
        function ({ addBase }) {
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
                    '--nord-14-light': '#d8e4ce',
                    '--nord-11-darkest': '#592429'
                }
            });
        }
    ]
};
export default config;
