import {
	PaymentInitiationPaymentGetRequest,
	PaymentInitiationPaymentStatus,
	PaymentStatusUpdateWebhook,
} from 'plaid';
import prisma from '../../db';
import { plaid } from '../../utils/clients';
import { PAYMENT_STATUS } from '@trok-app/shared-utils';
import { PLAID_CLIENT_NAME, PLAID_COUNTRY_CODES, PLAID_PRODUCTS, PLAID_REDIRECT_URI } from '../../utils/constants';

export function convertPlaidStatus(status: string) {
	switch (status) {
		case PaymentInitiationPaymentStatus.Blocked:
			return PAYMENT_STATUS.FAILED;
		case PaymentInitiationPaymentStatus.Initiated:
			return PAYMENT_STATUS.IN_PROGRESS;
		case PaymentInitiationPaymentStatus.Cancelled:
			return PAYMENT_STATUS.CANCELLED;
		case PaymentInitiationPaymentStatus.Authorising:
			return PAYMENT_STATUS.IN_PROGRESS;
		case PaymentInitiationPaymentStatus.Completed:
			return PAYMENT_STATUS.COMPLETE;
		case PaymentInitiationPaymentStatus.Failed:
			return PAYMENT_STATUS.FAILED;
		case PaymentInitiationPaymentStatus.Processing:
			return PAYMENT_STATUS.IN_PROGRESS;
		case PaymentInitiationPaymentStatus.InsufficientFunds:
			return PAYMENT_STATUS.FAILED;
		case PaymentInitiationPaymentStatus.Executed:
			return PAYMENT_STATUS.COMPLETE;
		default:
			return PAYMENT_STATUS.PENDING;
	}
}

export const handlePaymentInitiation = async (event: PaymentStatusUpdateWebhook) => {
	try {
		switch (event.webhook_code) {
			case 'PAYMENT_STATUS_UPDATE':
				// search db for a payment with matching plaid_payment_id
				let payment = await prisma.payment.findUniqueOrThrow({
					where: {
						plaid_payment_id: event.payment_id
					}
				});
				// use the payment_id to retrieve the full payment object from plaid
				const request: PaymentInitiationPaymentGetRequest = {
					payment_id: event.payment_id
				};
				const plaid_payment = await plaid.paymentInitiationPaymentGet(request);
				console.log('-----------------------------------------------');
				console.log(plaid_payment.data);
				console.log('-----------------------------------------------');
				payment = await prisma.payment.update({
					where: {
						plaid_payment_id: event.payment_id
					},
					data: {
						plaid_payment_status: plaid_payment.data.status,
						status: convertPlaidStatus(plaid_payment.data.status)
					}
				});
				console.log("updated payment!")
				console.log('************************************************');
				console.table(payment)
				break;
			default:
				console.log("Unrecognized webhook code")
				break;
		}
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export const generateLinkToken = async (
	client_user_id: string,
	phone_number: string,
	webhook: string,
	payment_id: string,
	institution_id: string
) => {
	try {
		const createTokenResponse = (
			await plaid.linkTokenCreate({
				client_name: PLAID_CLIENT_NAME,
				user: {
					// This should correspond to a unique id for the current user.
					// Typically, this will be a user ID number from your application.
					// Personally identifiable information, such as an email address or phone number, should not be used here.
					client_user_id
				},
				webhook,
				// Institutions from all listed countries will be shown.
				country_codes: PLAID_COUNTRY_CODES,
				language: 'en',
				// The 'payment_initiation' product has to be the only element in the 'products' list.
				products: PLAID_PRODUCTS,
				payment_initiation: {
					payment_id
				},
				institution_id,
				redirect_uri: PLAID_REDIRECT_URI
			})
		).data;
		console.log('************************************************');
		console.log(createTokenResponse);
		console.log('************************************************');
		return createTokenResponse;
	} catch (err) {
		//@ts-ignore
		console.error(err?.response?.data ?? err);
		throw err;
	}
};
