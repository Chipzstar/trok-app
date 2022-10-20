//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withNx } = require('@nrwl/next/plugins/with-nx');

const rewritesConfig = [
	{
		source: '/api/:path*',
		destination: `${process.env.API_BASE_URL}/api/:path*`
	}
];

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
	nx: {
		// Set this to true if you would like to use SVGR
		// See: https://github.com/gregberge/svgr
		svgr: false
	},
	webpack: (config, options) => {
		config.experiments = {
			topLevelAwait: true,
			layers: true
		};
		return config;
	},
	rewrites: async () => {
		return rewritesConfig;
	}
};

module.exports = withNx(nextConfig);
