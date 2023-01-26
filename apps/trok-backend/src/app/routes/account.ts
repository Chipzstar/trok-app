import { t } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { stripe } from '../utils/clients';
import { comparePassword, hashPassword } from '@trok-app/shared-utils';

const accountRouter = t.router({
	countUsers: t.procedure.query(async ({ input, ctx }) => {
		try {
		    return await ctx.prisma.user.findMany({
				select: {
					id: true,
					created_at: true
				}
			})
		} catch (err) {
		    console.error(err)
			// @ts-ignore
			throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message })
		}
	}),
	getAccount: t.procedure
		.input(
			z.object({
				id: z.string(),
				stripe_account_id: z.string().optional()
			})
		)
		.query(async ({ input, ctx }) => {
			return await ctx.prisma.user.findUnique({
				where: {
					id: input.id
				},
				select: {
					referrals: true,
					approved: true,
					full_name: true,
					firstname: true,
					lastname: true,
					email: true,
					phone: true,
					password: true,
					business: true,
					location: true,
					shipping_address: true,
					card_configuration: true
				}
			});
		}),
	checkAccountApproved: t.procedure
		.input(
			z.object({
				id: z.string()
			})
		)
		.query(async ({ input, ctx }) => {
			const user = await ctx.prisma.user.findUnique({
				where: {
					id: input.id
				},
				select: {
					approved: true
				}
			});
			return user ? user.approved : true;
		}),
	updatePersonalInfo: t.procedure
		.input(
			z.object({
				id: z.string(),
				stripe: z.object({
					account_id: z.string(),
					person_id: z.string()
				}),
				firstname: z.string(),
				lastname: z.string(),
				email: z.string(),
				phone: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				// update stripe person representative
				let token = await stripe.tokens.create(
					{
						person: {
							email: input.email,
							phone: input.phone,
							first_name: input.firstname,
							last_name: input.lastname
						}
					},
					{ stripeAccount: input.stripe.account_id }
				);
				const person = await stripe.accounts.updatePerson(input.stripe.account_id, input.stripe.person_id, {
					person_token: token.id
				});
				console.log('-----------------------------------------------');
				console.log(person);
				console.log('-----------------------------------------------');
				// update stripe account information
				token = await stripe.tokens.create(
					{
						account: {
							company: {
								phone: input.phone
							}
						}
					},
					{ stripeAccount: input.stripe.account_id }
				);
				const account = await stripe.accounts.update(input.stripe.account_id, {
					account_token: token.id
				});
				console.log('-----------------------------------------------');
				console.log(account);
				console.log('-----------------------------------------------');
				return ctx.prisma.user.update({
					where: {
						id: input.id
					},
					data: {
						full_name: `${input.firstname} ${input.lastname}`,
						firstname: input.firstname,
						lastname: input.lastname,
						email: input.email,
						phone: input.phone
					}
				});
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ message: err.message, code: 'BAD_REQUEST' });
			}
		}),
	updateCompanyInfo: t.procedure
		.input(
			z.object({
				id: z.string(),
				stripe: z.object({
					account_id: z.string(),
					person_id: z.string()
				}),
				legal_name: z.string(),
				num_monthly_invoices: z.number(),
				business_type: z.string(),
				merchant_category_code: z.string(),
				business_crn: z.string(),
				num_vehicles: z.number(),
				business_url: z.string().url()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				// update stripe account information
				const token = await stripe.tokens.create(
					{
						account: {
							company: {
								name: input.legal_name,
								registration_number: input.business_crn,
								tax_id: input.business_crn
							}
						}
					},
					{ stripeAccount: input.stripe.account_id }
				);
				const account = await stripe.accounts.update(input.stripe.account_id, {
					account_token: token.id,
					business_profile: {
						mcc: input.merchant_category_code,
						...(input.business_url && { url: input.business_url })
					}
				});
				console.log('-----------------------------------------------');
				console.log(account);
				console.log('-----------------------------------------------');
				return ctx.prisma.user.update({
					where: {
						id: input.id
					},
					data: {
						business: {
							legal_name: input.legal_name,
							num_monthly_invoices: input.num_monthly_invoices,
							business_type: input.business_type,
							merchant_category_code: input.merchant_category_code,
							business_crn: input.business_crn,
							num_vehicles: input.num_vehicles,
							business_url: input.business_url
						}
					}
				});
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ message: err.message, code: 'BAD_REQUEST' });
			}
		}),
	changePassword: t.procedure
		.input(
			z
				.object({
					id: z.string(),
					curr_password: z.string(),
					new_password: z.string(),
					confirm_password: z.string()
				})
				.superRefine(({ confirm_password, new_password }, ctx) => {
					if (confirm_password !== new_password) {
						ctx.addIssue({
							code: 'custom',
							message: 'The passwords did not match'
						});
					}
				})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				// find matching user based on the auth session
				const user = await ctx.prisma.user.findUniqueOrThrow({
					where: {
						id: input.id
					},
					select: {
						password: true
					}
				});
				// check current password is correct
				const is_match = await comparePassword(input.curr_password, user.password)
				if (!is_match) {
					throw new TRPCError({ message: "Current password is invalid. Please double check", code: 'BAD_REQUEST' });
				}
				const hashed_password = await hashPassword(input.new_password)
				return await ctx.prisma.user.update({
					where: {
						id: input.id
					},
					data: {
						password: hashed_password
					}
				});
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ message: err.message, code: 'BAD_REQUEST' });
			}
		})
});

export default accountRouter;
