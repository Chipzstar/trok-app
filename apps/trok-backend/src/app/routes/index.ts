import userRouter from './user';
import { t } from '../trpc';
import driverRouter from './stripe/driver';

export const appRouter = t.mergeRouters(userRouter, driverRouter);

export type AppRouter = typeof appRouter;