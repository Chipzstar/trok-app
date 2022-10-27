import { t } from '../trpc';
import driverRouter from './stripe/driver';
import cardRouter from './stripe/card';
import transactionsRouter from './stripe/transaction';
import bankAccountRouter from './stripe/bank-account';

export const appRouter = t.mergeRouters(driverRouter, cardRouter, transactionsRouter, bankAccountRouter);

export type AppRouter = typeof appRouter;