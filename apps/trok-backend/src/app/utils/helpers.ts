// create key string
import * as util from 'util';
import prisma from '../db';

export const getEmailIPkey = (email: string, ip: string) => `${email}_${ip}`;

export const prettyPrintResponse = (response: { data: any }) => {
	console.log(util.inspect(response.data, { colors: true, depth: 4 }));
};

export const validateReferralCode = async (code: any): Promise<boolean> => {
	try {
		let user = await prisma.user.findFirst({
			where: {
				referral_code: code
			},
			select: {
                referral_code: true
            }
		})
		return !!user;
	} catch(error) {
		console.log(error)
		// @ts-ignore
		throw new Error(error?.message)
	}
}

