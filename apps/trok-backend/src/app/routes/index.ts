import { t } from '../trpc';
import driverRouter from './driver';
import cardRouter from './card';
import transactionsRouter from './transaction';
import bankAccountRouter from './bank-account';
import accountRouter from './account';
import paymentRouter from './payment';
import balanceRouter from './balance';
import statementRouter from './statement';
import { authRouter } from './auth';
import { TRPCError } from '@trpc/server';
import { adminRouter } from './admin';

export const appRouter = t.mergeRouters(
	adminRouter,
	authRouter,
	accountRouter,
	driverRouter,
	cardRouter,
	transactionsRouter,
	bankAccountRouter,
	paymentRouter,
	balanceRouter,
	statementRouter
);

export type AppRouter = typeof appRouter;