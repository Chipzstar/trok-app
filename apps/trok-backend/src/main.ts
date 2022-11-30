import express from 'express';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import cors from 'cors';
import hpp from 'hpp';
import logger from 'morgan';
import bodyParser from 'body-parser';
import * as trpcExpress from '@trpc/server/adapters/express';
import { createContext } from './app/trpc';
import { errorHandler } from './app/middleware/errorHandler';
import authRoutes from './app/routes/auth';
import testRoutes from './app/routes/test';
import stripeRoutes from './app/routes/stripe';
import plaidRoutes from './app/routes/plaid';
import { appRouter } from './app/routes';
import 'express-async-errors';
import './app/process';
import { checkPastDueStatements } from './app/helpers/statements';
import { BUCKET, ENVIRONMENT, HttpCode, IS_DEVELOPMENT, SENTRY_DSN } from './app/utils/constants';
import { ONE_HOUR, THIRTY_MINUTES } from '@trok-app/shared-utils';
import { checkCardDeliveredStatus } from './app/helpers/cards';

const runApp = async () => {
	const app = express();
	Sentry.init({
		dsn: SENTRY_DSN,
		integrations: [
			// enable HTTP calls tracing
			new Sentry.Integrations.Http({ tracing: true }),
			// enable Express.js middleware tracing
			new Tracing.Integrations.Express({ app })
		],
		environment: ENVIRONMENT,
		// Set tracesSampleRate to 1.0 to capture 100%
		// of transactions for performance monitoring.
		// We recommend adjusting this value in production
		tracesSampleRate: 1.0
	});
	// RequestHandler creates a separate execution context using domains, so that every
	// transaction/span/breadcrumb is attached to its own Hub instance
	app.use(Sentry.Handlers.requestHandler());
	// TracingHandler creates a trace for every incoming request
	app.use(Sentry.Handlers.tracingHandler());
	app.set('trust proxy', 1);
	app.use(cors());
	// using protecting against HTTP Parameter Pollution attacks
	app.use(hpp());
	// using bodyParser to parse JSON bodies into JS objects
	const jsonParser = bodyParser.json();
	app.use(bodyParser.urlencoded({ extended: true }));
	// adding morgan to log HTTP requests
	app.use(logger('dev'));
	// apply rate limiting to login auth route
	app.disable('x-powered-by');
	const trpcApiEndpoint = '/server/trpc';
	const playgroundEndpoint = '/server/trpc-playground';

	// TRPC ROUTES
	app.use(
		trpcApiEndpoint,
		jsonParser,
		trpcExpress.createExpressMiddleware({
			router: appRouter,
			createContext,
			responseMeta({ ctx, paths, type, errors }) {
				// check no procedures errored
				const allOk = errors.length === 0;
				// check the request is a query request
				const isQuery = type === 'query';
				// @ts-ignore
				if (ctx?.res && allOk && isQuery) {
					// cache request for 1 day + revalidate once every second
					const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
					return {
						headers: {
							'cache-control': `s-maxage=1, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`
						}
					};
				}
				return {};
			}
		})
	);
	/*app.use(
		playgroundEndpoint,
		await expressHandler({
			trpcApiEndpoint,
			playgroundEndpoint,
			jsonParser,
			router: appRouter,
			// request: {
			// 	superjson: true
			// }
		})
	);*/
	// ROUTES
	/*
	 *  WELCOME ROUTE
	 */
	app.get('/server', (req, res) => {
		res.send({ message: 'Welcome to trok!' });
	});
	// Health check route for hosting platform
	app.use('/ping', jsonParser, (req, res) => {
		const message = `Pinged at ${new Date().toUTCString()}`;
		console.log(`${req.ip} - ${message}`);
		res.status(200).json({
			message
		});
	});
	/**
	 *	AUTH ROUTES
	 */
	app.use('/server/auth', jsonParser, authRoutes);
	app.get('/server/gcp/upload', async (req, res, next) => {
		try {
			const { filename, crn, type } = req.query;
			console.table({ filename, crn, type });
			const filepath = `${crn}/${type}/${filename}`;
			const file = BUCKET.file(filepath);
			console.log(file);
			console.log(`${filename} uploaded to ${process.env.GCS_BUCKET_NAME}`);
			const options = {
				expires: Date.now() + 1 * 60 * 1000, //  1 minute,
				fields: { 'x-goog-meta-test': 'data' }
			};
			const [response] = await file.generateSignedPostPolicyV4(options);
			res.status(200).json(response);
		} catch (err) {
			console.error(err);
			next(err);
		}
	});
	/**
	 *  STRIPE ROUTES
	 */
	app.use('/server/stripe', stripeRoutes);
	/**
	 *  PLAID ROUTES
	 */
	app.use('/server/plaid', jsonParser, plaidRoutes);
	/**
	 * TEST ROUTES
	 */
	app.use('/test', jsonParser, testRoutes);
	app.get('/debug-sentry', function mainHandler(req, res) {
		throw new Error('My first Sentry error!');
	});
	/**
	 * ERROR HANDLERS
	 */
	/*app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
		errorHandler.handleError(err, res);
	});*/
	// The error handler must be before any other error middleware and after all controllers
	app.use(
		Sentry.Handlers.errorHandler({
			shouldHandleError(error) {
				// Capture all 400, 401, 404 and 500 errors
				if (
					[
						HttpCode.BAD_REQUEST,
						HttpCode.NOT_FOUND,
						HttpCode.UNAUTHORIZED,
						HttpCode.TOO_MANY_REQUESTS,
						HttpCode.INTERNAL_SERVER_ERROR
					].includes(Number(error.status))
				) {
					return true;
				}
				return false;
			}
		})
	);
	// Custom express error handler
	app.use(errorHandler);

	const port = process.env.PORT || 3333;
	const server = app.listen(port, () => {
		IS_DEVELOPMENT && console.log(`Listening at http://localhost:${port}/server`);
		// BUSINESS STATEMENT GENERATOR
		setInterval(checkPastDueStatements, ONE_HOUR);
		setInterval(checkCardDeliveredStatus, THIRTY_MINUTES);
	});
	server.on('error', console.error);
};

runApp().then(() => null);
