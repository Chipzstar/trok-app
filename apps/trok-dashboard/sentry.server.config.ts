import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;
const environment = process.env.DOPPLER_ENVIRONMENT

Sentry.init({
	dsn: SENTRY_DSN || "https://8225abdfb77241e386ff6adee207fe57@o4503959141679104.ingest.sentry.io/4503959143448577",
	// We recommend adjusting this value in production, or using tracesSampler
	// for finer control
	tracesSampleRate: 1.0,
	environment
	// ...
	// Note: if you want to override the automatic release value, do not set a
	// `release` value here - use the environment variable `SENTRY_RELEASE`, so
	// that it will also get attached to your source maps
});