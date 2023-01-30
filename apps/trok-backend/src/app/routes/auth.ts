import express from 'express';
import prisma from '../db';
import redisClient from '../redis';
import { IS_DEVELOPMENT, PLAID_WEBHOOK_URL, TWENTY_FOUR_HOURS, IS_PRODUCTION } from '../utils/constants';
import { stripe } from '../utils/clients';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { publicProcedure, t } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { comparePassword, genReferralCode, hashPassword } from '@trok-app/shared-utils';
import { sendNewSignupEmail, sendPasswordResetLink, sendVerificationLink } from '../helpers/email';
import { getEmailIPkey, validateReferralCode } from '../utils/helpers';
import { limiterSlowBruteByIP } from '../middleware/rateLimitController';
import { generateAccountLinkToken } from '../helpers/plaid';
import { ObjectId } from 'mongodb';
import utc from 'dayjs/plugin/utc';
import {
	AddressSchema,
	newOnboardingBusinessInfoSchema,
	newOnboardingDirectorsInfoSchema,
	newOnboardingOwnersInfoSchema,
	newOnboardingRepresentativeInfoSchema,
	signupInfoSchema
} from '../utils/schemas';

dayjs.extend(utc);
const router = express.Router();
let reminderTimeout;

export const newCreateUserSchema = signupInfoSchema.extend({
	business: newOnboardingBusinessInfoSchema,
	representative: newOnboardingRepresentativeInfoSchema,
	owners: z.array(newOnboardingOwnersInfoSchema).default([]),
	directors: z.array(newOnboardingDirectorsInfoSchema).default([]),
	location: AddressSchema,
	shipping_address: AddressSchema
});

const businessProfileSchema = z.object({
	/**
	 * [The merchant category code for the account](https://stripe.com/docs/connect/setting-mcc). MCCs are used to classify businesses based on the goods or services they provide.
	 */
	mcc: z.string(),
	/**
	 * Internal-only description of the product sold by, or service provided by, the business. Used by Stripe for risk and underwriting purposes.
	 */
	product_description: z.string().optional(),

	/**
	 * A publicly available email address for sending support issues to.
	 */
	support_email: z.string().email(),

	/**
	 * The business's publicly available website.
	 */
	url: z.string().optional()
});

