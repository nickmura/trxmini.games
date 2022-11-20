const defaultTheme = require('tailwindcss/defaultTheme')


const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			fontFamily: {
				sans: ['Jost', ...defaultTheme.fontFamily.sans],
			},
			maxWidth: {
				'8xl': '84rem'
			},
		}
	},

	plugins: [],
	darkMode: 'class',
};

module.exports = config;
