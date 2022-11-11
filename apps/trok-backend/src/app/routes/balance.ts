import { t } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { stripe } from '../utils/clients';

const balanceRouter = t.router({
	getIssuingBalance: t.procedure
		.input(
			z.object({
				userId: z.string(),
				stripeId: z.string()
			})
		)
		.query(async ({ input, ctx }) => {
			try {
				const balance = await stripe.balance.retrieve(
					{ expand: ['issuing'] },
					{ stripeAccount: input.stripeId }
				);
				if (!balance?.issuing?.available?.length || isNaN(balance?.issuing?.available[0]?.amount)) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: `No balance found for Stripe Account: ${input.stripeId}`
					});
				} else {
					// update current balance for the user in DB
					await ctx.prisma.user.update({
						where: {
							id: input.userId
						},
						data: {
							stripe: {
								update: {
									issuing_account: {
										update: {
											current_balance: balance.issuing.available[0].amount
										}
									}
								}
							}
						}
					});
					console.log('-----------------------------------------------');
					return balance.issuing.available[0];
				}
			} catch (err) {
				console.error(err);
				//@ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		})
});

export default balanceRouter;
