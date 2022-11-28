import express from 'express';
import { plaid } from '../utils/clients';
import { prettyPrintResponse } from '../utils/helpers';
import { handlePaymentInitiation } from '../helpers/plaid';
import redisClient from '../redis';

let PUBLIC_TOKEN;
let ACCESS_TOKEN;
let ITEM_ID;
const router = express.Router();

router.post('/webhook', async (req, res, next) => {
	try {
		const event = req.body;
		// switch case by webhook event type
		switch(event.webhook_type) {
			case 'PAYMENT_INITIATION':
                await handlePaymentInitiation(event)
				break;
			default:
				break;
		}
		res.status(200).json({ received: true, ...req.body });
	} catch (err) {
		console.error(err);
		res.json({ received: true });
	}
});

// Exchange token flow - exchange a Link public_token for
// an API access_token
// https://plaid.com/docs/#exchange-token-flow
router.post('/set_access_token', async (req, res, next) => {
	try {
		PUBLIC_TOKEN = req.body.public_token;
		const tokenResponse = await plaid.itemPublicTokenExchange({
			public_token: PUBLIC_TOKEN
		});
		prettyPrintResponse(tokenResponse);
		ACCESS_TOKEN = tokenResponse.data.access_token;
		ITEM_ID = tokenResponse.data.item_id;
		await redisClient.hmset(req.body.email, tokenResponse.data)
		res.status(200).json({
			// the 'access_token' is a private token, DO NOT pass this token to the frontend in your production environment
			access_token: ACCESS_TOKEN,
			item_id: ITEM_ID,
			error: null
		});
	} catch (err) {
		// @ts-ignore
		if (err?.response.data) {
			// @ts-ignore
			console.error(err.response.data);
			// @ts-ignore
			next(err.response.data);
		}
		next(err);
	}
});

export default router;
