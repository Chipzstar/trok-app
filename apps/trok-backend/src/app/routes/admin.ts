import { t, adminProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { stripe } from '../utils/clients';

const adminRouter = t.router({
	removeRedisSignup: adminProcedure
		.input(
			z.object({
				email: z.string().email()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				console.log('INPUT', input.email);
				console.log(await ctx.redis.hgetall(input.email));
				return await ctx.redis.del(input.email);
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		}),
	deleteUser: adminProcedure
		.input(
			z.object({
				email: z.string().email()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				console.log('INPUT', input.email);
				// fetch the DB user
				const user = await ctx.prisma.user.findUniqueOrThrow({
					where: {
						email: input.email
					}
				});
				console.log('USER', user);
				// check if the user signed up with referral code, if so delete that refferal record
				const referral = await ctx.prisma.referral.delete({
					where: {
                        userId: user.id
                    }
				})
				console.log('-----------------------------------------------');
				console.log("REFERRAL", referral)
				// extract the stripe account_id from the user object
				// use stripe sdk to delete the user's CA
				const stripe_account_id = user.stripe.accountId;
				// delete the user's CA
				await stripe.accounts.del(stripe_account_id);
				console.log(`Stripe account with ID: ${stripe_account_id} has been deleted`);
				// delete the user from DB
				await ctx.prisma.user.delete({
					where: {
						email: input.email
					}
				});
				return user;
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		}),
	deleteDriver: adminProcedure
		.input(
			z.object({
				driver_id: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				console.log('INPUT', input.driver_id);
				// fetch the DB driver
				const driver = await ctx.prisma.driver.findUniqueOrThrow({
					where: {
						id: input.driver_id
					}
				});
				console.log('DRIVER', driver);
				// find the user associated with the driver
				// extract the stripe account_id from the user object
				// use stripe sdk to delete the user's CA
				const user = await ctx.prisma.user.findUniqueOrThrow({
					where: {
						id: driver.userId
					},
					select: {
						email: true,
						stripe: true
					}
				});
				console.log('-----------------------------------------------');
				console.log('USER', user);
				const stripe_account_id = user.stripe.accountId;
				// mark the cardholder in stripe as inactive
				await stripe.issuing.cardholders.update(
					driver.cardholder_id,
					{
						status: 'inactive'
					},
					{ stripeAccount: stripe_account_id }
				);
				console.log('************************************************');
				console.log(`Stripe Account cardholder with ID: ${driver.cardholder_id} has been deleted`);
				console.log('************************************************');
				// delete the driver from DB
				await ctx.prisma.driver.delete({
					where: {
						id: input.driver_id
					}
				});
				return driver;
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		})
});

export default adminRouter;