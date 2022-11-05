import * as express from 'express';
import { stripe } from '../../utils/clients';
import * as bodyParser from 'body-parser';
import { handleAuthorizationRequest } from '../../helpers/stripe';
import Stripe from 'stripe';
import 'express-async-errors';
import { NextFunction } from 'express';
import prisma from '../../db';
import redisClient from '../../redis';
import * as dayjs from 'dayjs';
import { STATEMENT_REDIS_SORTED_SET_ID } from '../../utils/constants';

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
			case 'issuing_transaction.created':
				const obj = event.data.object;
				const t = obj as Stripe.Issuing.Transaction;
				// find the user the transaction belongs to
				// find the driver the transaction belongs to
				// find the card the transaction belongs to
				const card = await prisma.card.findUniqueOrThrow({
					where: {
						card_id: <string>t.card
					},
					select: {
						id: true,
						last4: true,
						cardholder_id: true,
						driver: {
							select: {
								id: true,
								full_name: true
							}
						},
						user: {
							select: {
								id: true
							}
						}
					}
				});
				// check to see if user id is recorded in the redis statement scheduler
				const zrank = await redisClient.zrank(STATEMENT_REDIS_SORTED_SET_ID, card.user.id)
				if (zrank === null) {
					// add member to sorted set for scheduling statement generation
					redisClient.zadd(
						STATEMENT_REDIS_SORTED_SET_ID,
						dayjs().endOf('week').unix(),
						card.user.id
					);
					redisClient.hmset(card.user.id, "period_start", dayjs().unix(), "period_end", dayjs().endOf('week').unix())
				}
				const transaction = await prisma.transaction.create({
					data: {
						cardId: card.id,
						cardholder_id: card.cardholder_id,
						cardholder_name: card.driver.full_name,
						last4: card.last4,
						userId: card.user.id,
						driverId: card.driver.id,
						transaction_type: t.type,
						transaction_amount: Math.abs(t.amount),
						merchant_data: {
							name: t.merchant_data.name ?? '',
							category: t.merchant_data.category,
							category_code: t.merchant_data.category_code,
							network_id: t.merchant_data.network_id,
							city: t.merchant_data.city ?? '',
							region: t.merchant_data.state ?? '',
							postcode: t.merchant_data.postal_code ?? '',
							country: t.merchant_data.country ?? ''
						},
						merchant_amount: Math.abs(t.merchant_amount),
						authorization_id: <string>t.authorization,
						...(t?.purchase_details?.fuel && {
							purchase_details: {
								set: {
									volume: Number(t.purchase_details.fuel.volume_decimal),
									unit_cost_decimal: Number(t.purchase_details.fuel.unit_cost_decimal),
									fuel_type: t.purchase_details.fuel?.type,
									unit_type: t.purchase_details.fuel?.unit
								}
							}
						}),
						transaction_id: t.id,
						currency: t.currency
					}
				});
				console.log('************************************************');
				console.log(transaction);
				console.log('************************************************');
				break;
			default:
				break;
		}
		// Return a response to acknowledge receipt of the event
		res.json({ received: true });
	}
);

export default router;
