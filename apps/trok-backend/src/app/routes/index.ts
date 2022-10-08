import userRouter from './user';
import { t } from '../trpc';

export const appRouter = t.mergeRouters(userRouter);

export type AppRouter = typeof appRouter;