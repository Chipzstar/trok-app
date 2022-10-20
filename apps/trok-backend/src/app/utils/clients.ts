import Stripe from 'stripe';
import { MailerSend, Sender } from 'mailer-send-ts';
import { Storage } from '@google-cloud/storage';

export const stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY), {
	apiVersion: '2022-08-01'
});

export const mailerSend = new MailerSend({ apiKey: String(process.env.MAILERSEND_API_KEY) });

export const storage = new Storage({
	projectId: process.env.GCS_PROJECT_ID,
	credentials: {
		client_id: process.env.GCS_CLIENT_ID,
		client_email: process.env.GCS_CLIENT_EMAIL,
		private_key: process.env.GCS_PRIVATE_KEY
	}
});

export const sentFrom = new Sender("hello@trok.co", "Ola Oladapo");
