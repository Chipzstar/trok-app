import * as qs from 'qs';
import Stripe from 'stripe';
import { plaid, stripe } from '../../utils/clients';
import axios from 'axios';
import { prettyPrintResponse } from '../../utils/helpers';

export const handleAuthorizationRequest = async (auth: Stripe.Event.Data.Object) => {
	// Authorize the transaction.
	const auth_obj = <Stripe.Issuing.Authorization>auth;
	const res = await stripe.issuing.authorizations.approve(auth_obj.id);
	console.log(res);
	return res;
};

export const fetchFundingDetails = async (account_id: string) => {
	try {
		// fetch the stripe funding account bank details
		return (
			await axios.post(
				'https://api.stripe.com/v1/issuing/funding_instructions',
				qs.stringify({
					bank_transfer: { type: 'gb_bank_transfer' },
					currency: 'GBP',
					funding_type: 'bank_transfer'
				}),
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
						Authorization: 'Bearer ' + process.env.STRIPE_SECRET_KEY,
						'Stripe-Account': account_id
					}
				}
			)
		).data;
	} catch (err) {
	    console.error(err)
		throw err
	}
}

export const fetchIssuingAccount = async(user_id: string, account: Stripe.Account) => {
	try {
		const { bank_transfer: { financial_addresses } } = await fetchFundingDetails(account.id)
		// create the recipient under the user_id
		const createRecipientResponse = await plaid.paymentInitiationRecipientCreate({
			name: 'Stripe Payments UK Limited',
			bacs: {
				account: financial_addresses[0].sort_code.account_number,
				sort_code: financial_addresses[0].sort_code.sort_code
			},
			address: {
				street: ['Orrick Herrington & Sutcliff', '107 Cheapside'],
				city: 'London',
				postal_code: 'EC2V 6DN',
				country: 'GB'
			}
		});
		const {recipient_id, request_id } = createRecipientResponse.data;
		prettyPrintResponse(createRecipientResponse);
		return {
			plaid_recipient_id: recipient_id,
			plaid_request_id: request_id,
			account_holder_name: 'Stripe Payments UK Limited',
			account_number: financial_addresses[0].sort_code.account_number as string,
			sort_code: financial_addresses[0].sort_code.sort_code as string
		}
	} catch(err) {
		console.error(err)
		throw err
	}
}