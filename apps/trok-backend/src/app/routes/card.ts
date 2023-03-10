import { t } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { stripe } from '../utils/clients';
import { CARD_SHIPPING_STATUS, CARD_STATUS, DEFAULT_ALLOWED_MERCHANTS } from '@trok-app/shared-utils';
import { STRIPE_TEST_MODE } from '../utils/constants';

const cardRouter = t.router({
	countCards: t.procedure.query(async ({ input, ctx }) => {
		try {
			return await ctx.prisma.card.findMany({
				select: {
					id: true,
					created_at: true
				}
			});
		} catch (err) {
			console.error(err);
			// @ts-ignore
			throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
		}
	}),
	getCards: t.procedure
		.input(
			z.object({
				userId: z.string()
			})
		)
		.query(async ({ input, ctx }) => {
			try {
				return await ctx.prisma.card.findMany({
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
	getSingleCard: t.procedure.input(z.string()).query(async ({ input, ctx }) => {
		try {
			return await ctx.prisma.card.findUnique({
				where: {
					id: input
				}
			});
		} catch (err) {
			console.error(err);
			// @ts-ignore
			throw new TRPCError({ code: 'NOT_FOUND', message: err?.message });
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
				spending_limits: z.object({
					amount: z.number(),
					interval: z.enum(['per_authorization', 'daily', 'weekly', 'monthly', 'yearly', 'all_time'])
				})
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
				if (user) {
					let card = await stripe.issuing.cards.create(
						{
							['type']: 'physical',
							cardholder: input.cardholder_id,
							status: CARD_STATUS.INACTIVE,
							currency: input.currency,
							spending_controls: {
								spending_limits: [
									{
										amount: input.spending_limits.amount,
										interval: input.spending_limits.interval
									}
								]
							},
							shipping: {
								name: user.business.legal_name,
								phone_number: user.phone,
								service: 'standard',
								address: {
									line1: user.shipping_address.line1,
									line2: user.shipping_address.line2 || undefined,
									city: user.shipping_address.city,
									postal_code: user.shipping_address.postcode,
									state: user.shipping_address.region,
									country: 'GB'
								}
							}
						},
						{ stripeAccount: user.stripe.accountId }
					);
					if (STRIPE_TEST_MODE) {
						card = await stripe.issuing.cards.retrieve(
							card.id,
							{ expand: ['number', 'cvc'] },
							{ stripeAccount: user.stripe.accountId }
						);
					}
					console.log('CARD', card);
					console.log('-----------------------------------------------');
					const driver = await ctx.prisma.driver.findUnique({
						where: {
							id: input.driver_id
						}
					});
					if (driver) {
						if (STRIPE_TEST_MODE) {
							// attach card payment method to customer
							const paymentMethod = await stripe.paymentMethods.create(
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
							await stripe.paymentMethods.attach(
								paymentMethod.id,
								{
									customer: driver.customer_id
								},
								{ stripeAccount: user.stripe.accountId }
							);
						}
						return await ctx.prisma.card.create({
							data: {
								userId: input.user_id,
								card_id: card.id,
								...(input?.card_name && { card_name: input.card_name }),
								allowed_merchant_categories: DEFAULT_ALLOWED_MERCHANTS,
								cardholder_id: input.cardholder_id,
								driverId: input.driver_id,
								cardholder_name: `${driver.firstname} ${driver.lastname}`,
								currency: input.currency,
								card_type: 'physical',
								brand: 'visa',
								last4: card.last4,
								exp_month: card.exp_month,
								exp_year: card.exp_year,
								spending_limits: input?.spending_limits
									? [
											{
												amount: input.spending_limits.amount,
												interval: input.spending_limits.interval
											}
									  ]
									: [],
								status: CARD_STATUS.INACTIVE,
								shipping_status: card?.shipping?.status ?? CARD_SHIPPING_STATUS.PENDING,
								shipping_eta: Number(card?.shipping?.eta)
							}
						});
					} else {
						throw new TRPCError({
							code: 'BAD_REQUEST',
							message: `No Driver found with ID ${input.driver_id}`
						});
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
		}),
	shipCard: t.procedure
		.input(
			z.object({
				card_id: z.string(),
				stripeId: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				const stripe_card = await stripe.testHelpers.issuing.cards.shipCard(input.card_id, {
					stripeAccount: input.stripeId
				});
				if (stripe_card) {
					console.log(stripe_card);
					return await ctx.prisma.card.update({
						where: {
							card_id: input.card_id
						},
						data: {
							shipping_status: CARD_SHIPPING_STATUS.SHIPPED
						}
					});
				} else {
					throw new TRPCError({ code: 'BAD_REQUEST', message: 'Card could not be found!' });
				}
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		}),
	deliverCard: t.procedure
		.input(
			z.object({
				card_id: z.string(),
				stripeId: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				const stripe_card = await stripe.testHelpers.issuing.cards.deliverCard(input.card_id, {
					stripeAccount: input.stripeId
				});
				console.log(stripe_card);
				return await ctx.prisma.card.update({
					where: {
						card_id: input.card_id
					},
					data: {
						shipping_status: CARD_SHIPPING_STATUS.DELIVERED
					}
				});
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		}),
	toggleCardStatus: t.procedure
		.input(
			z.object({
				card_id: z.string(),
				stripeId: z.string(),
				status: z.enum(['active', 'inactive', 'canceled'])
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				const stripe_card = await stripe.issuing.cards.update(
					input.card_id,
					{
						status: input.status
					},
					{ stripeAccount: input.stripeId }
				);
				console.log(stripe_card);
				return await ctx.prisma.card.update({
					where: {
						card_id: input.card_id
					},
					data: {
						status: input.status
					}
				});
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		}),
	updateSpendingLimits: t.procedure
		.input(
			z.object({
				userId: z.string(),
				stripeId: z.string(),
				card_id: z.string(),
				spending_limits: z
					.object({
						amount: z.number(),
						interval: z.enum(['per_authorization', 'daily', 'weekly', 'monthly', 'yearly', 'all_time'])
					})
					.array()
					.nonempty()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				const card = await stripe.issuing.cards.update(
					input.card_id,
					{
						spending_controls: {
							// @ts-ignore
							spending_limits: input.spending_limits
						}
					},
					{ stripeAccount: input.stripeId }
				);
				console.log(card);
				return await ctx.prisma.card.update({
					where: {
						card_id: input.card_id
					},
					data: {
						// @ts-ignore
						spending_limits: input.spending_limits
					}
				});
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		}),
	updateAllowedCategories: t.procedure
		.input(
			z.object({
				userId: z.string(),
				stripeId: z.string(),
				card_id: z.string(),
				allowed_categories: z
					.object({
						name: z.enum(['fuel', 'truck_stops', 'repair', 'hotels', 'tolls']),
						codes: z.string().array().nonempty(),
						enabled: z.boolean()
					})
					.array()
					.nonempty()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				const allowed_categories = input.allowed_categories.map(item => item.codes).flat();
				console.log('-----------------------------------------------');
				console.log(allowed_categories);
				/*const card = await stripe.issuing.cards.update(
				input.card_id,
				{
					spending_controls: {
						allowed_categories: 
					}
				},
				{ stripeAccount: input.stripeId }
			);*/
				return await ctx.prisma.card.update({
					where: {
						card_id: input.card_id
					},
					data: {
						// @ts-ignore
						allowed_merchant_categories: input.allowed_categories
					}
				});
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		})
});

export default cardRouter;
