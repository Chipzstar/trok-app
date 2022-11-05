import express from 'express';
import { plaid } from '../../utils/clients';
import { prettyPrintResponse } from '../../utils/helpers';
import { handlePaymentInitiation } from '../../helpers/plaid';

let PUBLIC_TOKEN;
let ACCESS_TOKEN;
let ITEM_ID;
const router = express.Router();

router.post('/webhook', async (req, res, next) => {
	try {
		const event = req.body;
		// switch case by webhook event type
		switch(event.webhook_type) {
			case 'PAYMENT_INITIATION':
                await handlePaymentInitiation(event)
				break;
			default:
				break;
		}
		res.status(200).json({ received: true, ...req.body });
	} catch (err) {
		console.error(err);
		res.json({ received: true });
	}
});

/*router.post('/top-up-issuing-balance', async (req, response, next) => {
	try {
		const { user_id, stripe_account_id, amount, reference } = req.body;
		// fetch the default bank account
		const bankAccount = await prisma.bankAccount.findFirstOrThrow({
			where: {
				userId: user_id,
				is_default: true
			},
			select: {
				stripe_bank_id: true,
				account_number: true,
				sort_code: true,
				user: {
					select: {
						phone: true,
						email: true
					}
				}
			}
		});
		console.log('-----------------------------------------------');
		console.log('DEFAULT BANK ACCOUNT:', bankAccount);
		console.log('-----------------------------------------------');
		// fetch the stripe funding account bank details
		const stripeFundingAccount = await fetchFundingDetails(stripe_account_id)
		console.log(stripeFundingAccount.bank_transfer.financial_addresses);
		console.log('-----------------------------------------------');
		// Create PLAID Recipient
		const createRecipientResponse = await plaid.paymentInitiationRecipientCreate({
			name: 'Stripe Payments UK Limited',
			bacs: {
				account: stripeFundingAccount['bank_transfer'].financial_addresses[0].sort_code.account_number,
				sort_code: stripeFundingAccount['bank_transfer'].financial_addresses[0].sort_code.sort_code
			},
			address: {
				street: ['Orrick Herrington & Sutcliff', '107 Cheapside'],
				city: 'London',
				postal_code: 'EC2V 6DN',
				country: 'GB'
			}
		});
		const recipient_id = createRecipientResponse.data.recipient_id;
		prettyPrintResponse(createRecipientResponse);
		const routing_number = bankAccount.sort_code.replace(/-/g, '');
		console.log('-----------------------------------------------');
		console.log(routing_number);
		const createPaymentResponse = await plaid.paymentInitiationPaymentCreate({
			recipient_id,
			reference: reference,
			options: {
				bacs: {
					account: bankAccount.account_number,
					sort_code: routing_number
				}
			},
			amount: {
				value: amount,
				currency: PaymentAmountCurrency.Gbp
			}
		});
		prettyPrintResponse(createPaymentResponse);
		const payment_id = createPaymentResponse.data.payment_id;

		const result = await generateLinkToken(
			user_id,
			bankAccount.user.phone,
			IS_DEVELOPMENT ? "https://1ac4-146-198-166-218.eu.ngrok.io/server/plaid/webhook" : PLAID_WEBHOOK_URL,
			PLAID_SANDBOX ? '021000021' : routing_number,
			payment_id,
			)

		/!*const createTokenResponse = (
			await plaid.linkTokenCreate({
				client_name: PLAID_CLIENT_NAME,
				user: {
					// This should correspond to a unique id for the current user.
					// Typically, this will be a user ID number from your application.
					// Personally identifiable information, such as an email address or phone number, should not be used here.
					client_user_id: user_id || uuidv4(),
					phone_number: bankAccount.user.phone
				},
				webhook: IS_DEVELOPMENT ? "https://1ac4-146-198-166-218.eu.ngrok.io/server/plaid/webhook" : process.env.PLAID_WEBHOOK_URL,
				institution_data: {
					routing_number: PLAID_SANDBOX ? '021000021' : routing_number
				},
				// Institutions from all listed countries will be shown.
				country_codes: PLAID_COUNTRY_CODES,
				language: 'en',
				// The 'payment_initiation' product has to be the only element in the 'products' list.
				products: PLAID_PRODUCTS,
				payment_initiation: {
					payment_id: payment_id
				},
				redirect_uri: PLAID_REDIRECT_URI
			})
		).data;*!/
		// create payment in db
		await prisma.payment.create({
			data: {
				userId: user_id,
				plaid_payment_id: payment_id,
				plaid_link_token: result.link_token,
				plaid_recipient_id: recipient_id,
				recipient_name: "Stripe Payments UK Limited",
				payment_type: "bank_transfer",
				plaid_payment_status: PaymentInitiationPaymentStatus.InputNeeded,
				amount: amount * 100,
				status: convertPlaidStatus(createPaymentResponse.data.status),
				reference
			}
		})
		response.json(result);
	} catch (err) {
		// @ts-ignore
		console.error(err?.response?.data ?? err);
		next(err);
	}
});*/

