// create a Redis client - connect to Redis (will be done later in this tutorial)
import redisClient from '../redis';
import RateLimiterRedis from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { MAX_CONSECUTIVE_FAILS_BY_EMAIL_AND_IP, MAX_WRONG_ATTEMPTS_BY_IP_PER_DAY } from '../utils/constants';

redisClient.on('error', err => {
	// this error is handled by an error handling function that will be explained later in this tutorial
	return new Error();
});

export const limiterSlowBruteByIP = RateLimiterRedis({
	/*store: new RedisStore({
		prefix: 'login_fail_ip_per_day',
		// @ts-expect-error - Known issue: the `call` function is not present in @types/ioredis
		sendCommand: (...args: string[]) => redisClient.call(args)
	}),*/
	standardHeaders: true,
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	// maximum number of failed logins allowed. 1 fail = 1 point
	// each failed login consumes a point
	max: MAX_WRONG_ATTEMPTS_BY_IP_PER_DAY,
	// number of seconds to block route if consumed points > limit
	windowMs: 60 * 60 * 24
});

export const limiterConsecutiveFailsByEmailAndIP = RateLimiterRedis({
	store: new RedisStore({
		prefix: 'login_fail_consecutive_email_and_ip',
		// @ts-expect-error - Known issue: the `call` function is not present in @types/ioredis
		sendCommand: (...args: string[]) => redisClient.call(args)
	}),
	standardHeaders: true,
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	max: MAX_CONSECUTIVE_FAILS_BY_EMAIL_AND_IP,
	windowMs: 60 * 60 // Block after 1 hour
});

// rate-limiting middleware controller
/*const loginRouteRateLimit = async (req: Request, res: Response, next: NextFunction) => {
	const ipAddr = req.ip;
	const emailIPkey = getEmailIPkey(req.body.email, ipAddr);

	// get keys for attempted login
	const [resEmailAndIP, resSlowByIP] = await Promise.all([
		limiterConsecutiveFailsByEmailAndIP.get(emailIPkey),
		limiterSlowBruteByIP.get(ipAddr)
	]);

	let retrySecs = 0;
	// Check if IP or email + IP is already blocked
	if (
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
		res
			.status(429)
			.send(`Too many requests. Retry after ${retrySecs} seconds.`);
	} else {
		try {
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
				} catch (rlRejected: ) {
					if (rlRejected instanceof Error) {
						throw rlRejected;
					} else {
						const timeOut = String(Math.round(rlRejected.msBeforeNext / 1000)) || 1;
						res.set('Retry-After', timeOut as string);
						res
							.status(429)
							.send(`Too many login attempts. Retry after ${timeOut} seconds`);
					}
				}
			}
			if (user) {
				console.log('successful login');
				if (resEmailAndIP !== null && resEmailAndIP.consumedPoints > 0) {
					// Reset limiter based on IP + email on successful authorisation
					await limiterConsecutiveFailsByEmailAndIP.delete(emailIPkey);
				}
				res.status(200).send("Permission granted!")
			}
		} catch (err) {
			console.log(err);
			next(err);
		}
	}
};*/
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
