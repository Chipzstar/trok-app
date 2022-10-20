import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from '../../../prisma';
import { apiClient } from '../../../utils/clients';
import { v4 as uuidv4} from 'uuid';

const providers = [
	CredentialsProvider({
		id: 'credentials',
		type: "credentials",
		name: 'Credentials',
		credentials: {
			email: { label: 'Email', type: 'email' },
			password: { label: 'Password', type: 'password' }
		},
		async authorize(credentials, req) {
			// Add logic here to look up the user from the credentials supplied
			if (credentials == null) return null;
			const { createdAt, updatedAt, ...user } = await prisma.user.findFirst({
				where: {
					email: {
						equals: credentials.email
					},
					password: {
						equals: credentials.password
					}
				}
			});
			if (user) {
				// Any object returned will be saved in `user` property of the JWT
				console.log(user);
				return user;
			} else {
				// If you return null then an error will be displayed advising the user to check their details.
				return null;
			}
		}
	})
];

const callbacks = {
	signIn: async ({user, account, email, credentials}) => {
		console.log("Email:", email)
		if (account.provider === 'credentials') {
			console.log("USER:", user);
			user.accessToken = uuidv4();
			return true;
		}
		return false;
	},
	jwt: async ({token, user}) => {
		if (user) {
			token.id = user.id;
		}
		return token;
	},
	session: async ({session, token}) => {
		session.id = token.id
		return session;
	}
};

const pages = {
	error: '/login',
	signIn: '/login'
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
