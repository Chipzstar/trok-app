import * as trpc from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import prisma from './db';
import redisClient from './redis';

export const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => {
	return {
		user: null,
		prisma,
		redis: redisClient
	};
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
export const t = trpc.initTRPC.context<Context>().create();