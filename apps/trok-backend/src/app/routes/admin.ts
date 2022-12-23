import { t, adminProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { stripe } from '../utils/clients';

export const adminRouter = t.router({
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
				console.log("USER", user);
				// extract the stripe account_id from the user object
				// use stripe sdk to delete the user's CA
				const stripe_account_id = user.stripe.accountId;
                // delete the user's CA
                await stripe.accounts.del(stripe_account_id)
				console.log(`Stripe account with ID: ${stripe_account_id} has been deleted`);
				// delete the user from DB
				await ctx.prisma.user.delete({
					where: {
                        email: input.email
                    }
				})
				return user;
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		})
});
