import { t } from '../trpc';
import driverRouter from './stripe/driver';
import cardRouter from './stripe/card';
import transactionsRouter from './stripe/transaction';
import bankAccountRouter from './stripe/bank-account';
import accountRouter from './stripe/account';
import paymentRouter from './stripe/payments';
import balanceRouter from './stripe/balance';

export const appRouter = t.mergeRouters(accountRouter, driverRouter, cardRouter, transactionsRouter, bankAccountRouter, paymentRouter, balanceRouter);

export type AppRouter = typeof appRouter;