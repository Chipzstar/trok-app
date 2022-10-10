const { createGlobPatternsForDependencies } = require('@nrwl/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		join(__dirname, '{src,pages,components,containers,modals,layout}/**/*!(*.stories|*.spec).{ts,tsx,html}'),
		...createGlobPatternsForDependencies(__dirname)
	],
	theme: {
		extend: {}
	},
	plugins: []
};
