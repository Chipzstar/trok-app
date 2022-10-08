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
				name: z.string().min(5),
				email: z.string().email('Invalid email')
			})
		)
		.mutation(async req => {
			// use your ORM of choice
			console.log(req.input)
			return await req.ctx.prisma.user.create({
				data: req.input
			});
		})
});

export default userRouter;
