import { t } from '../trpc';
import driverRouter from './stripe/driver';
import cardRouter from './stripe/card';

export const appRouter = t.mergeRouters(driverRouter, cardRouter);

export type AppRouter = typeof appRouter;