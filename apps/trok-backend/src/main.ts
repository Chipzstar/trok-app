/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import * as express from 'express';
import * as cors from 'cors';
import * as trpcExpress from '@trpc/server/adapters/express';
import { expressHandler } from 'trpc-playground/handlers/express';
import { appRouter } from './app/routes';
import { createContext } from './app/trpc';

const runApp = async () => {
	const app = express();
	app.use(cors());
	const trpcApiEndpoint = '/api/trpc';
	const playgroundEndpoint = '/api/trpc-playground';

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

	app.use('/ping', (req, res) => {
		const message = `Pinged at ${new Date().toUTCString()}`;
		console.log(`${req.ip} - ${message}`);
		res.status(200).json({
			message
		});
	});

	app.get('/api', (req, res) => {
		res.send({ message: 'Welcome to trok!' });
	});

	const port = process.env.PORT || 3333;
	const server = app.listen(port, () => {
		console.log(`Listening at http://localhost:${port}/api`);
	});
	server.on('error', console.error);
};

runApp().then(r => 'Server is online!');
