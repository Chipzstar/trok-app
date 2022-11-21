import { t } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { fetchFundingDetails } from '../helpers/stripe';
import { plaid } from '../utils/clients';
import { prettyPrintResponse } from '../utils/helpers';
import { PaymentAmountCurrency, PaymentInitiationPaymentStatus, PaymentScheduleInterval } from 'plaid';
import { convertPlaidStatus, generateLinkToken } from '../helpers/plaid';
import { IS_DEVELOPMENT, PLAID_WEBHOOK_URL } from '../utils/constants';
import { decrypt, PAYMENT_STATUS } from '@trok-app/shared-utils';
import dayjs from 'dayjs';
import Prisma from '@prisma/client';

const topUpSchema = z.object({
	user_id: z.string(),
	stripe_account_id: z.string(),
	amount: z.number(),
	reference: z.string(),
	is_scheduled: z.boolean(),
	schedule: z
		.object({
			interval: z.enum(['WEEKLY', 'MONTHLY']),
			interval_execution_day: z.number(),
			start_date: z.string(),
			end_date: z.string().optional()
		})
		.optional()
});

const accountSchema = z.object({
	user_id: z.string(),
	stripe_account_id: z.string(),
	amount: z.number(),
	reference: z.string(),
	account_holder_name: z.string(),
	account_number: z.string(),
	sort_code: z.string(),
	is_scheduled: z.boolean(),
	schedule: z
		.object({
			interval: z.enum(['WEEKLY', 'MONTHLY']),
			interval_execution_day: z.number(),
			start_date: z.string(),
			end_date: z.string().optional()
		})
		.optional()
});

/*const directDebitSchema = z.object({
	user_id: z.string(),
	stripe_account_id: z.string(),
	amount: z.number(),
	reference: z.string(),
	account_holder_name: z.string().optional(),
	account_number: z.string().optional(),
	sort_code: z.string().optional(),
	is_scheduled: z.boolean(),
	interval: z.enum(["WEEKLY","MONTHLY"]),
	interval_execution_day: z.number().nullable(),
	start_date: z.date(),
	end_date: z
		.date()
		.optional()
})*/

