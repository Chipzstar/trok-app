import { t } from '../trpc';
import { z } from 'zod';
import { stripe } from '../utils/clients';
import { TRPCError } from '@trpc/server';

const createDriverInput = z.object({
	userId: z.string(),
	stripeId: z.string(),
	firstname: z.string(),
	lastname: z.string(),
	email: z.string(),
	phone: z.string(),
	spending_limit: z
		.object({
			amount: z.number(),
			interval: z.union([
				z.literal('per_authorization'),
				z.literal('daily'),
				z.literal('weekly'),
				z.literal('monthly'),
				z.literal('yearly'),
				z.literal('all_time')
			])
		})
		.optional(),
	address: z.object({
		line1: z.string(),
		line2: z.nullable(z.string()).optional(),
		city: z.string(),
		postcode: z.string(),
		region: z.string(),
		country: z.string().default('GB')
	})
});

const updateDriverInput = createDriverInput.merge(
	z.object({
		id: z.string(),
		cardholder_id: z.string(),
		customer_id: z.string()
	})
);

const driverRouter = t.router({
	getDrivers: t.procedure
		.input(
			z.object({
				userId: z.string()
			})
		)
		.query(async ({ input, ctx }) => {
			try {
				return await ctx.prisma.driver.findMany({
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
	getSingleDriver: t.procedure.input(z.string()).query(async ({ input, ctx }) => {
		try {
		    return await ctx.prisma.driver.findUniqueOrThrow({
				where: {
                    id: input
                }
			})
		} catch (err) {
		    console.error(err)
			// @ts-ignore
			throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
		}
	}),
	createDriver: t.procedure.input(createDriverInput).mutation(async ({ ctx, input }) => {
		console.log(input);
		try {
			const user = await ctx.prisma.user.findUniqueOrThrow({
				where: {
					id: input.userId
				},
				select: {
					card_configuration: true
				}
			});
			const cardholder = await stripe.issuing.cardholders.create(
				{
					email: input.email,
					name: user.card_configuration.card_business_name,
					phone_number: input.phone,
					type: 'individual',
					status: 'active',
					individual: {
						first_name: input.firstname,
						last_name: input.lastname
					},
					billing: {
						address: {
							line1: input.address.line1,
							...(input.address.line2 && {line2: input.address.line2}),
							city: input.address.city,
							state: input.address.region,
							postal_code: input.address.postcode,
							country: input.address.country
						}
					},
					spending_controls: {
						// @ts-ignore
						spending_limits: [input.spending_limit]
					}
				},
				{ stripeAccount: input.stripeId }
			);
			const customer = await stripe.customers.create(
				{
					email: input.email,
					name: `${input.firstname} ${input.lastname}`,
					phone: input.phone,
					address: {
						line1: input.address.line1,
						...(input.address.line2 && {line2: input.address.line2}),
						city: input.address.city,
						state: input.address.region,
						postal_code: input.address.postcode,
						country: input.address.country
					}
				},
				{ stripeAccount: input.stripeId }
			);
			return await ctx.prisma.driver.create({
				data: {
					userId: input.userId,
					full_name: `${input.firstname} ${input.lastname}`,
					firstname: input.firstname,
					lastname: input.lastname,
					email: input.email,
					phone: input.phone,
					...(input?.spending_limit && {
						spending_limit: {
							amount: input.spending_limit.amount,
							interval: input.spending_limit.interval
						}
					}),
					address: {
						line1: input.address.line1,
						line2: input.address.line2,
						city: input.address.city,
						postcode: input.address.postcode,
						region: input.address.region,
						country: input.address.country
					},
					cardholder_id: cardholder.id,
					customer_id: customer.id,
					status: 'active'
				}
			});
		} catch (err) {
			console.error(err);
			// @ts-ignore
			throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
		}
	}),
	updateDriver: t.procedure.input(updateDriverInput).mutation(async ({ input, ctx }) => {
		try {
			const cardholder = await stripe.issuing.cardholders.update(
				input.cardholder_id,
				{
					email: input.email,
					individual: {
						first_name: input.firstname,
						last_name: input.lastname
					},
					phone_number: input.phone,
					status: 'active',
					billing: {
						address: {
							line1: input.address.line1,
							line2: input.address?.line2 ?? undefined,
							city: input.address.city,
							state: input.address.region,
							postal_code: input.address.postcode,
							country: input.address.country
						}
					},
					spending_controls: {
						// @ts-ignore
						spending_limits: [input.spending_limit]
					}
				},
				{ stripeAccount: input.stripeId }
			);
			console.log('-----------------------------------------------');
			console.log(cardholder);
			console.log('-----------------------------------------------');
			const customer = await stripe.customers.update(
				input.customer_id,
				{
					email: input.email,
					name: `${input.firstname} ${input.lastname}`,
					phone: input.phone,
					address: {
						line1: input.address.line1,
						...(input.address.line2 && { line2: input.address.line2 }),
						city: input.address.city,
						state: input.address.region,
						postal_code: input.address.postcode,
						country: input.address.country
					}
				},
				{ stripeAccount: input.stripeId }
			);
			console.log('-----------------------------------------------');
			console.log(customer);
			console.log('-----------------------------------------------');
			return await ctx.prisma.driver.update({
				where: {
					id: input.id
				},
				data: {
					full_name: `${input.firstname} ${input.lastname}`,
					firstname: input.firstname,
					lastname: input.lastname,
					email: input.email,
					phone: input.phone,
					...(input?.spending_limit && {
						spending_limit: {
							amount: input.spending_limit.amount,
							interval: input.spending_limit.interval
						}
					}),
					address: {
						line1: input.address.line1,
						line2: input.address?.line2,
						city: input.address.city,
						postcode: input.address.postcode,
						region: input.address.region,
						country: input.address.country
					},
					status: 'active'
				}
			});
		} catch (err) {
			console.error(err);
			// @ts-ignore
			throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
		}
	}),
	deleteDriver: t.procedure
		.input(
			z.object({
				id: z.string(),
				cardholder_id: z.string(),
				customer_id: z.string(),
				userId: z.string().optional(),
				stripeId: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				const card = await ctx.prisma.card.findFirstOrThrow({
					where: {
						driverId: input.id
					}
				});
				// disable the cardholder
				await stripe.issuing.cardholders.update(
					input.cardholder_id,
					{
						status: 'inactive'
					},
					{ stripeAccount: input.stripeId }
				);
				// cancel any card owned by the cardholder
				await stripe.issuing.cards.update(card.card_id, {
					status: 'canceled'
				}, { stripeAccount: input.stripeId });

				return await ctx.prisma.driver.update({
					where: {
						id: input.id
					},
					data: {
						status: 'inactive'
					}
				});
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		})
});

export default driverRouter;
