import { PrismaClient } from '@prisma/client';
import * as trpc from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';

export const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => {
	const prisma = new PrismaClient();
	return {
		prisma
	};
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
export const t = trpc.initTRPC.context<Context>().create();