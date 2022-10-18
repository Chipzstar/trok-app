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
import { limiterConsecutiveFailsByEmailAndIP } from './app/middleware/rateLimitController';

const runApp = async () => {
	const app = express();
	app.set('trust proxy', 1)
	app.use(cors());
	// using protecting against HTTP Parameter Pollution attacks
	app.use(hpp());
	// using bodyParser to parse JSON bodies into JS objects
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	// adding morgan to log HTTP requests
	app.use(logger('dev'));

	app.disable('x-powered-by');
	const trpcApiEndpoint = '/api/trpc';
	const playgroundEndpoint = '/api/trpc-playground';

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

	// Health check route for hosting platform
	app.use('/ping', (req, res) => {
		const message = `Pinged at ${new Date().toUTCString()}`;
		console.log(`${req.ip} - ${message}`);
		res.status(200).json({
			message
		});
	});

	// ROUTES
	app.get('/api', (req, res) => {
		res.send({ message: 'Welcome to trok!' });
	});
	app.use('/api/auth', authRoutes)
	app.use(errorHandler)

	const port = process.env.PORT || 3333;
	const server = app.listen(port, () => {
		console.log(`Listening at http://localhost:${port}/api`);
	});
	server.on('error', console.error);
};

runApp().then(r => 'Server is online!');
