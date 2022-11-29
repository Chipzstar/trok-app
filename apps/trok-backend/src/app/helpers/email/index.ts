import { EmailParams, Recipient } from 'mailer-send-ts';
import { mailerSend, sentFrom } from '../../utils/clients';

export async function sendVerificationLink(email: string, full_name: string, token: string) {
	try {
		const personalization = [
			{
				email: email,
				data: {
					name: full_name,
					account_name: 'Trok',
					support_email: 'hello@trok.co',
					verification_link: `${process.env.CLIENT_HOST_URL}/verify-email?email=${email}&token=${token}`
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
}

export async function sendNewSignupEmail(email: string, full_name: string){
	try {
		const personalization = [
			{
				email: email,
				data: {
					name: full_name,
					account_name: 'Trok',
					support_email: 'hello@trok.co'
				}
			}
		];
		// send email verification link
		const emailParams = new EmailParams()
			.setFrom(sentFrom)
			.setTo([new Recipient(email, full_name)])
			.setSubject('Trok - Verify your email')
			.setTemplateId('yzkq3402pk6gd796')
			.setPersonalization(personalization);
		const response = await mailerSend.email.send(emailParams);
		console.log(response);
		return response;
	} catch (err) {
	    console.error(err);
		throw err;
	}
}
