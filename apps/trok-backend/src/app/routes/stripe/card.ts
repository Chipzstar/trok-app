import { t } from '../../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { stripe } from '../../utils/clients';

const spending_limits = z.object({
	amount: z.number(),
	interval: z.union([
		z.literal('per_authorization'),
		z.literal('daily'),
		z.literal('weekly'),
		z.literal('monthly'),
		z.literal('yearly'),
		z.literal('all_time')
	])
});

const cardRouter = t.router({
	getCards: t.procedure
		.input(
			z.object({
				userId: z.string()
			})
		)
		.query(async ({ input, ctx }) => {
			try {
				console.log(input);
				const cards = await ctx.prisma.card.findMany({
					where: {
						userId: input.userId
					}
				});
				console.log(cards);
				return cards;
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		}),
	createCard: t.procedure
		.input(
			z.object({
				user_id: z.string(),
				driver_id: z.string(),
				cardholder_id: z.string(),
				card_name: z.string().optional(),
				currency: z.string().default('gbp'),
				card_type: z.union([z.literal('physical'), z.literal('virtual')]),
				spending_limits: z.array(spending_limits)
			})
		)
		.mutation(async ({ ctx, input }) => {
			// use your ORM of choice
			try {
				const user = await ctx.prisma.user.findUnique({
					where: {
						id: input.user_id
					}
				});
				console.log(user);
				console.log('-----------------------------------------------');
				if (user) {
					let card = await stripe.issuing.cards.create(
						{
							['type']: input.card_type,
							cardholder: input.cardholder_id,
							status: 'inactive',
							currency: input.currency,
							spending_controls: {
								spending_limits: input.spending_limits
							},
							shipping: {
								name: user.business.legal_name,
								phone_number: user.phone,
								service: user.card_configuration.shipping_speed,
								address: {
									line1: user.shipping_address.line1,
									line2: user.shipping_address.line2 || undefined,
									city: user.shipping_address.city,
									postal_code: user.shipping_address.postcode,
									state: user.shipping_address.region,
									country: user.shipping_address.country
								}
							}
						},
						{ stripeAccount: user.stripe.accountId }
					);
					card = await stripe.issuing.cards.retrieve(
						card.id,
						{ expand: ['number', 'cvc'] },
						{ stripeAccount: user.stripe.accountId }
					);
					console.log("CARD", card)
					console.log('-----------------------------------------------');
					const driver = await ctx.prisma.driver.findUnique({
						where: {
							id: input.driver_id
						}
					});
					// attach card payment method to customer
					if (driver) {
						let paymentMethod = await stripe.paymentMethods.create(
							{
								['type']: 'card',
								card: {
									number: card.number ?? '',
									exp_month: card.exp_month,
									exp_year: card.exp_year,
									cvc: card.cvc
								}
							},
							{ stripeAccount: user.stripe.accountId }
						);
						paymentMethod = await stripe.paymentMethods.attach(paymentMethod.id, {
							customer: driver.customer_id
						}, { stripeAccount: user.stripe.accountId });
						console.log(paymentMethod);
						console.log('-----------------------------------------------');
						return await ctx.prisma.card.create({
							data: {
								userId: input.user_id,
								card_id: card.id,
								...(input?.card_name && { card_name: input.card_name }),
								cardholder_id: input.cardholder_id,
								driverId: input.driver_id,
								cardholder_name: `${driver.firstname} ${driver.lastname}`,
								currency: input.currency,
								card_type: input.card_type,
								brand: 'visa',
								last4: card.last4,
								exp_month: card.exp_month,
								exp_year: card.exp_year,
								cvc: card.cvc,
								spending_limits: input.spending_limits,
								status: 'inactive'
							}
						});
					} else {
						throw new TRPCError({ code: 'BAD_REQUEST', message: `No Driver found with ID ${input.driver_id}` });
					}
				} else {
					// @ts-ignore
					throw new TRPCError({ code: 'BAD_REQUEST', message: 'User could not be found!' });
				}
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		})
});

export default cardRouter;
