import { DefaultSession } from 'next-auth';
import Prisma from '@prisma/client';

declare module 'next-auth' {
	/**
	 * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
	 */
	interface Session {
		id: string;
		stripe: {
			account_id: string;
			person_id: string;
		};
		user: {
			name: string;
			email: string;
			company: string;
		} & DefaultSession['user'];
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id: string;
        email: string;
		sub: string;
		iat: number;
		exp: number;
		jti: string;
		user: {
			accountId: string;
			personId: string;
			/** The user's postal address. */
			address: string
		} & Omit<Prisma.User, "password" | "stripe">
	}
}