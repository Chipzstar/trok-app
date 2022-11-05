import { t } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

const statementRouter = t.router({
	getStatements: t.procedure
		.input(
			z.object({
				userId: z.string()
			})
		)
		.query(async ({ input, ctx }) => {
			try {
				return await ctx.prisma.statement.findMany({
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
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message, cause });
			}
		})
});

export default statementRouter;