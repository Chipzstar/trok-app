import { t } from '../trpc';
import driverRouter from './stripe/driver';
import cardRouter from './stripe/card';
import transactionsRouter from './stripe/transaction';
import bankAccountRouter from './stripe/bank-account';
import accountRouter from './stripe/account';
import paymentRouter from './stripe/payments';

export const appRouter = t.mergeRouters(accountRouter, driverRouter, cardRouter, transactionsRouter, bankAccountRouter, paymentRouter);

export type AppRouter = typeof appRouter;