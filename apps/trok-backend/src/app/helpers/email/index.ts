import { EmailParams, Recipient } from 'mailer-send-ts';
import { mailerSend, sentFrom } from '../../utils/clients';

export async function sendMagicLink(email: string, full_name: string, token: string) {
	const personalization = [
		{
			email: email,
			data: {
				name: full_name,
				account_name: 'Trok',
				support_email: 'hello@trok.co',
				verification_link: `https://trok-app-dev.onrender.com/verify?email=${email}&token=${token}`
			}
		}
	];
	try {
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
}