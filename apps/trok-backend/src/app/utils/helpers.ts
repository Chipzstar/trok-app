// create key string
import * as util from 'util';

export const getEmailIPkey = (email: string, ip: string) => `${email}_${ip}`;

export const prettyPrintResponse = (response: { data: any }) => {
	console.log(util.inspect(response.data, { colors: true, depth: 4 }));
};