import { t } from '../trpc';
import { z } from 'zod';

const userRouter = t.router({
	getUser: t.procedure.input(z.string()).query(req => {
		req.input; // string
		return { id: req.input, name: 'Bilbo' };
	}),
	createUser: t.procedure
		.input(
			z.object({
				verify_token: z.string(),
				email_verified: z.boolean().optional(),
				firstname: z.string(),
				lastname: z.string(),
				full_name: z.string().min(5),
				email: z.string().email('Invalid email'),
				phone: z.string(),
				password: z.string(),
				referral_code: z.string().optional(),
				terms: z.boolean().optional(),
				location: z.object({
					line1: z.string(),
					line2: z.string().optional(),
					city: z.string(),
					postcode: z.string(),
					region: z.string(),
					country: z.string()
				}),
				shipping_address: z.object({
					line1: z.string(),
					line2: z.string().optional(),
					city: z.string(),
					postcode: z.string(),
					region: z.string(),
					country: z.string()
				}),
				card_configuration: z.object({
					card_business_name: z.string(),
					num_cards: z.number().optional(),
					shipping_speed: z.enum(['express', 'standard', 'priority'])
				}),
				stripe: z.object({
					accountId: z.string(),
					personId: z.string(),
					issuing_account: z.object({
						plaid_recipient_id: z.string(),
						plaid_request_id: z.string().optional(),
						current_balance: z.number().default(0),
						account_holder_name: z.string(),
						account_number: z.string(),
						sort_code: z.string(),
						currency: z.string().default('gbp'),
						country: z.string().default('GB')
					})
				}),
				business: z.object({
					legal_name: z.string(),
					average_monthly_revenue: z.number(),
					num_vehicles: z.number(),
					weekly_fuel_spend: z.number(),
					business_type: z.string(),
					merchant_category_code: z.string(),
					business_url: z.string(),
					business_crn: z.string()
				})
			})
		)
		.mutation(async req => {
			// use your ORM of choice
			return await req.ctx.prisma.user.create({
				data: req.input
			});
		})
});

export default userRouter;
