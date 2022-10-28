import { t } from '../../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { stripe } from '../../utils/clients';

const accountRouter = t.router({
	updatePersonalInfo: t.procedure.input(z.object({
		id: z.string(),
		stripe: z.object({
			account_id: z.string(),
			person_id: z.string(),
		}),
		firstname: z.string(),
		lastname: z.string(),
        email: z.string(),
		phone: z.string(),
	})).mutation(async ({ input, ctx}) => {
		try {
			// update stripe person representative
			let token = await stripe.tokens.create({
				person: {
					email: input.email,
					phone: input.phone,
					first_name: input.firstname,
					last_name: input.lastname
				}
			}, {stripeAccount: input.stripe.account_id})
			const person = await stripe.accounts.updatePerson(input.stripe.account_id, input.stripe.person_id, {
				person_token: token.id
			})
			console.log('-----------------------------------------------');
			console.log(person);
            console.log('-----------------------------------------------');
			// update stripe account information
			token = await stripe.tokens.create({
				account: {
					company: {
						phone: input.phone,
					}
				}
			}, { stripeAccount: input.stripe.account_id })
			const account = await stripe.accounts.update(input.stripe.account_id,{
				account_token: token.id
			})
			console.log('-----------------------------------------------');
            console.log(account);
			console.log('-----------------------------------------------');
			return ctx.prisma.user.update({
				where: {
					id: input.id,
				},
				data: {
					full_name: `${input.firstname} ${input.lastname}`,
					firstname: input.firstname,
					lastname: input.lastname,
					email: input.email,
                    phone: input.phone
				}
			})
		} catch (err) {
		    console.error(err)
			// @ts-ignore
			throw new TRPCError({ message: err.message, code: 'BAD_REQUEST'})
		}
	})
})

export default accountRouter;
