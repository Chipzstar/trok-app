import { storage } from '../../utils/clients';

export const generateDownloadUrl = async (filepath: string) => {
	try {
		const bucket = storage.bucket(String(process.env.GCS_BUCKET_NAME));
		console.log(bucket);
		const file = bucket.file(filepath);
		// make the file publicly accessible
		const data = await file.makePublic();
		console.log(data[0]);
		// @ts-ignore
		const publicUrl = file.publicUrl();
		console.log('Download URL', publicUrl);
		console.log('You can use this URL with any user agent, for example:');
		return publicUrl;
	} catch (err) {
		console.error(err);
		throw err;
	}
};