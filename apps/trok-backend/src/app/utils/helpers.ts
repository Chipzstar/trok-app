// create key string
import * as util from 'util';
import bcrypt from 'bcryptjs';

export const getEmailIPkey = (email: string, ip: string) => `${email}_${ip}`;

export const prettyPrintResponse = (response: { data: any }) => {
	console.log(util.inspect(response.data, { colors: true, depth: 4 }));
};

export async function hashPassword(password: string, salt_rounds=10) {
	const salt = await bcrypt.genSalt(salt_rounds)
	const hashed_password = await bcrypt.hash(password, salt)
	console.log(hashed_password)
	return hashed_password
}