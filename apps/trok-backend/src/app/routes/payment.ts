import { t } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { fetchFundingDetails } from '../helpers/stripe';
import { plaid } from '../utils/clients';
import { prettyPrintResponse } from '../utils/helpers';
import { PaymentAmountCurrency, PaymentInitiationPaymentStatus } from 'plaid';
import { convertPlaidStatus, generateLinkToken } from '../helpers/plaid';
import { IS_DEVELOPMENT, PLAID_WEBHOOK_URL } from '../utils/constants';
import { decrypt, PAYMENT_STATUS } from '@trok-app/shared-utils';

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
	topUpBalance: t.procedure
		.input(
			z.object({
				user_id: z.string(),
				stripe_account_id: z.string(),
				amount: z.number(),
				reference: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				// fetch the default bank account
				const bankAccount = await ctx.prisma.bankAccount.findFirstOrThrow({
					where: {
						userId: input.user_id,
						is_default: true
					},
					select: {
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
				const createPaymentResponse = await plaid.paymentInitiationPaymentCreate({
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
				prettyPrintResponse(createPaymentResponse);
				const payment_id = createPaymentResponse.data.payment_id;

				const result = await generateLinkToken(
					input.user_id,
					bankAccount.user.phone,
					IS_DEVELOPMENT
						? 'https://1ac4-146-198-166-218.eu.ngrok.io/server/plaid/webhook'
						: PLAID_WEBHOOK_URL,
					payment_id,
					bankAccount.institution_id
				);
				// create payment in db
				await ctx.prisma.payment.create({
					data: {
						userId: input.user_id,
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
				return result;
			} catch (err) {
				// @ts-ignore
				console.log(err.response?.data ?? err.response);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.response?.data?.message ?? err?.message });
			}
		}),
	payExternalAccount: t.procedure
		.input(
			z.object({
				user_id: z.string(),
				reference: z.string(),
				amount: z.number(),
				account_holder_name: z.string(),
				account_number: z.string(),
				sort_code: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				// fetch the default bank account
				const bankAccount = await ctx.prisma.bankAccount.findFirstOrThrow({
					where: {
						userId: input.user_id,
						is_default: true
					},
					select: {
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
				const createPaymentResponse = await plaid.paymentInitiationPaymentCreate({
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
				prettyPrintResponse(createPaymentResponse);
				const payment_id = createPaymentResponse.data.payment_id;

				const result = await generateLinkToken(
					input.user_id,
					bankAccount.user.phone,
					IS_DEVELOPMENT
						? 'https://ede3-146-198-166-218.eu.ngrok.io/server/plaid/webhook'
						: PLAID_WEBHOOK_URL,
					payment_id,
					bankAccount.institution_id
				);
				// create payment in db
				await ctx.prisma.payment.create({
					data: {
						userId: input.user_id,
						plaid_payment_id: payment_id,
						plaid_link_token: result.link_token,
						plaid_recipient_id: recipient_id,
						recipient_name: input.account_holder_name,
						payment_type: 'bank_transfer',
						plaid_payment_status: PaymentInitiationPaymentStatus.InputNeeded,
						amount: input.amount * 100,
						status: PAYMENT_STATUS.PENDING,
						reference: input.reference
					}
				});
				return result;
			} catch (err) {
				// @ts-ignore
				console.error(err?.response?.data ?? err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		}),
	updateLinkSession: t.procedure.input(
		z.object({
			userId: z.string(),
			plaid_link_token: z.string(),
			link_session_id: z.string(),
		})
	).mutation(async ({ input, ctx}) => {
		try {
			return await ctx.prisma.payment.update({
				where: {
					plaid_link_token: input.plaid_link_token
				},
				data: {
					link_session_id: input.link_session_id
				}
			})
		} catch (err) {
		    console.error(err)
			//@ts-ignore
			throw new TRPCError({ code: 'BAD_REQUEST', message: err?.response?.data?? err?.message });
		}
	}),
	cancelPayment: t.procedure.input(
		z.object({
			userId: z.string(),
			link_session_id: z.string(),
		})
	).mutation(async ({ input, ctx }) => {
		try {
		    return await ctx.prisma.payment.update({
				where: {
					link_session_id: input.link_session_id,
				},
				data: {
					status: convertPlaidStatus(PaymentInitiationPaymentStatus.Cancelled)
				}
			})
		} catch (err) {
		    console.error(err)
			//@ts-ignore
			throw new TRPCError({ code: 'BAD_REQUEST', message: err?.response?.data?? err?.message });
		}
	})
});

export default paymentsRouter;
