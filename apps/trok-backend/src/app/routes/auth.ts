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
import { sendVerificationLink } from '../helpers/email';

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
			const hashed_password = await hashPassword(input.password);
			await ctx.redis.hmset(input.email, {
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
			return { message: `Signup for ${input.email} has been initiated`, hashed_password };
		} catch (err) {
			console.error(err);
			// @ts-ignore
			throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
		}
	}),
	verifyEmail: t.procedure
		.input(
			z.object({
				email: z.string().email(),
				token: z.string().uuid()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				const user = await ctx.prisma.user.update({
					where: {
						email: input.email
					},
					data: {
						emailVerified: dayjs().toDate()
					}
				});
				if (!user) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: `No user found with the email address ${input.email}`
					});
				}
				// check token matches verification_token saved in user record
				if (user.verify_token !== input.token) {
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: `Invalid verification token. Please check the URL link matches the link sent to your email`
                    });
                }
				return true
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		})
});

router.post('/onboarding', async (req, res, next) => {
	try {
		const { email, step } = req.query;
		console.log('************************************************');
		console.log('EMAIL: ' + email);
		const payload = req.body;
		console.log(payload);
		await redisClient.hmset(String(email), payload);
		await redisClient.hset(String(email), 'onboarding_step', String(step));
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
						date: dayjs().subtract(2, 'm').unix(),
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
			plaid_recipient_id: '',
			plaid_request_id: '',
			account_holder_name: 'Stripe Payments UK Limited',
			account_number: '00000000',
			sort_code: '00-00-00'
		};
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
		sendVerificationLink(user.email, user.full_name, verify_token)
			.then(() => console.log('Verification link sent'))
			.catch(err => console.error(err));
		res.status(200).json(user);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

export default router;
