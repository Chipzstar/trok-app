import CryptoJS from 'crypto-js'
import { apiClient } from './clients';
import { SendVerificationRequestParams } from 'next-auth/providers/email';
import prisma from '../../trok-backend/src/app/db';
import { EmailParams, Recipient } from 'mailer-send-ts';

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

/*export async function sendMagicLink(params: SendVerificationRequestParams) {
	try {
		const user = await prisma.user.findFirstOrThrow({
			where: {
				email: params.identifier
			}
		})
		/!*const transport = createTransport(provider.server)
		const result = await transport.sendMail({
			to: identifier,
			from: provider.from,
			subject: `Trok - Verify your email`,
			text: text({ url, full_name }),
			html: html({ url, host, theme }),
		})
		const failed = result.rejected.concat(result.pending).filter(Boolean)
		if (failed.length) {
			throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`)
		}*!/
		const personalization = [
			{
				email: params.identifier,
				data: {
					name: user.full_name,
					account_name: 'Trok',
					support_email: 'hello@trok.co',
					verification_link: params.url
				}
			}
		];
		// send email verification link
		const emailParams = new EmailParams()
			.setFrom(sentFrom)
			.setTo([new Recipient(params.identifier, user.full_name)])
			.setSubject('Trok - Verify your email')
			.setTemplateId('v69oxl5e0zrl785k')
			.setPersonalization(personalization);
		const response = await mailerSend.email.send(emailParams);
		console.log(response);
	} catch (err) {
		console.error(err);
		throw err;
	}
}*/

export function text({url, full_name}) {
	return `Hey, ${full_name}!\n` +
		"\n" +
		"To verify your email with Trok, simply click on the link below or paste it into the url field on your favourite browser: This link is only valid for the next 24 hours.\n" +
		"\n" +
		url + "\n" +
		"\n" +
		"We're here to help\n" +
		"\n" +
		"If you have any questions or want more information, drop us a message at hello@trok.co.\n" +
		"\n" +
		"- The Trok Team\n" +
		"\n" +
		"© 2022 Trok. All rights reserved.\n"
}