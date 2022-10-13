const { createGlobPatternsForDependencies } = require('@nrwl/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		join(__dirname, '{src,pages,components,containers,modals,layout,hooks}/**/*!(*.stories|*.spec).{ts,tsx,html}'),
		...createGlobPatternsForDependencies(__dirname)
	],
	theme: {
		fontFamily: {
			aeonik: ['Aeonik', 'sans-serif']
		},
		extend: {
			screens: {
				tablet: '640px',
				// => @media (min-width: 640px) { ... }
				laptop: '1024px',
				// => @media (min-width: 1024px) { ... }
				desktop: '1280px'
				// => @media (min-width: 1280px) { ... }
			},
			fontSize: {
				xxs: [
					'0.5rem',
					{
						lineHeight: '0.75rem'
					}
				],
				'2.5xl': '1.2rem'
			},
			width: {
				128: '32rem',
				162: '34rem',
				196: '36rem',
				226: '38rem',
				256: '40rem',
				368: '52rem',
				480: '64rem',
				560: '76rem'
			},
			colors: {
				primary: {
					DEFAULT: '#3646F5',
					50: '#E5E7FE',
					100: '#D1D5FD',
					200: '#ABB1FB',
					300: '#848EF9',
					400: '#5D6AF7',
					500: '#3646F5',
					600: '#0C1EE7',
					700: '#0917B2',
					800: '#06107D',
					900: '#040947'
				},
				success: {
					DEFAULT: '#00FF47',
					50: '#B8FFCB',
					100: '#A3FFBD',
					200: '#7AFF9F',
					300: '#52FF82',
					400: '#29FF64',
					500: '#00FF47',
					600: '#00C737',
					700: '#008F28',
					800: '#005718',
					900: '#001F09'
				},
				danger: {
					DEFAULT: '#DC3545',
					50: '#F7D1D5',
					100: '#F4C0C5',
					200: '#EE9DA5',
					300: '#E87B85',
					400: '#E25865',
					500: '#DC3545',
					600: '#B9202F',
					700: '#891823',
					800: '#590F17',
					900: '#29070A'
				}
			}
		}
	},
	plugins: []
};