/*router.post('/pay-external-account', async (req, response, next) => {
	try {
		const { user_id, account_number, sort_code, account_holder_name, amount, reference } = req.body;
		// fetch the default bank account
		const bankAccount = await prisma.bankAccount.findFirstOrThrow({
			where: {
				userId: user_id,
				is_default: true
			},
			select: {
				stripe_bank_id: true,
				account_number: true,
				sort_code: true,
				user: {
					select: {
						phone: true,
						email: true
					}
				}
			}
		});
		console.log('-----------------------------------------------');
		console.log('DEFAULT BANK ACCOUNT:', bankAccount);
		console.log('-----------------------------------------------');
		console.log('-----------------------------------------------');
		// Create PLAID Recipient
		const createRecipientResponse = await plaid.paymentInitiationRecipientCreate({
			name: account_holder_name,
			bacs: {
				account: account_number,
				sort_code: sort_code.replace(/-/g, '')
			}
		});
		const recipient_id = createRecipientResponse.data.recipient_id;
		prettyPrintResponse(createRecipientResponse);
		const routing_number = bankAccount.sort_code.replace(/-/g, '');
		console.log('-----------------------------------------------');
		console.log(routing_number);
		const createPaymentResponse = await plaid.paymentInitiationPaymentCreate({
			recipient_id,
			reference: reference,
			options: {
				bacs: {
					account: bankAccount.account_number,
					sort_code: routing_number
				}
			},
			amount: {
				value: amount,
				currency: PaymentAmountCurrency.Gbp
			}
		});
		prettyPrintResponse(createPaymentResponse);
		const payment_id = createPaymentResponse.data.payment_id;

		const result = await generateLinkToken(
			user_id,
			bankAccount.user.phone,
			IS_DEVELOPMENT ? "https://1ac4-146-198-166-218.eu.ngrok.io/server/plaid/webhook" : PLAID_WEBHOOK_URL,
			PLAID_SANDBOX ? '021000021' : routing_number,
			payment_id,
		)
		/!*const createTokenResponse = (
			await plaid.linkTokenCreate({
				client_name: PLAID_CLIENT_NAME,
				user: {
					// This should correspond to a unique id for the current user.
					// Typically, this will be a user ID number from your application.
					// Personally identifiable information, such as an email address or phone number, should not be used here.
					client_user_id: user_id || uuidv4(),
					phone_number: bankAccount.user.phone
				},
				webhook: IS_DEVELOPMENT ? "https://1ac4-146-198-166-218.eu.ngrok.io/server/plaid/webhook" : process.env.PLAID_WEBHOOK_URL,
				institution_data: {
					routing_number: PLAID_SANDBOX ? '021000021' : routing_number
				},
				// Institutions from all listed countries will be shown.
				country_codes: PLAID_COUNTRY_CODES,
				language: 'en',
				// The 'payment_initiation' product has to be the only element in the 'products' list.
				products: PLAID_PRODUCTS,
				payment_initiation: {
					payment_id: payment_id
				},
				redirect_uri: PLAID_REDIRECT_URI
			})
		).data;*!/
		// create payment in db
		await prisma.payment.create({
			data: {
				userId: user_id,
				plaid_payment_id: payment_id,
				plaid_link_token: result.link_token,
				plaid_recipient_id: recipient_id,
				recipient_name: account_holder_name,
				payment_type: "bank_transfer",
				plaid_payment_status: PaymentInitiationPaymentStatus.InputNeeded,
				amount: amount * 100,
				status: convertPlaidStatus(createPaymentResponse.data.status),
				reference
			}
		})
		response.json(result);
	} catch (err) {
		// @ts-ignore
		console.error(err?.response?.data ?? err);
		next(err);
	}
});*/

// Exchange token flow - exchange a Link public_token for
// an API access_token
// https://plaid.com/docs/#exchange-token-flow
router.post('/set_access_token', async (req, res, next) => {
	try {
		PUBLIC_TOKEN = req.body.public_token;
		const tokenResponse = await plaid.itemPublicTokenExchange({
			public_token: PUBLIC_TOKEN
		});
		prettyPrintResponse(tokenResponse);
		ACCESS_TOKEN = tokenResponse.data.access_token;
		ITEM_ID = tokenResponse.data.item_id;
		res.status(200).json({
			// the 'access_token' is a private token, DO NOT pass this token to the frontend in your production environment
			access_token: ACCESS_TOKEN,
			item_id: ITEM_ID,
			error: null
		});
	} catch (err) {
		// @ts-ignore
		if (err?.response.data) {
			// @ts-ignore
			console.error(err.response.data);
			// @ts-ignore
			next(err.response.data);
		}
		next(err);
	}
});

export default router;
