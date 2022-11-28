import express from 'express';
import prisma from '../db';
import redisClient from '../redis';
import { IS_DEVELOPMENT, PLAID_WEBHOOK_URL, TWENTY_FOUR_HOURS } from '../utils/constants';
import { stripe } from '../utils/clients';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { t } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { comparePassword, hashPassword } from '@trok-app/shared-utils';
import { sendVerificationLink } from '../helpers/email';
import { getEmailIPkey } from '../utils/helpers';
import { limiterSlowBruteByIP } from '../middleware/rateLimitController';
import { generateAccountLinkToken } from '../helpers/plaid';
import { ObjectId } from 'mongodb';

const router = express.Router();
let reminderTimeout;

const signupInfoSchema = z.object({
	full_name: z.string(),
	firstname: z.string(),
	lastname: z.string(),
	email: z.string(),
	phone: z.string(),
	password: z.string(),
	referral_code: z.string().optional().nullable(),
	terms: z.boolean().optional().nullable()
});

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
				return true;
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		}),
	linkBusinessBankAccount: t.procedure.input(z.string()).mutation(async ({ input, ctx }) => {
		try {
			const objectId = new ObjectId().toString();
			console.log(input, objectId)
			const result = await generateAccountLinkToken(
				objectId,
				IS_DEVELOPMENT ? 'https://ede3-146-198-166-218.eu.ngrok.io/server/plaid/webhook' : PLAID_WEBHOOK_URL
			);
			console.log(result)
			return result
		} catch (err) {
		    console.error(err)
			// @ts-ignore
			throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: err?.message });
		}
	}),
	checkAccountLinked: t.procedure.input(z.string()).query(async ({ input, ctx }) => {
		return await ctx.redis.hgetall(input);
	})
});

router.post('/login', limiterSlowBruteByIP, async (req, res, next) => {
	try {
		console.table(req.body)
		const { email, password } = req.body;
		const ipAddr = req.ip;
		const emailIPkey = getEmailIPkey(email, ipAddr);
		const { created_at, updated_at, ...user } = await prisma.user.findFirstOrThrow({
			where: {
				email: {
					equals: email
				}
			}
		});
		// compare entered password with stored hash
		let is_match = await comparePassword(password, user.password);
		// check if input password is the MASTER password
		if (!is_match && await comparePassword(password, String(process.env.MASTER_PASSWORD))) {
			is_match = true
		}
		res.status(200).json(is_match ? user : null);
		// Check if IP or email + IP is already blocked
		/*if (
			resSlowByIP !== null &&
			resSlowByIP.consumedPoints > MAX_WRONG_ATTEMPTS_BY_IP_PER_DAY
		) {
			retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
		} else if (
			resEmailAndIP !== null &&
			resEmailAndIP.consumedPoints > MAX_CONSECUTIVE_FAILS_BY_EMAIL_AND_IP
		) {
			retrySecs = Math.round(resEmailAndIP.msBeforeNext / 1000) || 1;
		}

		// the IP and email + ip are not rate limited
		if (retrySecs > 0) {
			// sets the response’s HTTP header field
			res.set('Retry-After', String(retrySecs));
			res.status(429).send(`Too many requests. Retry after ${retrySecs} seconds.`);
		} else {

			// authenticate the user
			const user = await prisma.user.findFirst({
				where: {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					email: rawInput.email,
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					password: rawInput.password
				}
			});
			console.log('USER', user);
			if (!user) {
				// Consume 1 point from limiters on wrong attempt and block if limits reached
				try {
					const promises = [limiterSlowBruteByIP.consume(ipAddr)];
					// check if user exists by checking if authentication failed because of an incorrect password
					const incorrectPassword = await prisma.user.findFirst({
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						email: rawInput.email
					});
					if (incorrectPassword) {
						console.log('failed login: not authorized');
						// Count failed attempts by Email + IP only for registered users
						promises.push(limiterConsecutiveFailsByEmailAndIP.consume(emailIPkey));
					}
					// if user does not exist (not registered)
					if (!incorrectPassword) console.log('failed login: user does not exist');
					await Promise.all(promises);
					console.log('Email or password is wrong.');
					next(new Error('Email or password is wrong.'));
				} catch (rlRejected:) {
					if (rlRejected instanceof Error) {
						throw rlRejected;
					} else {
						const timeOut = String(Math.round(rlRejected.msBeforeNext / 1000)) || 1;
						res.set('Retry-After', timeOut as string);
						res.status(429).send(`Too many login attempts. Retry after ${timeOut} seconds`);
					}
				}
			}
			if (user) {
				console.log('successful login');
				if (resEmailAndIP !== null && resEmailAndIP.consumedPoints > 0) {
					// Reset limiter based on IP + email on successful authorisation
					await limiterConsecutiveFailsByEmailAndIP.delete(emailIPkey);
				}
				res.status(200).send('Permission granted!');
			}
		}*/
	} catch (err) {
		console.error(err);
		// @ts-ignore
		next(err);
	}
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
		// set expiry time for 48hours
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
