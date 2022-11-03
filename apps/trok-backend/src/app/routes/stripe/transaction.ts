import { t } from '../../trpc';
import { z } from 'zod';
import { stripe } from '../../utils/clients';
import { TRPCError } from '@trpc/server';

const transactionsRouter = t.router({
	getTransactions: t.procedure
		.input(
			z.object({
				userId: z.string()
			})
		)
		.query(async ({ input, ctx }) => {
			try {
				return await ctx.prisma.transaction.findMany({
					where: {
						userId: input.userId
					},
					orderBy: {
						created_at: 'desc'
					}
				});
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		}),
	getCardTransactions: t.procedure
		.input(
			z.object({
				card_id: z.string()
			})
		)
		.query(async ({ input, ctx }) => {
			try {
				const card = await ctx.prisma.card.findUniqueOrThrow({
					where: {
						card_id: input.card_id
					}
				})
				return await ctx.prisma.transaction.findMany({
					where: {
						cardId: card.id
					}
				});
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		}),
	createTestPayment: t.procedure
		.input(
			z.object({
				card_id: z.string(),
				stripeId: z.string(),
				amount: z.number()
			})
		)
		.mutation(async ({ input, ctx }) => {
			// obtain the default payment_method from customer
			try {
				// find the driver's customer_id using the card_id
				const card = await ctx.prisma.card.findFirstOrThrow({
					where: {
						card_id: input.card_id
					},
					select: {
						driver: {
							select: {
								customer_id: true
							}
						}
					}
				});
				console.log(card);
				console.log('-----------------------------------------------');
				// retrieve customer's payment Method
				const paymentMethods = await stripe.customers.listPaymentMethods(
					card.driver.customer_id,
					{ type: 'card' },
					{ stripeAccount: input.stripeId }
				);
				console.log('-----------------------------------------------');
				console.log(paymentMethods);
				// create uncaptured payment intent
				if (paymentMethods.data) {
					let paymentIntent = await stripe.paymentIntents.create(
						{
							amount: input.amount * 100, // convert to smallest currency unit
							currency: 'gbp',
							capture_method: 'manual',
							confirm: true,
							customer: card.driver.customer_id,
							description: '',
							// on_behalf_of:"",
							payment_method: paymentMethods.data[0].id,
							setup_future_usage: 'off_session'
						},
						{ stripeAccount: input.stripeId }
					);
					// capture the payment intent
					paymentIntent = await stripe.paymentIntents.capture(paymentIntent.id, {
						stripeAccount: input.stripeId
					});
					console.log(paymentIntent);
					return paymentIntent;
				}
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		})
});

export default transactionsRouter;
