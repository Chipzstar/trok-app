import qs from 'qs';
import Stripe from 'stripe';
import { plaid, stripe } from '../../utils/clients';
import dayjs from 'dayjs';
import axios from 'axios';
import { prettyPrintResponse } from '../../utils/helpers';
import prisma from '../../db';
import redisClient from '../../redis';
import { CARD_REDIS_SORTED_SET_ID, STATEMENT_REDIS_SORTED_SET_ID, STRIPE_TEST_MODE } from '../../utils/constants';
import {
	CARD_SHIPPING_STATUS,
	FuelMerchantCategoryCodes,
	getDeclineReason,
	TRANSACTION_STATUS,
	TransactionStatus
} from '@trok-app/shared-utils';
import Prisma from '@prisma/client';

export const handleAuthorizationRequest = async (auth: Stripe.Issuing.Authorization) => {
	// Authorize the transaction.
	console.log('-----------------------------------------------');
	console.log('AUTH_ID:', auth.id);
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
				allowed_merchant_categories: true,
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
		const is_valid_merchant_code = card.allowed_merchant_categories.find(item => item.enabled && item.codes.includes(auth.merchant_data.category_code))
		if (is_valid_merchant_code || STRIPE_TEST_MODE) {
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
		return status;
	} catch (err) {
		console.error(err);
		return status;
	}
};

export const createTransaction = async (auth: Stripe.Issuing.Authorization) => {
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
						email: true,
						stripe: true
					}
				}
			}
		});
		// check to see if user id is recorded in the redis statement scheduler
		const zrank = await redisClient.zrank(STATEMENT_REDIS_SORTED_SET_ID, card.user.id);
		if (zrank === null) {
			// add member to sorted set for scheduling statement generation
			redisClient.zadd(STATEMENT_REDIS_SORTED_SET_ID, dayjs().endOf('week').unix(), card.user.id);
			redisClient.hmset(
				card.user.id,
				'email',
				card.user.email,
				'period_start',
				dayjs().startOf('week').unix(),
				'period_end',
				dayjs().endOf('week').unix()
			);
		}
		const decline_code = !auth.request_history.length
			? 'disallowed_merchant'
			: auth.request_history[0].reason === 'webhook_declined'
			? 'disallowed_merchant'
			: <Prisma.TransactionDeclineCode>auth.request_history[0].reason;
		return await prisma.transaction.create({
			data: {
				created_at: dayjs.unix(auth.created).format(),
				authorization_id: auth.id,
				transaction_id: auth.id,
				driverId: card.driver.id,
				userId: card.user.id,
				cardId: card.id,
				cardholder_id: card.cardholder_id,
				cardholder_name: card.driver.full_name,
				transaction_amount: Math.abs(auth.amount),
				merchant_amount: Math.abs(auth.merchant_amount),
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
				status: auth.approved ? TRANSACTION_STATUS.APPROVED : TRANSACTION_STATUS.DECLINED,
				...(!auth.approved && { decline_code }),
				...(!auth.approved && { decline_reason: getDeclineReason(decline_code, auth.merchant_data.category) })
			}
		});
	} catch (err) {
		console.error(err);
		return null;
	}
};

export const updateTransaction = async (t: Stripe.Issuing.Transaction) => {
	try {
		const user = await prisma.user.findFirstOrThrow({
			where: {
				transactions: {
					some: {
						authorization_id: String(t.authorization)
					}
				}
			}
		});
		const t_expanded = await stripe.issuing.transactions.retrieve(
			t.id,
			{ expand: ['purchase_details'] },
			{ stripeAccount: user.stripe.accountId }
		);
		console.log('-----------------------------------------------');
		console.log(t_expanded.purchase_details);
		console.log('-----------------------------------------------');
		return await prisma.transaction.update({
			where: {
				authorization_id: String(t.authorization)
			},
			data: {
				transaction_id: t.id,
				transaction_type: t.type,
				transaction_amount: Math.abs(t.amount),
				merchant_amount: Math.abs(t.merchant_amount),
				...(t_expanded?.purchase_details?.fuel && {
					purchase_details: {
						set: {
							volume: Number(t_expanded.purchase_details.fuel?.volume_decimal),
							unit_cost_decimal: Number(t_expanded.purchase_details.fuel?.unit_cost_decimal),
							fuel_type: t_expanded.purchase_details.fuel?.type,
							unit_type: t_expanded.purchase_details.fuel?.unit
						}
					}
				}),
				status: TRANSACTION_STATUS.APPROVED
			}
		});
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

export const updateCard = async (c: Stripe.Issuing.Card) => {
	try {
		// check if the shipping status of the card is "shipped" and there is a value for "delivery_eta"
		if (c?.shipping?.status === CARD_SHIPPING_STATUS.SHIPPED && c?.shipping?.eta) {
			await redisClient.zadd(CARD_REDIS_SORTED_SET_ID, c?.shipping?.eta, c.id);
		}
		// fetch the card stored in DB
		const card = await prisma.card.findUniqueOrThrow({
			where: {
				card_id: c.id
			}
		});
		const data = card.shipping_status === CARD_SHIPPING_STATUS.DELIVERED ? {
			status: c.status,
			...(c?.shipping?.eta && { shipping_eta: c.shipping.eta })
		} : {
			status: c.status,
			...(c?.shipping?.status && { shipping_status: c.shipping.status }),
			...(c?.shipping?.eta && { shipping_eta: c.shipping.eta })
		};
		// auto update the card status, shipping status and shipping eta in the database
		return await prisma.card.update({
			where: {
				card_id: c.id
			},
			data
		});
	} catch (err) {
		return err;
	}
};
