import Stripe from 'stripe';
import { MailerSend, Sender } from 'mailersend';
import { Storage } from '@google-cloud/storage';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

export const stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY), {
	apiVersion: '2022-11-15'
});

const plaidConfig = new Configuration({
	basePath:
		process.env.PLAID_ENV === 'production'
			? PlaidEnvironments.production
			: process.env.PLAID_ENV === 'development'
			? PlaidEnvironments.development
			: PlaidEnvironments.sandbox,
	baseOptions: {
		headers: {
			'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
			'PLAID-SECRET': process.env.PLAID_SECRET
		}
	}
});

export const plaid = new PlaidApi(plaidConfig);

export const storage = new Storage({
	projectId: process.env.GCS_PROJECT_ID,
	credentials: {
		client_id: process.env.GCS_CLIENT_ID,
		client_email: process.env.GCS_CLIENT_EMAIL,
		private_key: process.env.GCS_PRIVATE_KEY
	}
});

export const mailerSend = new MailerSend({ apiKey: String(process.env.MAILERSEND_API_KEY) });

export const sentFrom = new Sender('hello@trok.co', 'Ola Oladapo');
