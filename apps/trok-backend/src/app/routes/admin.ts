import { t, adminProcedure } from '../trpc';
import { z } from 'zod';

export const adminRouter = t.router({
	removeRedisSignup: adminProcedure.input(z.object({
		email: z.string().email()
	})).mutation(async ({ input, ctx }) => {
		try {
			console.log("INPUT", input.email)
			console.log(await ctx.redis.hgetall(input.email))
		    return await ctx.redis.del(input.email)
		} catch (err) {
		    console.error(err)
			// @ts-ignore
			throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message })
		}
	})
})