import { t } from '../../trpc';
import { z } from 'zod';
import { stripe } from '../../utils/clients';
import { TRPCError } from '@trpc/server';

export const limitsSchema = z.object({
	amount: z.number(),
	categories: z.array(z.string()).optional(),
	interval: z.union([
		z.literal('per_authorization'),
		z.literal('daily'),
		z.literal('weekly'),
		z.literal('monthly'),
		z.literal('yearly'),
		z.literal('all_time')
	])
});

const driverRouter = t.router({
	createDriver: t.procedure
		.input(
			z.object({
				accountId: z.string(),
				firstname: z.string(),
				lastname: z.string(),
				email: z.string(),
				phone: z.string(),
				status: z.string(),
				spending_limits: z.array(limitsSchema),
				address: z.object({
					line1: z.string(),
					line2: z.string().optional(),
					city: z.string(),
					postcode: z.string(),
					region: z.string(),
					country: z.string().default("GB")
				})
			})
		)
		.mutation(async ({ ctx, input }) => {
			console.log(input);
			try {
				const cardholder = await stripe.issuing.cardholders.create({
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
						spending_limits: [
							{
								amount: input.spending_limits[0].amount,
								interval: input.spending_limits[0].interval
							}
						]
					}
				}, { stripeAccount: input.accountId });
				console.log("CARDHOLDER: ", cardholder)
				console.log('-----------------------------------------------');
				const customer = await stripe.customers.create({
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
					},
				}, { stripeAccount: input.accountId })
				console.log("CUSTOMER: ", customer)
				console.log('-----------------------------------------------');
				const payload = { ...input, cardholder_id: cardholder.id, customer_id: customer.id };
				return await ctx.prisma.driver.create({
					data: payload
				});
			} catch (err) {
				console.error(err)
				throw new TRPCError({code: 'BAD_REQUEST', message: ""})
			}
		})
});

export default driverRouter;
