import { t } from '../trpc';
import { authRouter } from './auth';
import adminRouter from './admin';
import driverRouter from './driver';
import cardRouter from './card';
import transactionsRouter from './transaction';
import bankAccountRouter from './bank-account';
import accountRouter from './account';
import paymentRouter from './payment';
import balanceRouter from './balance';
import statementRouter from './statement';
import invoiceRouter from './invoice';

export const appRouter = t.router({
	admin: adminRouter,
	auth: authRouter,
	user: accountRouter,
	driver: driverRouter,
	card: cardRouter,
	transaction: transactionsRouter,
	bank: bankAccountRouter,
	payment: paymentRouter,
	balance: balanceRouter,
	statement: statementRouter,
	invoice: invoiceRouter
});

export type AppRouter = typeof appRouter;