export const PLAID_SANDBOX = process.env.PLAID_ENV === 'sandbox'

export enum HttpCode {
	OK = 200,
	NO_CONTENT = 204,
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	NOT_FOUND = 404,
	INTERNAL_SERVER_ERROR = 500,
}

export const MAX_WRONG_ATTEMPTS_BY_IP_PER_DAY = 100;
export const MAX_CONSECUTIVE_FAILS_BY_EMAIL_AND_IP = 3;
export const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24