import { t } from '../../trpc';
import { z } from 'zod';
import { stripe } from '../../utils/clients';
import { TRPCError } from '@trpc/server';

const driverRouter = t.router({
	getDrivers: t.procedure
		.input(
			z.object({
				userId: z.string()
			})
		)
		.query(async ({ input, ctx }) => {
			try {
				console.log(input);
				return await ctx.prisma.driver.findMany({
					where: {
						userId: input.userId
					}
				});
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		}),
	createDriver: t.procedure
		.input(
			z.object({
				userId: z.string(),
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
					line2: z.string().optional(),
					city: z.string(),
					postcode: z.string(),
					region: z.string(),
					country: z.string().default('GB')
				})
			})
		)
		.mutation(async ({ ctx, input }) => {
			console.log(input);
			try {
				const user = await ctx.prisma.user.findUnique({
					where: {
						id: input.userId
					}
				});
				console.log(user);
				console.log('-----------------------------------------------');
				const cardholder = await stripe.issuing.cardholders.create(
					{
						email: input.email,
						name: `${input.firstname} ${input.lastname}`,
						phone_number: input.phone,
						type: 'individual',
						status: 'active',
						billing: {
							address: {
								line1: input.address.line1,
								...(input.address.line2 && { line2: input.address.line2 }),
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
					{ stripeAccount: user?.stripe.accountId }
				);
				const customer = await stripe.customers.create(
					{
						email: input.email,
						name: `${input.firstname} ${input.lastname}`,
						phone: input.phone,
						address: {
							line1: input.address.line1,
							line2: input.address.line2,
							city: input.address.city,
							state: input.address.region,
							postal_code: input.address.postcode,
							country: input.address.country
						}
					},
					{ stripeAccount: user?.stripe.accountId }
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
		})
});

export default driverRouter;
