import * as express from 'express';
import { stripe } from '../../utils/clients';
import * as bodyParser from 'body-parser';
import { handleAuthorizationRequest } from '../../helpers/stripe';
import Stripe from 'stripe';
import 'express-async-errors';
import { NextFunction } from 'express';

const webhookSecret = String(process.env.STRIPE_WEBHOOK_SECRET);
const router = express.Router();

router.post(
	'/webhook',
	bodyParser.raw({ type: 'application/json' }),
	async (req: express.Request, res: express.Response, next: NextFunction) => {
		const sig = req.headers['stripe-signature'];
		let event: Stripe.Event = req.body;
		try {
			event = stripe.webhooks.constructEvent(req.body, <string>sig, webhookSecret);
			console.log('✅  Success Webhook verified!');
		} catch (err) {
			// On error, log and return the error message
			if (err instanceof Error) {
				console.log(`❌ Error message: ${err.message}`);
				next(err);
			} else {
				console.log(`❌ Unexpected error: ${err}`);
				next(err);
			}
		}
		// Successfully constructed event
		console.log('✅ Success:', event.id);
		// Handle the event
		switch (event.type) {
			case 'issuing_authorization.request':
				const auth = event.data.object;
				await handleAuthorizationRequest(auth);
				break;
			default:
				break;
		}
		// Return a response to acknowledge receipt of the event
		res.json({ received: true });
	}
);
