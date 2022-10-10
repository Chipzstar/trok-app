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
				firstname: z.string(),
				lastname: z.string(),
				full_name: z.string().min(5),
				email: z.string().email('Invalid email'),
				phone: z.string(),
				company_name: z.string(),
				address: z
					.object({
						line1: z.string(),
						line2: z.string().optional(),
						city: z.string(),
						postcode: z.string(),
						county: z.string(),
						country: z.string().optional()
					})
					.optional(),
				stripe: z
					.object({
						customerId: z.string(),
						bankAccount: z.object({
							id: z.string(),
							fingerprint: z.string(),
							account_holder_name: z.string(),
							account_number: z.string(),
							sort_code: z.string(),
							currency: z.string(),
							status: z.string()
						})
					})
					.optional(),
				business: z
					.object({
						legal_name: z.string(),
						business_type: z.string().optional(),
						business_email: z.string(),
						business_phone: z.string(),
						merchant_category_code: z.string(),
						business_url: z.string()
					})
					.optional()
			})
		)
		.mutation(async req => {
			// use your ORM of choice
			console.log(req.input);
			return await req.ctx.prisma.user.create({
				data: req.input
			});
		})
});

export default userRouter;
