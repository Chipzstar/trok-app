import { t } from '../../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { stripe } from '../../utils/clients';

const accountRouter = t.router({
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
				weekly_fuel_spend: z.number(),
				average_monthly_revenue: z.number(),
				business_type: z.string(),
				merchant_category_code: z.string(),
				business_crn: z.string(),
				num_vehicles: z.number(),
				business_url: z.string().url(),
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
						...(input.business_url && {url: input.business_url})
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
							weekly_fuel_spend: input.weekly_fuel_spend,
							average_monthly_revenue: input.average_monthly_revenue,
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
		})
});

export default accountRouter;
