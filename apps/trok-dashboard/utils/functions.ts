import CryptoJS from 'crypto-js'

interface selectInput {
	value: string;
	label: string;
}

export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

}
export function sanitize(str: string): string {
	return str.replace(/[_-]/g, ' ').toLowerCase();
}

export function uniqueArray(array: selectInput[], key) {
	return [...new Map(array.map(item => [item[key], item])).values()];
}

export function decryptPassword(password: string) {
	let decryptedPassword =''
	if (password) {
		const bytes = CryptoJS.AES.decrypt(password, process.env.ENC_SECRET)
		decryptedPassword = JSON.parse(bytes.toString());
	}
	return decryptedPassword
}