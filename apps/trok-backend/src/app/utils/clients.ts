import Stripe from 'stripe';
import { MailerSend, Sender } from 'mailer-send-ts';


export const stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY), {
	apiVersion: '2022-08-01'
});

export const mailerSend = new MailerSend({ apiKey: String(process.env.MAILERSEND_API_KEY) });

export const sentFrom = new Sender("hello@trok.co", "Ola Oladapo");
