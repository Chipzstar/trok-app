import express from 'express';
import { NextFunction } from 'express';
import { stripe } from '../../utils/clients';
import bodyParser from 'body-parser';
import { createTransaction, handleAuthorizationRequest, updateCard } from '../../helpers/stripe';
import Stripe from 'stripe';
import 'express-async-errors';

const webhookSecret = String(process.env.STRIPE_WEBHOOK_SECRET);
const router = express.Router();
const jsonParser = bodyParser.json();

router.post(
	'/webhook',
	bodyParser.raw({ type: 'application/json' }),
	async (req: express.Request, res: express.Response, next: NextFunction) => {
		const sig = req.headers['stripe-signature'];
		let obj;
		let data;
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
				obj = event.data.object;
				data = obj as Stripe.Issuing.Authorization
				// inspect the authorization request by merchant_category_code
				await handleAuthorizationRequest(data);
				break;
			case 'issuing_transaction.created':
				obj = event.data.object;
				data = obj as Stripe.Issuing.Transaction;
				// find the user the transaction belongs to
				// find the driver the transaction belongs to
				// find the card the transaction belongs to
				const transaction = await createTransaction(data)
				console.log('************************************************');
				console.log("NEW TRANSACTION:", transaction);
				console.log('************************************************');
				break;
			case 'issuing_card.updated':
				console.log('************************************************');
				obj = event.data.object;
				data = obj as Stripe.Issuing.Card;
				const card = await updateCard(data)
				console.log("Updated CARD:", card)
				console.log('************************************************');
				break;
			default:
				break;
		}
		// Return a response to acknowledge receipt of the event
		res.json({ received: true });
	}
);

router.post('/ephemeral-keys', jsonParser, async (req, res) => {
	const { card_id, nonce, stripe_account_id } = req.body;
	const ephemeralKey = await stripe.ephemeralKeys.create({
		//@ts-ignore
		nonce: nonce,
		issuing_card: card_id
	}, { apiVersion: "2020-03-02", stripeAccount: stripe_account_id});
	console.log(ephemeralKey);
	res.json({
		ephemeral_key_secret: ephemeralKey.secret,
	});
})

export default router;
