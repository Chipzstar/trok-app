import { t } from '../../trpc';
import { z } from 'zod';

const cardRouter = t.router({
	createCard: t.procedure
		.input(
			z.object({

			})
		).mutation(async req => {
			// use your ORM of choice
			console.log(req.input);
			return await req.ctx.prisma.card.findMany({});
		})
})

export default cardRouter;