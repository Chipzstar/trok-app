import { EmailParams, Recipient } from 'mailer-send-ts';
import prisma from '../../db';
import { mailerSend, sentFrom, storage } from '../../utils/clients';

/*export async function sendMagicLink(email: string, url: string, provider: ) {
	try {
		const user = await prisma.user.findFirstOrThrow({

		})
		const personalization = [
			{
				email: email,
				data: {
					name: full_name,
					account_name: 'Trok',
					support_email: 'hello@trok.co',
					verification_link: `${process.env.CLIENT_HOST_URL}/?email=${email}&token=${token}`
				}
			}
		];
		// send email verification link
		const emailParams = new EmailParams()
			.setFrom(sentFrom)
			.setTo([new Recipient(email, full_name)])
			.setSubject('Trok - Verify your email')
			.setTemplateId('v69oxl5e0zrl785k')
			.setPersonalization(personalization);
		const response = await mailerSend.email.send(emailParams);
		console.log(response);
		return response;
	} catch (err) {
		console.error(err);
		throw err;
	}
}*/

export const generateDownloadUrl = async (filepath: string) => {
	try {
		// Get a v4 signed URL for reading the file
		const file = storage.bucket(String(process.env.GCS_BUCKET_NAME)).file(filepath);
		// make the file publicly accessible
		const data = await file.makePublic();
		console.log(data[0]);
		const publicUrl = file.publicUrl();
		console.log('Download URL', publicUrl);
		console.log('You can use this URL with any user agent, for example:');
		return publicUrl;
	} catch (err) {
		console.error(err);
		throw err;
	}
};