const paymentsRouter = t.router({
	getPayments: t.procedure
		.input(
			z.object({
				userId: z.string()
			})
		)
		.query(async ({ input, ctx }) => {
			try {
				return await ctx.prisma.payment.findMany({
					where: {
						userId: input.userId
					},
					orderBy: {
						created_at: 'desc'
					}
				});
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		}),
	topUpBalance: t.procedure.input(topUpSchema).mutation(async ({ input, ctx }) => {
		try {
			console.table(input);
			// fetch the default bank account
			const bankAccount = await ctx.prisma.bankAccount.findFirstOrThrow({
				where: {
					userId: input.user_id,
					is_default: true
				},
				select: {
					id: true,
					stripe_bank_id: true,
					account_number: true,
					institution_id: true,
					sort_code: true,
					user: {
						select: {
							phone: true,
							email: true
						}
					}
				}
			});
			console.log('-----------------------------------------------');
			console.log('DEFAULT BANK ACCOUNT:', bankAccount);
			console.log('-----------------------------------------------');
			// fetch the stripe funding account bank details
			const stripeFundingAccount = await fetchFundingDetails(input.stripe_account_id);
			console.log(stripeFundingAccount.bank_transfer.financial_addresses);
			console.log('-----------------------------------------------');
			// Create PLAID Recipient
			const createRecipientResponse = await plaid.paymentInitiationRecipientCreate({
				name: 'Stripe Payments UK Limited',
				bacs: {
					account: stripeFundingAccount['bank_transfer'].financial_addresses[0].sort_code.account_number,
					sort_code: stripeFundingAccount['bank_transfer'].financial_addresses[0].sort_code.sort_code
				},
				address: {
					street: ['Orrick Herrington & Sutcliff', '107 Cheapside'],
					city: 'London',
					postal_code: 'EC2V 6DN',
					country: 'GB'
				}
			});
			const recipient_id = createRecipientResponse.data.recipient_id;
			prettyPrintResponse(createRecipientResponse);
			const routing_number = bankAccount.sort_code.replace(/-/g, '');
			// Initiate the PLAID Payment intent
			let createPaymentResponse;
			if (input.is_scheduled && input?.schedule) {
				createPaymentResponse = await plaid.paymentInitiationPaymentCreate({
					recipient_id,
					reference: input.reference,
					options: {
						bacs: {
							account: decrypt(bankAccount.account_number, String(process.env.ENC_SECRET)),
							sort_code: routing_number
						}
					},
					schedule: {
						interval: <PaymentScheduleInterval>input.schedule.interval,
						interval_execution_day: Number(input.schedule.interval_execution_day),
						start_date: dayjs(input.schedule.start_date).format('YYYY-MM-DD'),
						...(input.schedule?.end_date && {
							end_date: dayjs(input.schedule?.end_date).format('YYYY-MM-DD')
						})
					},
					amount: {
						value: input.amount,
						currency: PaymentAmountCurrency.Gbp
					}
				});
			} else {
				createPaymentResponse = await plaid.paymentInitiationPaymentCreate({
					recipient_id,
					reference: input.reference,
					options: {
						bacs: {
							account: decrypt(bankAccount.account_number, String(process.env.ENC_SECRET)),
							sort_code: routing_number
						}
					},
					amount: {
						value: input.amount,
						currency: PaymentAmountCurrency.Gbp
					}
				});
			}
			prettyPrintResponse(createPaymentResponse);
			const payment_id = createPaymentResponse.data.payment_id;

			const result = await generateLinkToken(
				input.user_id,
				bankAccount.user.phone,
				IS_DEVELOPMENT ? 'https://1ac4-146-198-166-218.eu.ngrok.io/server/plaid/webhook' : PLAID_WEBHOOK_URL,
				payment_id,
				bankAccount.institution_id
			);
			// create payment in db
			if (input.is_scheduled && input?.schedule) {
				await ctx.prisma.payment.create({
					data: {
						userId: input.user_id,
						bankAccountId: bankAccount.id,
						plaid_payment_id: payment_id,
						plaid_link_token: result.link_token,
						plaid_recipient_id: recipient_id,
						recipient_name: 'Stripe Payments UK Limited',
						payment_type: 'bank_transfer',
						plaid_payment_status: PaymentInitiationPaymentStatus.InputNeeded,
						amount: input.amount * 100,
						recurring: true,
						schedule: {
							set: {
								interval: <Prisma.PaymentInterval>input.schedule.interval.toLowerCase(),
								interval_execution_day: input.schedule.interval_execution_day,
								start_date: dayjs(input.schedule.start_date).unix() ?? dayjs().unix()
							}
						},
						status: PAYMENT_STATUS.PENDING,
						reference: input.reference
					}
				});
			} else {
				await ctx.prisma.payment.create({
					data: {
						userId: input.user_id,
						bankAccountId: bankAccount.id,
						plaid_payment_id: payment_id,
						plaid_link_token: result.link_token,
						plaid_recipient_id: recipient_id,
						recipient_name: 'Stripe Payments UK Limited',
						payment_type: 'bank_transfer',
						plaid_payment_status: PaymentInitiationPaymentStatus.InputNeeded,
						amount: input.amount * 100,
						status: PAYMENT_STATUS.PENDING,
						reference: input.reference
					}
				});
			}
			return { ...result, payment_id };
		} catch (err) {
			// @ts-ignore
			console.log(err.response?.data ?? err.response);
			// @ts-ignore
			throw new TRPCError({ code: 'BAD_REQUEST', message: err?.response?.data?.message ?? err?.message });
		}
	}),
	payExternalAccount: t.procedure.input(accountSchema).mutation(async ({ input, ctx }) => {
		try {
			console.table(input);
			// fetch the default bank account
			const bankAccount = await ctx.prisma.bankAccount.findFirstOrThrow({
				where: {
					userId: input.user_id,
					is_default: true
				},
				select: {
					id: true,
					stripe_bank_id: true,
					account_number: true,
					sort_code: true,
					institution_id: true,
					user: {
						select: {
							phone: true,
							email: true
						}
					}
				}
			});
			console.log('-----------------------------------------------');
			console.log('DEFAULT BANK ACCOUNT:', bankAccount);
			console.log('-----------------------------------------------');
			console.log('-----------------------------------------------');
			// Create PLAID Recipient
			const createRecipientResponse = await plaid.paymentInitiationRecipientCreate({
				name: input.account_holder_name,
				bacs: {
					account: input.account_number,
					sort_code: input.sort_code.replace(/-/g, '')
				}
			});
			const recipient_id = createRecipientResponse.data.recipient_id;
			prettyPrintResponse(createRecipientResponse);
			const routing_number = bankAccount.sort_code.replace(/-/g, '');
			let createPaymentResponse;
			if (input.is_scheduled && input?.schedule) {
				createPaymentResponse = await plaid.paymentInitiationPaymentCreate({
					recipient_id,
					reference: input.reference,
					options: {
						bacs: {
							account: decrypt(bankAccount.account_number, String(process.env.ENC_SECRET)),
							sort_code: routing_number
						}
					},
					schedule: {
						interval: <PaymentScheduleInterval>input.schedule.interval,
						interval_execution_day: Number(input.schedule.interval_execution_day),
						start_date: dayjs(input.schedule.start_date).format('YYYY-MM-DD'),
						...(input.schedule?.end_date && {
							end_date: dayjs(input.schedule?.end_date).format('YYYY-MM-DD')
						})
					},
					amount: {
						value: input.amount,
						currency: PaymentAmountCurrency.Gbp
					}
				});
			} else {
				createPaymentResponse = await plaid.paymentInitiationPaymentCreate({
					recipient_id,
					reference: input.reference,
					options: {
						bacs: {
							account: decrypt(bankAccount.account_number, String(process.env.ENC_SECRET)),
							sort_code: routing_number
						}
					},
					amount: {
						value: input.amount,
						currency: PaymentAmountCurrency.Gbp
					}
				});
			}
			prettyPrintResponse(createPaymentResponse);
			const payment_id = createPaymentResponse.data.payment_id;

			const result = await generateLinkToken(
				input.user_id,
				bankAccount.user.phone,
				IS_DEVELOPMENT ? 'https://ede3-146-198-166-218.eu.ngrok.io/server/plaid/webhook' : PLAID_WEBHOOK_URL,
				payment_id,
				bankAccount.institution_id
			);
			// create payment in db
			if (input.is_scheduled && input?.schedule) {
				await ctx.prisma.payment.create({
					data: {
						userId: input.user_id,
						bankAccountId: bankAccount.id,
						plaid_payment_id: payment_id,
						plaid_link_token: result.link_token,
						plaid_recipient_id: recipient_id,
						recipient_name: input.account_holder_name,
						payment_type: 'bank_transfer',
						plaid_payment_status: PaymentInitiationPaymentStatus.InputNeeded,
						amount: input.amount * 100,
						recurring: true,
						schedule: {
							set: {
								interval: <Prisma.PaymentInterval>input.schedule.interval.toLowerCase(),
								interval_execution_day: input.schedule.interval_execution_day,
								start_date: dayjs(input.schedule.start_date).unix() ?? dayjs().unix()
							}
						},
						status: PAYMENT_STATUS.PENDING,
						reference: input.reference
					}
				});
			} else {
				await ctx.prisma.payment.create({
					data: {
						userId: input.user_id,
						bankAccountId: bankAccount.id,
						plaid_payment_id: payment_id,
						plaid_link_token: result.link_token,
						plaid_recipient_id: recipient_id,
						recipient_name: input.account_holder_name,
						recurring: false,
						payment_type: 'bank_transfer',
						plaid_payment_status: PaymentInitiationPaymentStatus.InputNeeded,
						amount: input.amount * 100,
						status: PAYMENT_STATUS.PENDING,
						reference: input.reference
					}
				});
			}
			return { ...result, payment_id };
		} catch (err) {
			// @ts-ignore
			console.error(err?.response?.data ?? err);
			// @ts-ignore
			throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
		}
	}),
	updateLinkSession: t.procedure
		.input(
			z.object({
				userId: z.string(),
				plaid_link_token: z.string(),
				link_session_id: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				return await ctx.prisma.payment.update({
					where: {
						plaid_link_token: input.plaid_link_token
					},
					data: {
						link_session_id: input.link_session_id
					}
				});
			} catch (err) {
				console.error(err);
				//@ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.response?.data ?? err?.message });
			}
		}),
	cancelPayment: t.procedure
		.input(
			z.object({
				userId: z.string(),
				plaid_payment_id: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				console.table(input);
				return await ctx.prisma.payment.update({
					where: {
						plaid_payment_id: input.plaid_payment_id
					},
					data: {
						status: convertPlaidStatus(PaymentInitiationPaymentStatus.Cancelled)
					}
				});
			} catch (err) {
				console.error(err);
				//@ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.response?.data ?? err?.message });
			}
		})
});

export default paymentsRouter;
