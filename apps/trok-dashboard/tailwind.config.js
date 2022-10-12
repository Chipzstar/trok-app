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
			aeonik: ["Aeonik", "sans-serif"]
		},
		extend: {
			screens: {
				tablet: "640px",
				// => @media (min-width: 640px) { ... }
				laptop: "1024px",
				// => @media (min-width: 1024px) { ... }
				desktop: "1280px"
				// => @media (min-width: 1280px) { ... }
			},
			fontSize: {
				xxs: [
					"0.5rem",
					{
						lineHeight: "0.75rem"
					}
				],
				"2.5xl": "1.2rem"
			},
			width: {
				128: "32rem",
				162: "34rem",
				196: "36rem",
				226: "38rem",
				256: "40rem",
				368: "52rem",
				480: "64rem",
				560: "76rem"
			},
			colors: {
				primary: {
					DEFAULT: "#3646F5",
					50: "#E5E7FE",
					100: "#D1D5FD",
					200: "#ABB1FB",
					300: "#848EF9",
					400: "#5D6AF7",
					500: "#3646F5",
					600: "#0C1EE7",
					700: "#0917B2",
					800: "#06107D",
					900: "#040947"
				},
			}
		}
	},
	plugins: []
};
