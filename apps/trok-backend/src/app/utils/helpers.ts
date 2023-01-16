// create key string
import * as util from 'util';
import prisma from '../db';
import jwt_decode, { JwtPayload } from 'jwt-decode';

export const getEmailIPkey = (email: string, ip: string) => `${email}_${ip}`;

export const prettyPrintResponse = (response: { data: any }) => {
	console.log(util.inspect(response.data, { colors: true, depth: 4 }));
};

export const prettyPrint = (data: any) => {
	console.log('************************************************');
	console.log(JSON.stringify(data, null, 2));
	console.log('************************************************');
}

export const validateReferralCode = async (code: any): Promise<boolean> => {
	try {
		const user = await prisma.user.findFirst({
			where: {
				referral_code: code
			},
			select: {
				referral_code: true
			}
		});
		return !!user;
	} catch (error) {
		console.log(error);
		// @ts-ignore
		throw new Error(error?.message);
	}
};

export const decodeAndVerifyJwtToken = async (token: any): Promise<{ is_admin: boolean }> => {
	try {
		const decoded = jwt_decode<JwtPayload>(token);
		console.log(decoded);
		return { is_admin: true };
	} catch (err) {
		console.error(err);
		throw err;
	}
};
