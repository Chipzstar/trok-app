//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withNx } = require('@nrwl/next/plugins/with-nx');
const { withSentryConfig } = require('@sentry/nextjs')

const base_url = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333'

const rewritesConfig = [
	{
		source: '/server/:path*',
		destination: `${base_url}/server/:path*`
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
	sentry: {
		hideSourceMaps: true
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

const SentryWebpackPluginOptions = {

}

module.exports = withSentryConfig(withNx(nextConfig), {});
