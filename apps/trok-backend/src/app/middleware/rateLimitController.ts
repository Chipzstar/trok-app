// create a Redis client - connect to Redis (will be done later in this tutorial)
import redisClient from '../redis';
import rateLimit from 'express-rate-limit';
import { MAX_CONSECUTIVE_FAILS_BY_EMAIL_AND_IP, MAX_WRONG_ATTEMPTS_BY_IP_PER_DAY } from '../utils/constants';
import { getEmailIPkey } from '../utils/helpers';

redisClient.on('error', err => {
	// this error is handled by an error handling function that will be explained later in this tutorial
	return new Error();
});

export const limiterSlowBruteByIP = rateLimit({
	/*store: new RedisStore({
		prefix: 'login_fail_ip_per_day',
		//@ ts-ignore
		// @ts-expect-error - Known issue: the `call` function is not present in @types/ioredis
		sendCommand: (...args: string[]) => redisClient.call(args)
	}),*/
	message: "Too many failed login attempts made, please try again after an hour",
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false,
	// maximum number of failed logins allowed. 1 fail = 1 point
	// each failed login consumes a point
	max: MAX_WRONG_ATTEMPTS_BY_IP_PER_DAY,
	// number of seconds to block route if consumed points > limit
	windowMs: 1000 * 60 * 60 * 24
});

export const limiterConsecutiveFailsByEmailAndIP = rateLimit({
	/*store: new RedisStore({
		prefix: 'login_fail_consecutive_email_and_ip',
		// @ts-expect-error - Known issue: the `call` function is not present in @types/ioredis
		sendCommand: (...args: string[]) => redisClient.call(args)
	}),*/
	message: "Too many failed login attempts made, please try again after an hour",
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false,
	keyGenerator: (request, response) => getEmailIPkey(request.body.email, request.ip),
	max: MAX_CONSECUTIVE_FAILS_BY_EMAIL_AND_IP,
	windowMs: 1000 * 60 * 60 // Block after 1 hour
});

/*
	TRPC version loginRoute rate limiter
 */
/*export const loginRouteRateLimit = createRouter().middleware(async req => {
	const { ctx, rawInput, next } = req;
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const ipAddr = rawInput.ip;
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
	const emailIPkey = getEmailIPkey(rawInput.email, ipAddr);

	// get keys for attempted login
	const [resEmailAndIP, resSlowByIP] = await Promise.all([
		limiterConsecutiveFailsByEmailAndIP.get(emailIPkey),
		limiterSlowBruteByIP.get(ipAddr)
	]);

	let retrySecs = 0;
	// Check if IP or email + IP is already blocked
	if (resSlowByIP !== null && resSlowByIP.consumedPoints > MAX_WRONG_ATTEMPTS_BY_IP_PER_DAY) {
		retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
	} else if (resEmailAndIP !== null && resEmailAndIP.consumedPoints > MAX_CONSECUTIVE_FAILS_BY_EMAIL_AND_IP) {
		retrySecs = Math.round(resEmailAndIP.msBeforeNext / 1000) || 1;
	}

	// the IP and email + ip are not rate limited
	if (retrySecs > 0) {
		// sets the response’s HTTP header field
		//res.set('Retry-After', String(retrySecs));
		throw new TRPCError({
			code: 'CLIENT_CLOSED_REQUEST',
			message: `Too many requests. Retry after ${retrySecs} seconds.`
		});
	} else {
		try {
			// authenticate the user
			const user = await ctx.prisma.user.findFirst({
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
					const incorrectPassword = await ctx.prisma.user.findFirst({
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
					if (!incorrectPassword) {
						console.log('failed login: user does not exist');
					}
					await Promise.all(promises);
					console.log('Email or password is wrong.');
					throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Email or password is incorrect' });
				} catch (rlRejected) {
					if (rlRejected instanceof Error) {
						throw new TRPCError({ message: rlRejected.message, code: 'CLIENT_CLOSED_REQUEST' });
					} else {
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						const timeOut = String(Math.round(rlRejected.msBeforeNext / 1000)) || 1;
						//res.set('Retry-After', timeOut);
						throw new TRPCError({
							code: 'CLIENT_CLOSED_REQUEST',
							message: `Too many login attempts. Retry after ${timeOut} seconds`
						});
					}
				}
			}
			// If prisma authentication successful
			if (user) {
				console.log('successful login');
				if (resEmailAndIP !== null && resEmailAndIP.consumedPoints > 0) {
					// Reset limiter based on IP + email on successful authorisation
					await limiterConsecutiveFailsByEmailAndIP.delete(emailIPkey);
				}
				return next({
					ctx: {
						user: ctx.user
					}
				});
			}
		} catch (err) {
			console.log(err);
			throw new TRPCError({ code: 'UNAUTHORIZED' });
		}
	}
});*/
