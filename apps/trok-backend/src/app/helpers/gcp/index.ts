import { storage } from '../../utils/clients';

export const generateDownloadUrl = async (filepath: string) => {
	try {
		const bucket = storage.bucket(String(process.env.GCS_BUCKET_NAME));
		const file = bucket.file(filepath);
		// make the file publicly accessible
		await file.makePublic();
		// @ts-ignore
		const publicUrl = file.publicUrl();
		console.log('Download URL', publicUrl);
		return publicUrl;
	} catch (err) {
		console.error(err);
		throw err;
	}
};