import { EmailParams, Recipient } from 'mailer-send-ts';
import prisma from '../../db';
import { mailerSend, sentFrom } from '../../utils/clients';
import { v4 as uuidv4 } from 'uuid';

async function sendMagicLink(email: string, url: string) {
	try {
		const user = await prisma.user.findFirstOrThrow({
			where: {
                email: email
            }
		})
		const personalization = [
			{
				email: email,
				data: {
					name: user.full_name,
					account_name: 'Trok',
					support_email: 'hello@trok.co',
					verification_link: `${process.env.CLIENT_HOST_URL}/?email=${email}&token=${uuidv4()}`
				}
			}
		];
		// send email verification link
		const emailParams = new EmailParams()
			.setFrom(sentFrom)
			.setTo([new Recipient(email, user.full_name)])
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
