import qs from 'qs';
import Stripe from 'stripe';
import { plaid, stripe } from '../../utils/clients';
import dayjs from 'dayjs';
import axios from 'axios';
import { prettyPrintResponse } from '../../utils/helpers';
import prisma from '../../db';
import redisClient from '../../redis';
import { STATEMENT_REDIS_SORTED_SET_ID } from '../../utils/constants';
import { FuelMerchantCategoryCodes, TransactionStatus } from '@trok-app/shared-utils';

export const handleAuthorizationRequest = async (auth: Stripe.Issuing.Authorization) => {
	// Authorize the transaction.
	console.log('-----------------------------------------------');
	console.log(auth);
	console.log('-----------------------------------------------');
	let res,
		status: TransactionStatus = 'declined';
	try {
		// find the card associated with the authorisation
		const card = await prisma.card.findUniqueOrThrow({
			where: {
				card_id: auth.card.id
			},
			select: {
				id: true,
				last4: true,
				cardholder_id: true,
				driver: {
					select: {
						id: true,
						full_name: true
					}
				},
				user: {
					select: {
						id: true,
						stripe: true
					}
				}
			}
		});
		if (FuelMerchantCategoryCodes.find(item => item === auth.merchant_data.category_code)) {
			res = await stripe.issuing.authorizations.approve(
				auth.id,
				{},
				{ stripeAccount: card.user.stripe.accountId }
			);
			status = 'approved';
			console.log('************************************************');
			console.log('APPROVED:', res);
			console.log('************************************************');
		} else {
			res = await stripe.issuing.authorizations.decline(
				auth.id,
				{},
				{ stripeAccount: card.user.stripe.accountId }
			);
			status = 'declined';
			console.log('************************************************');
			console.log('DECLINED:', res);
			console.log('************************************************');
		}
		await prisma.transaction.create({
			data: {
				authorization_id: auth.id,
				transaction_id: auth.id,
				driverId: card.driver.id,
				userId: card.user.id,
				cardId: auth.card.id,
				cardholder_id: card.cardholder_id,
				cardholder_name: card.driver.full_name,
				transaction_amount: auth.amount,
				merchant_amount: auth.merchant_amount,
				transaction_type: 'capture',
				merchant_data: {
					name: auth.merchant_data.name ?? '',
					category: auth.merchant_data.category,
					category_code: auth.merchant_data.category_code,
					network_id: auth.merchant_data.network_id,
					city: auth.merchant_data.city ?? '',
					region: auth.merchant_data.state ?? '',
					postcode: auth.merchant_data.postal_code ?? '',
					country: auth.merchant_data.country ?? ''
				},
				last4: card.last4,
				status
			}
		});
		return res;
	} catch (err) {
		console.error(err);
		return null;
	}
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
		// @ts-ignore
		console.error(err.response.data);
		throw err;
	}
};

export const fetchIssuingAccount = async (account: Stripe.Account) => {
	try {
		const {
			bank_transfer: { financial_addresses }
		} = await fetchFundingDetails(account.id);
		console.log(financial_addresses);
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
		const { recipient_id, request_id } = createRecipientResponse.data;
		prettyPrintResponse(createRecipientResponse);
		return {
			plaid_recipient_id: recipient_id,
			plaid_request_id: request_id,
			account_holder_name: 'Stripe Payments UK Limited',
			account_number: financial_addresses[0].sort_code.account_number as string,
			sort_code: financial_addresses[0].sort_code.sort_code as string
		};
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export const updateTransaction = async (t: Stripe.Issuing.Transaction) => {
	try {
		const card = await prisma.card.findUniqueOrThrow({
			where: {
				card_id: <string>t.card
			},
			select: {
				id: true,
				last4: true,
				cardholder_id: true,
				driver: {
					select: {
						id: true,
						full_name: true
					}
				},
				user: {
					select: {
						id: true
					}
				}
			}
		});
		// check to see if user id is recorded in the redis statement scheduler
		const zrank = await redisClient.zrank(STATEMENT_REDIS_SORTED_SET_ID, card.user.id);
		if (zrank === null) {
			// add member to sorted set for scheduling statement generation
			redisClient.zadd(STATEMENT_REDIS_SORTED_SET_ID, dayjs().endOf('week').unix(), card.user.id);
			redisClient.hmset(card.user.id, 'period_start', dayjs().unix(), 'period_end', dayjs().endOf('week').unix());
		}
		return await prisma.transaction.update({
			where: {
				authorization_id: String(t.authorization)
			},
			data: {
				transaction_id: t.id,
				transaction_type: t.type,
				transaction_amount: Math.abs(t.amount),
				merchant_amount: Math.abs(t.merchant_amount),
				...(t?.purchase_details?.fuel && {
					purchase_details: {
						set: {
							volume: Number(t.purchase_details.fuel.volume_decimal),
							unit_cost_decimal: Number(t.purchase_details.fuel.unit_cost_decimal),
							fuel_type: t.purchase_details.fuel?.type,
							unit_type: t.purchase_details.fuel?.unit
						}
					}
				}),
				status: 'approved'
			}
		});
	} catch (err) {
		console.error(err);
		return null;
	}
};

export const updateCard = async (c: Stripe.Issuing.Card) => {
	try {
		// auto update the card status, shipping status and spending limits in the database
		return await prisma.card.update({
			where: {
				card_id: c.id
			},
			data: {
				status: c.status,
				...(c?.shipping?.status && { shipping_status: c.shipping.status })
			}
		});
	} catch (err) {
		return err;
	}
};
