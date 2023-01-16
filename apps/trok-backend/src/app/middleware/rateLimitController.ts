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
