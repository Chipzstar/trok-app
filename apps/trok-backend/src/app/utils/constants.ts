import { CountryCode, Products } from 'plaid';
import { storage } from './clients';

export const SENTRY_DSN = process.env.SENTRY_DSN || "https://0e2b765e0dcb44b197705007a5612a2d@o4503959141679104.ingest.sentry.io/4503959143448576"
export const ENVIRONMENT = process.env.DOPPLER_ENVIRONMENT
//GCP
export const BUCKET = storage.bucket(String(process.env.GCS_BUCKET_NAME));
export const STATEMENT_REDIS_SORTED_SET_ID = 'upcoming_statements'
export const PLAID_CLIENT_NAME = 'Trok';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'
export const PLAID_REDIRECT_URI = String(process.env.PLAID_REDIRECT_URI);
export const PLAID_COUNTRY_CODES = [CountryCode.Gb];
export const PLAID_PRODUCTS = [Products.PaymentInitiation];
export const PLAID_WEBHOOK_URL = String(process.env.PLAID_WEBHOOK_URL)
export const STRIPE_TEST_MODE = String(process.env.STRIPE_SECRET_KEY).includes('sk_test')

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