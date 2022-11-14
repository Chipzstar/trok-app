import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider, { SendVerificationRequestParams } from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '../../../prisma';
import { v4 as uuidv4 } from 'uuid';
import * as nodemailer from 'nodemailer';
import { comparePassword, html, text } from '../../../utils/functions';

export async function sendMagicLink({ identifier, url, provider, token, expires }: SendVerificationRequestParams) {
	try {
		const user = await prisma.user.findFirstOrThrow({
			where: {
				email: identifier
			}
		});
		const transport = nodemailer.createTransport(provider.server);
		const result = await transport.sendMail({
			to: identifier,
			from: provider.from,
			subject: `Trok - Verify your email`,
			text: text({ url, full_name: user.full_name }),
			html: html({url, full_name: user.full_name})
		});
		const failed = result.rejected.concat(result.pending).filter(Boolean);
		if (failed.length) {
			throw new Error(`Email(s) (${failed.join(', ')}) could not be sent`);
		}
	} catch (err) {
		console.error(err);
		throw err;
	}
}

const providers = [
	EmailProvider({
		id: 'email',
		server: {
			host: process.env.MAILERSEND_SMTP_HOST,
			port: process.env.MAILERSEND_SMTP_PORT,
			auth: {
				user: process.env.MAILERSEND_SMTP_USERNAME,
				pass: process.env.MAILERSEND_SMTP_PASSWORD
			}
		},
		from: 'hello@trok.co',
		sendVerificationRequest: sendMagicLink
	}),
	CredentialsProvider({
		id: 'credentials',
		type: 'credentials',
		name: 'Credentials',
		credentials: {
			email: { label: 'Email', type: 'email' },
			password: { label: 'Password', type: 'password' }
		},
		async authorize(credentials, req) {
			// Add logic here to look up the user from the credentials supplied
			if (credentials == null) return null;
			const { created_at, updated_at, ...user } = await prisma.user.findFirst({
				where: {
					email: {
						equals: credentials.email
					}
				}
			});
			if (user) {
				// compare entered password with stored hash
				const salt = await comparePassword(credentials.password, user.password)
				// Any object returned will be saved in `user` property of the JWT
				return salt ? user : null;
			} else {
				// If you return null then an error will be displayed advising the user to check their details.
				return null;
			}
		}
	})
];

const callbacks = {
	signIn: async ({ user, account, email, credentials }) => {
		if (account.provider === 'credentials') {
			user.accessToken = uuidv4();
			return true;
		} else if (account.provider === 'email') {
			console.log(user)
			console.log('-----------------------------------------------');
			console.log(account)
			return true;
		}
		return false;
	},
	jwt: async ({ token, user }) => {
		if (user) {
			token.id = user.id;
			token.user = {
				...user,
				accountId: user.stripe.accountId,
				personId: user.stripe.personId,
				password: undefined,
				stripe: undefined
			};
		}
		return token;
	},
	session: async ({ session, token }) => {
		session.id = token.id;
		session.stripe = {
			account_id: token.user.accountId,
			person_id: token.user.personId
		};
		session.user.name = token.user.firstname + ' ' + token.user.lastname;
		return session;
	}
};

const pages = {
	error: '/login',
	signIn: '/login',
	verifyRequest: '/verify-email',
};

export const authOptions = {
	adapter: PrismaAdapter(prisma),
	providers,
	pages,
	callbacks,
	session: {
		// Set to jwt in order to CredentialsProvider works properly
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60 // 30 days
	},
	jwt: {
		encryption: true
	},
	debug: process.env.NODE_ENV !== 'production'
};

// @ts-ignore
export default (req, res) => NextAuth(req, res, authOptions);