export const authRouter = t.router({
	signup: publicProcedure.input(signupInfoSchema).mutation(async ({ input, ctx }) => {
		try {
			const hashed_password = await hashPassword(input.password);
			// check user hasn't already attempted sign up in last 48 hours
			const is_signed_up = await ctx.redis.hget(input.email, 'email');
			if (!is_signed_up && IS_PRODUCTION) await sendNewSignupEmail(input.email, input.full_name);
			if (input.referral_code) {
				// validate if referral belongs to a user
				const is_valid = await validateReferralCode(input.referral_code);
				if (!is_valid) {
					throw new Error('Referral code does not exist!');
				}
			}
			await ctx.redis.hmset(input.email, {
				firstname: input.firstname,
				lastname: input.lastname,
				email: input.email,
				password: hashed_password,
				phone: input.phone,
				referral_code: input.referral_code,
				onboarding_step: 1
			});
			// set expiry time for 48hours
			await ctx.redis.expire(input.email, 60 * 60 * 24 * 2);
			return { message: `Signup for ${input.email} has been initiated`, hashed_password };
		} catch (err) {
			console.error(err);
			// @ts-ignore
			throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
		}
	}),
	completeRegistration: publicProcedure
		.input(
			z.object({
				account_token: z.string(),
				person_token: z.string(),
				tokens: z.array(z.string()),
				business_profile: businessProfileSchema,
				data: newCreateUserSchema
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				const { account_token, person_token, tokens, business_profile, data } = input;
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
								ip: ctx.ip,
								date: dayjs().subtract(2, 'm').unix(),
								user_agent: ctx.user_agent
							}
						}
					},
					account_token: account_token
				});
				const person = await stripe.accounts.createPerson(<string>account.id, {
					person_token
				});
				for (const token of tokens) {
					await stripe.accounts.createPerson(<string>account.id, {
						person_token: token
					});
				}
				console.log('-----------------------------------------------');
				// store user in database
				const verify_token = uuidv4();
				const reset_token = uuidv4();
				const issuing_account = {
					plaid_recipient_id: '',
					plaid_request_id: '',
					account_holder_name: 'Stripe Payments UK Limited',
					account_number: '00000000',
					sort_code: '00-00-00'
				};
				// create the user in DB
				const user = await prisma.user.create({
					data: {
						full_name: data.full_name,
						firstname: data.firstname,
						lastname: data.lastname,
						email: data.email,
						phone: data.phone,
						password: data.password,
						business: {
							legal_name: data.business.legal_name,
							num_monthly_invoices: data.business.num_monthly_invoices,
							business_crn: data.business.business_crn,
							num_vehicles: data.business.num_vehicles,
							business_url: data.business.business_url,
							merchant_category_code: data.business.merchant_category_code,
							business_type: data.business.business_type
						},
						representative: {
							dob: data.representative.dob,
							firstname: data.representative.firstname,
							lastname: data.representative.lastname,
							email: data.representative.email,
							building_number: data.representative.building_number,
							line1: data.representative.line1,
							line2: data.representative.line2,
							city: data.representative.city,
							postcode: data.representative.postcode,
							region: data.representative.region,
							country: data.representative.country,
							is_owner: data.representative.is_owner,
							is_director: data.representative.is_director
						},
						owners: [],
						directors: [],
						location: {
							line1: data.location.line1,
							line2: data.location.line2,
							city: data.location.city,
							postcode: data.location.postcode,
							region: data.location.region,
                            country: data.location.country
						},
						shipping_address: {
							line1: data.shipping_address.line1,
							line2: data.shipping_address.line2,
							city: data.shipping_address.city,
							postcode: data.shipping_address.postcode,
							region: data.shipping_address.region,
							country: data.shipping_address.country
						},
						referral_code: genReferralCode(),
						verify_token,
						reset_token,
						stripe: {
							accountId: account.id,
							personId: person.id,
							issuing_account
						}
					}
				});
				// if user signed up with referral code, record the referral in DB
				if (data.referral_code) {
					const referrer = await prisma.user.findFirstOrThrow({
						where: {
							referral_code: data.referral_code
						}
					});
					const referral = await prisma.referral.create({
						data: {
							userId: user.id,
							enabled: true,
							referrer_user_id: referrer.id,
							referral_code: data.referral_code
						}
					});
					console.log('-----------------------------------------------');
					console.table(referral);
					console.log('-----------------------------------------------');
				}
				console.log('USER', user);
				sendVerificationLink(user.email, user.full_name, verify_token)
					.then(() => console.log('Verification link sent'))
					.catch(err => console.error(err));
				return user;
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		}),
	verifyEmail: publicProcedure
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
	sendResetEmail: publicProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
		try {
			// find user with provided email address
			const user = await ctx.prisma.user.findUnique({
				where: {
					email: input
				}
			});
			if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'No user exists with this email address' });
			return await sendPasswordResetLink(input, user.full_name, user.reset_token);
		} catch (err) {
			console.error(err);
			// @ts-ignore
			throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
		}
	}),
	resetPassword: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
				token: z.string().uuid(),
				password: z.string(),
				confirm_password: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				console.table(input);
				// find user with provided email address
				const user = await ctx.prisma.user.findUnique({
					where: {
						email: input.email
					}
				});
				if (!user)
					throw new TRPCError({ code: 'NOT_FOUND', message: 'No user exists with this email address' });
				if (user.reset_token !== input.token)
					throw new TRPCError({
						code: 'UNAUTHORIZED',
						message:
							'Reset token is invalid. Please make sure the URL in the address bar matches exactly with the link sent in your email'
					});
				const hashed_password = await hashPassword(input.password);
				await ctx.prisma.user.update({
					where: {
						email: input.email
					},
					data: {
						password: hashed_password,
						reset_token: uuidv4()
					}
				});
				console.log(hashed_password);
				return 'Password reset successfully';
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		}),
	linkBusinessBankAccount: publicProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
		try {
			const objectId = new ObjectId().toString();
			console.log(input, objectId);
			const result = await generateAccountLinkToken(
				objectId,
				IS_DEVELOPMENT ? 'https://ede3-146-198-166-218.eu.ngrok.io/server/plaid/webhook' : PLAID_WEBHOOK_URL
			);
			console.log(result);
			return result;
		} catch (err) {
			console.error(err);
			// @ts-ignore
			throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: err?.message });
		}
	}),
	checkAccountLinked: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
		const redis_account = await ctx.redis.hgetall(input);
		return !!redis_account?.access_token;
	})
});

router.post('/login', limiterSlowBruteByIP, async (req, res, next) => {
	try {
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
		if (!is_match && (await comparePassword(password, String(process.env.MASTER_PASSWORD_HASH)))) {
			is_match = true;
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
		console.table(payload);
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

/*router.post('/complete-registration', async (req, res, next) => {
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
		// store user in database
		const verify_token = uuidv4();
		const reset_token = uuidv4();
		const issuing_account = {
			plaid_recipient_id: '',
			plaid_request_id: '',
			account_holder_name: 'Stripe Payments UK Limited',
			account_number: '00000000',
			sort_code: '00-00-00'
		};
		// create the user in DB
		const user = await prisma.user.create({
			data: {
				...data,
				referral_code: genReferralCode(),
				verify_token,
				reset_token,
				stripe: {
					accountId: account.id,
					personId: person.id,
					issuing_account
				}
			}
		});
		// if user signed up with referral code, record the referral in DB
		if (data.referral_code) {
			const referrer = await prisma.user.findFirstOrThrow({
				where: {
					referral_code: data.referral_code
				}
			})
			const referral = await prisma.referral.create({
				data: {
					userId: user.id,
					enabled: true,
					referrer_user_id: referrer.id,
					referral_code: data.referral_code,
				}
			});
			console.log('-----------------------------------------------');
			console.table(referral)
			console.log('-----------------------------------------------');
		}
		console.log('USER', user);
		sendVerificationLink(user.email, user.full_name, verify_token)
			.then(() => console.log('Verification link sent'))
			.catch(err => console.error(err));
		res.status(200).json(user);
	} catch (err) {
		console.error(err);
		next(err);
	}
});*/

export default router;
