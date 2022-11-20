import express from 'express';
import { EmailParams, Recipient } from 'mailer-send-ts';
import { mailerSend, sentFrom } from '../utils/clients';

const router = express.Router();

router.get('/user-agent', async (req, res, next) => {
	try {
		console.log(req.ip);
		console.log(req.get('User-Agent'));
		res.status(200).send(Date.now());
	} catch (err) {
		console.error(err);
		next(err);
	}
});

router.post('/send-approval-email', async (req, res, next) => {
	const { email, name } = req.body;
	try {
		const recipients = [new Recipient(email, name)];
		const personalization = [
			{
				email,
				data: {
					name,
					account_name: 'Trok',
					support_email: 'hello@trok.co'
				}
			}
		];
		const emailParams = new EmailParams()
			.setFrom(sentFrom)
			.setTo(recipients)
			.setSubject('Trok: Your Application has been Approved!')
			.setTemplateId('pq3enl6xk70l2vwr')
			.setPersonalization(personalization);
		const response = await mailerSend.email.send(emailParams);
		res.status(200).json({ statusCode: response.statusCode, message: 'Approval email sent!' });
	} catch (err) {
		console.error(err);
		res.status(500).json(err);
	}
});

export default router;