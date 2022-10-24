import * as express from 'express';
import * as cors from 'cors';
import * as hpp from 'hpp';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as trpcExpress from '@trpc/server/adapters/express';
import { createContext } from './app/trpc';
import { errorHandler } from './app/middleware/errorHandler';
import authRoutes from './app/routes/auth';
import { appRouter } from './app/routes';
import { v4 as uuidv4 } from 'uuid';
import { sendMagicLink } from './app/helpers/email';
import { storage } from './app/utils/clients';

const runApp = async () => {
	const app = express();
	app.set('trust proxy', 1);
	app.use(cors());
	// using protecting against HTTP Parameter Pollution attacks
	app.use(hpp());
	// using bodyParser to parse JSON bodies into JS objects
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	// adding morgan to log HTTP requests
	app.use(logger('dev'));

	app.disable('x-powered-by');
	const trpcApiEndpoint = '/server/trpc';
	const playgroundEndpoint = '/server/trpc-playground';

	// TRPC ROUTES
	app.use(
		trpcApiEndpoint,
		trpcExpress.createExpressMiddleware({
			router: appRouter,
			createContext
		})
	);

	/*app.use(
		playgroundEndpoint,
		await expressHandler({
			trpcApiEndpoint,
			playgroundEndpoint,
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
	app.use('/ping', (req, res) => {
		const message = `Pinged at ${new Date().toUTCString()}`;
		console.log(`${req.ip} - ${message}`);
		res.status(200).json({
			message
		});
	});
	/**
	 *	AUTH ROUTES
	 */
	app.use('/server/auth', authRoutes);
	app.get('/server/gcp/upload', async (req, res, next) => {
		try {
			const { filename, crn, type } = req.query;
			console.table({filename, crn, type});
			const bucket = storage.bucket(String(process.env.GCS_BUCKET_NAME));
			console.log(bucket)
			const filepath = `${crn}/${type}/${filename}`;
			const file = bucket.file(filepath);
			console.log(file)
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
	 * TEST ROUTES
	 */
	app.get('/test/user-agent', async (req, res, next) => {
		try {
			console.log(req.ip)
			console.log(req.get('User-Agent'))
			res.status(200).send(Date.now())
		} catch (err) {
			console.error(err);
			next(err);
		}
	})
	app.post('/test/email', async (req, res, next) => {
		try {
			const { email, name } = req.body;
			const response = await sendMagicLink(email, name, uuidv4());
			console.log(response);
			res.status(200).json(response);
		} catch (err) {
			console.error(err);
			next(err);
		}
	});
	/**
	 * ERROR HANDLERS
	 */
	app.use(errorHandler);

	const port = process.env.PORT || 3333;
	const server = app.listen(port, () => {
		console.log(`Listening at http://localhost:${port}/server`);
	});
	server.on('error', console.error);
};

runApp().then(r => 'Server is online!');
