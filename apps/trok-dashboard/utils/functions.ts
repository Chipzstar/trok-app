import CryptoJS from 'crypto-js'
import { apiClient } from './clients';

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

export async function uploadFile(file, crn, documentType) {
	try {
		console.table({file, crn, documentType})
		const filename = encodeURIComponent(file.name);
		const res = (await apiClient.get(`/server/gcp/upload?crn=${crn}&filename=${filename}&type=${documentType}`)).data;
		const { url, fields } = res;
		const formData = new FormData();

		Object.entries({ ...fields, file }).forEach(([key, value]: [string, string]) => {
			formData.append(key, value);
		});
		console.log(formData);

		const upload = await fetch(url, {
			method: 'POST',
			body: formData
		});

		if (upload.ok) {
			console.log('Uploaded successfully!');
			console.log(upload);
			return upload;
		} else {
			console.error('Upload failed.', upload.status);
			return upload;
		}
	} catch (error) {
		console.error(error);
		throw error;
	}
}