import { t } from '../trpc';
import driverRouter from './stripe/driver';

export const appRouter = t.mergeRouters(driverRouter);

export type AppRouter = typeof appRouter;