import { CountryCode, Products } from 'plaid';
import { customAlphabet } from 'nanoid';
import { storage } from './clients';

//GCP
export const BUCKET = storage.bucket(String(process.env.GCS_BUCKET_NAME));
// PLAID
export const numericId = customAlphabet('1234567890', 16)
export const STATEMENT_REDIS_SORTED_SET_ID = 'upcoming_statements'
export const PLAID_CLIENT_NAME = 'Trok';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'
export const PLAID_SANDBOX = process.env.PLAID_ENV === 'sandbox'
export const PLAID_REDIRECT_URI = String(process.env.PLAID_REDIRECT_URI);
export const PLAID_COUNTRY_CODES = [CountryCode.Gb];
export const PLAID_PRODUCTS = [Products.Transactions, Products.PaymentInitiation];
export const PLAID_WEBHOOK_URL = String(process.env.PLAID_WEBHOOK_URL)
export const ONE_HOUR = 1000 * 60 * 60
export const THIRTY_SECONDS = 1000 * 30

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