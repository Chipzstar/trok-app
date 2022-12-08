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

export async function sendPasswordResetLink(email: string, full_name: string, token: string) {
	try {
		const personalization = [
			{
				email: email,
				data: {
					name: full_name,
					account_name: 'Trok',
					support_email: 'hello@trok.co',
					action_url: `${process.env.CLIENT_HOST_URL}/reset-password?email=${email}&token=${token}`,
					logo_blue: "https://bucket.mailersendapp.com/k68zxl2p8m4j9057/351ndgwzvqqgzqx8/images/978a1ab1-ebde-4ea7-9ff2-9e87b5cc2418.svg",
					logo_black: "https://bucket.mailersendapp.com/k68zxl2p8m4j9057/351ndgwzvqqgzqx8/images/978a1bbb-d742-40c7-882f-55cb93c5b824.svg"
				}
			}
		];
		// send email verification link
		const emailParams = new EmailParams()
			.setFrom(sentFrom)
			.setTo([new Recipient(email, full_name)])
			.setSubject('Trok - Reset your password')
			.setTemplateId('0r83ql32evx4zw1j')
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
		return await mailerSend.email.send(emailParams);
	} catch (err) {
	    console.error(err);
		throw err;
	}
}
