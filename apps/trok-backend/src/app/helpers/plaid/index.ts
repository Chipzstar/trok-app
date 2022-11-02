import { PaymentInitiationPaymentGetRequest, PaymentInitiationPaymentStatus, PaymentStatusUpdateWebhook } from 'plaid';
import prisma from '../../db';
import { plaid } from '../../utils/clients';
import { PAYMENT_STATUS } from '@trok-app/shared-utils';

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
						plaid_payment_status: event.new_payment_status,
						status: convertPlaidStatus(event.new_payment_status)
					}
				});
		}
	} catch (err) {
		console.error(err);
		throw err;
	}
};
