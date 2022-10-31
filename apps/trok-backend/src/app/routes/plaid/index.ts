import * as express from 'express';
import { plaid } from '../../utils/clients';
import { CountryCode, DepositoryAccountSubtype, PaymentAmountCurrency, Products } from 'plaid';
import { getE164Number } from '@trok-app/shared-utils';
import * as util from 'util';
import { v4 as uuidv4 } from 'uuid';

const PLAID_REDIRECT_URI = String(process.env.PLAID_REDIRECT_URI);
const PLAID_COUNTRY_CODES = [CountryCode.Gb]
const PLAID_PRODUCTS = [Products.Auth, Products.Transactions, Products.PaymentInitiation]
const CLIENT_NAME = "Trok"
let PUBLIC_TOKEN;
let ACCESS_TOKEN;
let ITEM_ID;
let PAYMENT_ID;
const router = express.Router();

export const prettyPrintResponse = (response: { data: any }) => {
	console.log(util.inspect(response.data, { colors: true, depth: 4 }));
};

router.post('/create_link_token', async function (req, res, next) {
	try {
		const { user_id, email, phone } = req.body;
		const createTokenResponse = await plaid.linkTokenCreate({
			user: {
				// This should correspond to a unique id for the current user.
				client_user_id: user_id || uuidv4(),
				email_address: email,
				phone_number: getE164Number(phone)
			},
			client_name: CLIENT_NAME,
			products: PLAID_PRODUCTS,
			country_codes: PLAID_COUNTRY_CODES,
			language: 'en',
			redirect_uri: PLAID_REDIRECT_URI,
			account_filters: {
				depository: {
					account_subtypes: [DepositoryAccountSubtype.Checking, DepositoryAccountSubtype.Savings]
				}
			}
		});
		const linkToken = createTokenResponse.data.link_token;
		res.status(200).json({ link_token: linkToken });
	} catch (err) {
		console.error(err);
		next(err);
	}
});

router.post('/create_link_token_for_payment', async (req, response, next) => {
	try {
		const { user_id, amount, reference } = req.body;
		console.table(req.body)
		const createRecipientResponse = await plaid.paymentInitiationRecipientCreate({
			name: 'Chisom Oguibe',
			bacs: {
				account: "20032891",
				sort_code: "207291"
			},
			address: {
				street: ['4 Privet Drive'],
				city: 'Little Whinging',
				postal_code: '11111',
				country: 'GB'
			}
		});
		const recipientId = createRecipientResponse.data.recipient_id;
		prettyPrintResponse(createRecipientResponse);

		const createPaymentResponse = await plaid.paymentInitiationPaymentCreate({
			recipient_id: recipientId,
			reference: reference,
			amount: {
				value: amount,
				currency: PaymentAmountCurrency.Gbp
			}
		});
		prettyPrintResponse(createPaymentResponse);
		const payment_id = createPaymentResponse.data.payment_id;

		// We store the payment_id in memory for demo purposes - in production, store it in a secure
		// persistent data store along with the Payment metadata, such as userId.
		PAYMENT_ID = payment_id;
		const configs = {
			client_name: CLIENT_NAME,
			user: {
				// This should correspond to a unique id for the current user.
				// Typically, this will be a user ID number from your application.
				// Personally identifiable information, such as an email address or phone number, should not be used here.
				client_user_id: user_id || uuidv4()
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
		};
		const createTokenResponse = await plaid.linkTokenCreate(configs);
		console.log('************************************************');
		console.log(createTokenResponse)
		console.log('************************************************');
		response.json(createTokenResponse.data);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

router.post('/api/set_access_token', async (req, res, next) => {
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
		console.error(err);
		next(err)
	}
});

export default router;
