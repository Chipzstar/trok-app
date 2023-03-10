import * as trpc from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import prisma from './db';
import redisClient from './redis';
import { TRPCError } from '@trpc/server';

export const createContext = async ({ req, res }: trpcExpress.CreateExpressContextOptions) => {
	console.log(req.headers?.authorization)
	async function getUserFromHeader(id: string | undefined) {
		if (id) {
			const user = prisma.user.findFirst({
				where: {
					id
				}
			})
			console.log("Authed", !!user)
			return user;
		}
		return null;
	}
	const user = await getUserFromHeader(req.headers?.authorization);
	return {
		user,
		prisma,
		redis: redisClient
	};
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
export const t = trpc.initTRPC.context<Context>().create();

const isAdmin = t.middleware(({ next, ctx }) => {
	if (!ctx.user?.admin) {
		throw new TRPCError({ code: 'UNAUTHORIZED' });
	}
	return next({
		ctx: {
			user: ctx.user,
			prisma,
            redis: redisClient
		}
	});
});

const isAuthed = t.middleware(({ next, ctx }) => {
	if (!ctx.user) {
		throw new TRPCError({ code: 'UNAUTHORIZED' });
	}
	return next({
		ctx: {
			user: ctx.user,
		},
	});
});
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(isAuthed);
// you can reuse this for any procedure
export const adminProcedure = t.procedure.use(isAdmin);