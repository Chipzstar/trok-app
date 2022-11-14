import { PrismaClient } from '@prisma/client';
import { decrypt, encrypt } from '@trok-app/shared-utils';

declare global {
	// eslint-disable-next-line no-var
	var prisma: PrismaClient | undefined;
}

const prisma =
	global.prisma ||
	new PrismaClient({
		log:
			process.env['NODE_ENV'] === 'development'
				? ['error', 'warn']
				: ['error'],
	});

prisma.$use(async (params, next) => {
	if (params.model == 'BankAccount' && params.action == 'create') {
		params.args.data.account_number = encrypt(
			params.args.data.account_number,
			String(process.env.ENC_SECRET)
		);
	}
	return next(params)
})

if (process.env['NODE_ENV'] !== 'production') {
	global.prisma = prisma;
}

export default prisma;