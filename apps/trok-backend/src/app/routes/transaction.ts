import { t } from '../trpc';
import { z } from 'zod';
import { stripe } from '../utils/clients';
import { TRPCError } from '@trpc/server';
import { TRANSACTION_STATUS } from '@trok-app/shared-utils';

const transactionsRouter = t.router({
	countTransactionAmount: t.procedure.query(async ({ input, ctx }) => {
		try {
		    const transactions = await ctx.prisma.transaction.findMany({
				where: {
					status: TRANSACTION_STATUS.APPROVED,
				},
				select: {
					id: true,
                    transaction_amount: true,
				}
			})
			const total_amount = transactions.reduce((prev, curr) => prev + curr.transaction_amount, 0)
			console.log(total_amount)
			return total_amount
		} catch (err) {
		    console.error(err)
			// @ts-ignore
			throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message })
		}
	}),
	getApprovedTransactions: t.procedure.query(async ({input, ctx}) => {
		try {
			return await ctx.prisma.transaction.findMany({
				where: {
					status: TRANSACTION_STATUS.APPROVED,
				}
			})
		} catch (err) {
		    console.error(err)
			// @ts-ignore
			throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message })
		}
	}),
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
		})
});

export default transactionsRouter;
