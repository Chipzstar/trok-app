import { t } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { stripe } from '../utils/clients';
import Stripe from 'stripe';

const bankAccountRouter = t.router({
	getBankAccounts: t.procedure
		.input(
			z.object({
				userId: z.string()
			})
		)
		.query(async ({ input, ctx }) => {
			try {
				return await ctx.prisma.bankAccount.findMany({
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
	addBankAccount: t.procedure
		.input(
			z.object({
				userId: z.string(),
				stripeId: z.string(),
				account_holder_name: z.string(),
				account_number: z.string(),
				institution_id: z.string(),
				sort_code: z.string(),
				currency: z.string(),
				country: z.string(),
				is_default: z.boolean()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				console.table(input);
				// update stripe bank details
				const token = await stripe.tokens.create(
					{
						bank_account: {
							account_number: input.account_number,
							routing_number: input.sort_code,
							account_holder_name: input.account_holder_name,
							country: input.country,
							currency: input.currency
						}
					},
					{ stripeAccount: input.stripeId }
				);
				const bank_account = (await stripe.accounts.createExternalAccount(input.stripeId, {
					default_for_currency: true,
					external_account: token.id
				})) as Stripe.BankAccount;
				console.log('************************************************');
				console.log(bank_account);
				console.log('************************************************');
				// if default marked as true
				// set "is_default" for any other existing bank account to false
				if (input.is_default) {
					await ctx.prisma.bankAccount.updateMany({
						where: {
							userId: input.userId
						},
						data: {
							is_default: false
						}
					});
				}
				return await ctx.prisma.bankAccount.create({
					data: {
						userId: input.userId,
						stripe_bank_id: bank_account.id,
						account_holder_name: input.account_holder_name,
						bank_name: bank_account?.bank_name ?? '',
						fingerprint: bank_account.fingerprint,
						account_number: input.account_number,
						institution_id: input.institution_id,
						sort_code: input.sort_code,
						currency: input.currency,
						country: input.country,
						is_default: input.is_default,
						status: 'active'
					}
				});
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		}),
	setDefaultAccount: t.procedure
		.input(
			z.object({
				userId: z.string(),
				id: z.string(),
				stripeId: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				await ctx.prisma.bankAccount.updateMany({
					where: {
						userId: {
							equals: input.userId
						},
						NOT: {
							id: {
								equals: input.id
							}
						},
					},
					data: {
						is_default: false
					}
				});
				return await ctx.prisma.bankAccount.update({
					where: {
						id: input.id
					},
					data: {
						is_default: true
					}
				});
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		})
});

export default bankAccountRouter;
