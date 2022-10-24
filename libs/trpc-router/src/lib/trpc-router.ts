import * as trpc from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { prisma } from './prisma';

export const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => {
	return {
		user: null,
		prisma
	};
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
export const t = trpc.initTRPC.context<Context>().create();