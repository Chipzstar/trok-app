import { storage } from '../../utils/clients';
import { BUCKET } from '../../utils/constants';

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
export const uploadPDF = (doc: PDFKit.PDFDocument, filename: string, filepath: string) => {
	return new Promise((resolve, reject) => {
		const file = BUCKET.file(filepath);
		doc.pipe(file.createWriteStream())
			.on('finish', () => {
				resolve(`${filename} uploaded successfully`);
			})
			.on('error', err => {
				console.error(err);
				reject(err);
			});
	});
};
/**
 * Downloads a file from Google Cloud Storage and returns the content as a base64 encoded string.
 * @param filepath
 */
export const downloadPDF = async (filepath: string) : Promise<string> => {
    return new Promise((resolve, reject) => {
		const file = BUCKET.file(filepath)
		file.download().then(function(data) {
			const contents = data[0];
			const base64 = contents.toString('base64');
			resolve(base64)
		}).catch(err => {
			console.error()
			reject(err)
		})
	});
}