import express from 'express';
import cors from 'cors';
import hpp from 'hpp';
import logger from 'morgan';
import bodyParser from 'body-parser';
import * as trpcExpress from '@trpc/server/adapters/express';
import { createContext } from './app/trpc';
import { errorHandler } from './app/middleware/errorHandler';
import authRoutes from './app/routes/auth';
import stripeRoutes from './app/routes/stripe';
import plaidRoutes from './app/routes/plaid';
import { appRouter } from './app/routes';
import 'express-async-errors';
import './app/process';
import { checkPastDueStatements } from './app/helpers/statements';
import { BUCKET, ONE_HOUR } from './app/utils/constants';

const runApp = async () => {
	const app = express();
	app.set('trust proxy', 1);
	app.use(cors());
	// using protecting against HTTP Parameter Pollution attacks
	app.use(hpp());
	// using bodyParser to parse JSON bodies into JS objects
	const jsonParser = bodyParser.json();
	app.use(bodyParser.urlencoded({ extended: true }));
	// adding morgan to log HTTP requests
	app.use(logger('dev'));

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
							'cache-control': `s-maxage=1, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`,
						},
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
	app.get('/test/user-agent', jsonParser, async (req, res, next) => {
		try {
			console.log(req.ip);
			console.log(req.get('User-Agent'));
			res.status(200).send(Date.now());
		} catch (err) {
			console.error(err);
			next(err);
		}
	});
	/**
	 * ERROR HANDLERS
	 */
	/*app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
		errorHandler.handleError(err, res);
	});*/

	app.use(errorHandler)

	const port = process.env.PORT || 3333;
	const server = app.listen(port, () => {
		console.log(`Listening at http://localhost:${port}/server`);
		// BUSINESS STATEMENT GENERATOR
		setInterval(checkPastDueStatements , ONE_HOUR)
	});
	server.on('error', console.error);
};

runApp().then(() => null);
