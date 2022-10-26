import { t } from '../trpc';
import driverRouter from './stripe/driver';
import cardRouter from './stripe/card';
import transactionsRouter from './stripe/transaction';

export const appRouter = t.mergeRouters(driverRouter, cardRouter, transactionsRouter);

export type AppRouter = typeof appRouter;