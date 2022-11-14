import express from 'express';
import prisma from '../db';
import redisClient from '../redis';
import { TWENTY_FOUR_HOURS } from '../utils/constants';
import { stripe } from '../utils/clients';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { t } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { hashPassword } from '@trok-app/shared-utils';

const router = express.Router();
let reminderTimeout;

const signupInfoSchema = z.object({
	full_name: z.string(),
	firstname: z.string(),
	lastname: z.string(),
	email: z.string(),
	phone: z.string(),
	password: z.string(),
	referral_code: z
		.string()
		.optional()
		.nullable(),
	terms: z
		.boolean()
		.optional()
		.nullable()
})

export const authRouter = t.router({
	signup: t.procedure.input(signupInfoSchema).mutation(async ({ input, ctx }) => {
		try {
			const hashed_password = await hashPassword(input.password)
			await redisClient.hmset(input.email, {
				firstname: input.firstname,
				lastname: input.lastname,
				email: input.email,
				password: hashed_password,
				phone: input.phone,
				referral_code: input.referral_code,
				onboarding_step: 1
			});
			// set expiry time for 24hours
			await ctx.redis.expire(input.email, 60 * 60 * 24 * 2);
			return { message: `Signup for ${input.email} has been initiated`, hashed_password }
		} catch (err) {
			console.error(err);
			// @ts-ignore
			throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message })
		}
	})
})

/*router.post('/signup', async (req, res, next) => {
	try {
		const payload: SignupInfo = req.body;
		const hashed_password = await hashPassword(payload.password)
		await redisClient.hmset(payload.email, {
			firstname: payload.firstname,
			lastname: payload.lastname,
			email: payload.email,
			password: hashed_password,
			phone: payload.phone,
			referral_code: payload.referral_code,
			onboarding_step: 1
		});
		// set expiry time for 24hours
		await redisClient.expire(payload.email, 60 * 60 * 24 * 2);
		res.status(200).json({ message: `Signup for ${payload.email} has been initiated`, hashed_password });
	} catch (err) {
		console.error(err);
		next(err);
	}
});*/

router.post('/onboarding', async (req, res, next) => {
	try {
		const { email, step } = req.query;
		console.log('************************************************');
		console.log('EMAIL: ' + email);
		const payload = req.body;
		console.log(payload);
		await redisClient.hmset(<string>email, payload);
		await redisClient.hset(<string>email, 'onboarding_step', <string>step);
		// reset expiry time for 24hours
		await redisClient.expire(<string>email, 60 * 60 * 24 * 2);
		res.status(200).json({ message: `${email} has completed onboarding step ${step}` });
		reminderTimeout = setTimeout(() => {
			//TODO - send reminder email
		}, TWENTY_FOUR_HOURS);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

router.post('/complete-registration', async (req, res, next) => {
	try {
		console.log(req.get('User-Agent'));
		const { accountToken, personToken, business_profile, data } = req.body;
		console.log(data);
		const account = await stripe.accounts.create({
			country: 'GB',
			type: 'custom',
			business_profile,
			capabilities: {
				card_payments: { requested: true },
				transfers: { requested: true },
				card_issuing: { requested: true }
			},
			settings: {
				card_issuing: {
					tos_acceptance: {
						ip: req.ip,
						date: dayjs().subtract(2, "m").unix(),
						user_agent: req.get('User-Agent')
					}
				}
			},
			account_token: accountToken.id
		});
		const person = await stripe.accounts.createPerson(<string>account.id, {
			person_token: personToken.id
		});
		console.log('-----------------------------------------------');
		console.log(person);
		// store user in database
		const verify_token = uuidv4();
		const issuing_account = {
			plaid_recipient_id: "",
			plaid_request_id: "",
			account_holder_name: 'Stripe Payments UK Limited',
			account_number: "00000000",
			sort_code: "00-00-00"
		}
		const user = await prisma.user.create({
			data: {
				...data,
				verify_token,
				stripe: {
					accountId: account.id,
					personId: person.id,
					issuing_account
				}
			}
		});
		console.log('USER', user);
		res.status(200).json(user);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

export default router;
