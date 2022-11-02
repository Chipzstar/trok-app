import dayjs from 'dayjs';
import currency from 'currency.js';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { CARD_STATUS, PAYMENT_STATUS } from '@trok-app/shared-utils';

export const phoneUtil = PhoneNumberUtil.getInstance();

export const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_API_KEY;

export const GBP = value => currency(value, { symbol: '£', separator: ',', fromCents: true });

export const DEFAULT_HEADER_HEIGHT = 75;

export const STORAGE_KEYS = {
	AUTH: 'auth',
	COMPLETE: 'complete',
	ACCOUNT: 'account',
	SIGNUP_FORM: 'signup-form',
	COMPANY_FORM: 'company-form',
	FINANCIAL_FORM: 'financial-form',
	LOCATION_FORM: 'location-form',
	ONBOARDING_STEP: 'onboarding-step',
	TEST_MODE: 'test-mode'
};

export const PATHS = {
	HOME: '/',
	SIGNUP: '/signup',
	LOGIN: '/login',
	TRANSACTIONS: '/transactions',
	DRIVERS: '/drivers',
	BILLING: '/billing',
	ONBOARDING: '/onboarding',
	CARDS: '/cards',
	PAYMENTS: '/payments',
	BANK_ACCOUNT: '/payment-method',
	STATEMENTS: '/statements',
	SETTINGS: '/settings',
	REFERRAL: '/referral',
	VERIFY_EMAIL: '/verify-email'
};

export const SAMPLE_DRIVERS = [
	{
		id: '1',
		createdAt: dayjs().unix(),
		driverId: `DRIVER-ID#0001`,
		status: 'OFFLINE',
		isActive: false,
		full_name: 'Chisom Oguibe',
		firstname: 'Chisom',
		lastname: 'Oguibe',
		vin: '2C3CCAET4CH256062',
		email: 'chisom.oguibe@googlemail.com',
		phone: '+447523958055',
		dob: 884505600,
		addressLine1: '250 Reede Road',
		addressLine2: '',
		city: 'Dagenham',
		postcode: 'RM10 8EH',
		last4: '8202',
		current_spend: 21780200,
		spending_limit: 350000
	},
	{
		id: '2',
		createdAt: dayjs().unix(),
		driverId: `DRIVER-ID#0002`,
		status: 'OFFLINE',
		isActive: false,
		full_name: 'Ola Oladapo',
		firstname: 'Ola',
		lastname: 'Oladapo',
		email: 'ola.oladapo7@gmail.com',
		phone: '+447523958055',
		dob: 884505600,
		addressLine1: '250 Reede Road',
		addressLine2: '',
		city: 'Dagenham',
		postcode: 'RM10 8EH',
		last4: '8202',
		vin: 'JH4DB7540SS801338',
		current_spend: 21780200,
		spending_limit: 350000
	},
	{
		id: '3',
		createdAt: dayjs().unix(),
		driverId: `DRIVER-ID$#0003`,
		status: 'OFFLINE',
		isActive: false,
		full_name: 'Ryan Bannai',
		firstname: 'Rayan',
		lastname: 'Bannai',
		email: 'rayan.bannai@googlemail.com',
		phone: '+447523958055',
		dob: 884505600,
		addressLine1: '250 Reede Road',
		addressLine2: '',
		city: 'Dagenham',
		postcode: 'RM10 8EH',
		last4: '8202',
		vin: 'JF2SHADC3DG417185',
		current_spend: 21780200,
		spending_limit: 350000
	},
	{
		id: '4',
		createdAt: dayjs().unix(),
		driverId: `DRIVER-ID#0004`,
		status: 'OFFLINE',
		isActive: false,
		full_name: 'Oscar Sanz',
		firstname: 'Oscar',
		lastname: 'Sanz',
		email: 'oscar_sanz@hotmail.com',
		phone: '+447523958055',
		dob: 884505600,
		addressLine1: '250 Reede Road',
		addressLine2: '',
		city: 'Dagenham',
		postcode: 'RM10 8EH',
		last4: '8202',
		vin: 'JH4KA2640GC004861',
		current_spend: 21780200,
		spending_limits: 350000
	}
];

export const SAMPLE_CARDS = [
	{
		id: 'card_0001',
		created_at: 1665414165,
		status: CARD_STATUS.ACTIVE,
		last4: '2912',
		cardholder_name: 'Joel Cambridge',
		spending_limits: [
			{
				amount: 468000,
				interval: 'weekly'
			}
		],
		current_balance: 4679995,
		shipping_status: 'pending'
	},
	{
		id: 'card_0002',
		created_at: 1665414165,
		status: CARD_STATUS.ACTIVE,
		last4: '2681',
		cardholder_name: 'Ola Oladapo',
		spending_limits: [
			{
				amount: 468000,
				interval: 'weekly'
			}
		],
		current_balance: 4679995,
		shipping_status: 'pending'
	},
	{
		id: 'card_0003',
		created_at: 1665414165,
		status: CARD_STATUS.ACTIVE,
		last4: '5410',
		cardholder_name: 'Daniel Oguibe',
		spending_limits: [
			{
				amount: 468000,
				interval: 'weekly'
			}
		],
		current_balance: 4679995,
		shipping_status: 'pending'
	},
	{
		id: 'card_0004',
		created_at: 1665414165,
		status: CARD_STATUS.ACTIVE,
		last4: '7341',
		cardholder_name: 'King Dave',
		spending_limits: [
			{
				amount: 468000,
				interval: 'weekly'
			}
		],
		current_balance: 4679995,
		shipping_status: 'pending'
	},
	{
		id: 'card_0005',
		created_at: 1665414165,
		status: CARD_STATUS.INACTIVE,
		last4: '9127',
		cardholder_name: 'Rayan Bannai',
		spending_limits: [
			{
				amount: 468000,
				interval: 'weekly'
			}
		],
		current_balance: 4679995,
		shipping_status: 'pending'
	}
];

export const SAMPLE_PAYMENTS = [
	{
		id: '',
		created_at: dayjs().format(),
		finish_date: dayjs().unix(),
		payment_type: 'Bank Transfer',
		amount: 650000,
		status: PAYMENT_STATUS.IN_PROGRESS,
		recipient_id: '2',
		recipient_name: 'John Smith',
		reference: "send to John Smith"
	},
	{
		id: '',
		created_at: dayjs().format(),
		finish_date: dayjs().unix(),
		payment_type: 'Bank Transfer',
		amount: 650000,
		status: PAYMENT_STATUS.IN_PROGRESS,
		recipient_id: '6',
		recipient_name: 'George Smith',
		reference: "send to George Smith"
	},
	{
		id: '',
		created_at: dayjs().format(),
		finish_date: dayjs().unix(),
		payment_type: 'Bank Transfer',
		amount: 650000,
		status: PAYMENT_STATUS.COMPLETE,
		recipient_id: '9',
		recipient_name: 'Rayan Bannai',
		reference: "send to Rayan Bannai"
	},
	{
		id: '',
		created_at: dayjs().format(),
		finish_date: dayjs().unix(),
		payment_type: 'Bank Transfer',
		amount: 650000,
		status: PAYMENT_STATUS.COMPLETE,
		recipient_id: '5',
		recipient_name: 'King Dave',
		reference: 'Send to King Dave'
	},
	{
		id: '',
		created_at: dayjs().format(),
		finish_date: dayjs().unix(),
		payment_type: 'Bank Transfer',
		amount: 650000,
		status: PAYMENT_STATUS.IN_PROGRESS,
		recipient_id: '8',
		recipient_name: 'Stripe Payments UK Limited',
		reference: 'Top-up balance'
	},
	{
		id: '',
		created_at: dayjs().format(),
		finish_date: dayjs().unix(),
		payment_type: 'Bank Transfer',
		amount: 650000,
		status: PAYMENT_STATUS.FAILED,
		recipient_id: '1',
		recipient_name: 'Michael Phelps',
		reference: 'Send to Michael'
	}
];

export const SAMPLE_TRANSACTIONS = [
	{
		id: '',
		created_at: dayjs().format(),
		updated_at: dayjs().format(),
		userId: '',
		driverId: '',
		cardId: '',
		cardholder_id: '',
		currency: '',
		merchant_amount: 468000,
		authorization_id: '',
		merchant_data: {
			name: 'BP Fuel',
			city: 'London',
			postcode: 'E2 9LH'
		},
		location: 'London, E2 9LH',
		last4: '2681',
		cardholder_name: 'Joel Cambridge',
		transaction_amount: 468000
	},
	{
		id: '',
		created_at: dayjs().format(),
		updated_at: dayjs().format(),
		userId: '',
		driverId: '',
		cardId: '',
		cardholder_id: '',
		currency: '',
		merchant_amount: 468000,
		authorization_id: '',
		merchant_data: {
			name: 'BP Fuel',
			city: 'London',
			postcode: 'E2 9LH'
		},
		last4: '2681',
		cardholder_name: 'Joel Cambridge',
		transaction_amount: 468000
	},
	{
		id: '',
		created_at: dayjs().format(),
		updated_at: dayjs().format(),
		userId: '',
		driverId: '',
		cardId: '',
		cardholder_id: '',
		currency: '',
		merchant_amount: 468000,
		authorization_id: '',
		merchant_data: {
			name: 'BP Fuel',
			city: 'London',
			postcode: 'E2 9LH'
		},
		last4: '2681',
		cardholder_name: 'Joel Cambridge',
		transaction_amount: 468000
	},
	{
		id: '',
		created_at: dayjs().format(),
		updated_at: dayjs().format(),
		userId: '',
		driverId: '',
		cardId: '',
		cardholder_id: '',
		currency: '',
		merchant_amount: 468000,
		authorization_id: '',
		merchant_data: {
			name: 'BP Fuel',
			city: 'London',
			postcode: 'E2 9LH'
		},
		last4: '2681',
		cardholder_name: 'Joel Cambridge',
		transaction_amount: 468000
	},
	{
		id: '',
		created_at: dayjs().format(),
		updated_at: dayjs().format(),
		userId: '',
		driverId: '',
		cardId: '',
		cardholder_id: '',
		currency: '',
		merchant_amount: 468000,
		authorization_id: '',
		merchant_data: {
			name: 'BP Fuel',
			city: 'London',
			postcode: 'E2 9LH'
		},
		last4: '2681',
		cardholder_name: 'Joel Cambridge',
		transaction_amount: 468000
	}
];

export const SAMPLE_STATEMENTS = [
	{
		period_label: 'October 22',
		created_at: 1665414165,
		period_start: 1665421245,
		period_end: 1665421245,
		due_at: 1665421245,
		total_balance: 468000
	},
	{
		period_label: 'November 22',
		created_at: 1665414165,
		period_start: 1665421245,
		period_end: 1665421245,
		due_at: 1665421245,
		total_balance: 468000
	},
	{
		period_label: 'December 22',
		created_at: 1665414165,
		period_start: 1665421245,
		period_end: 1665421245,
		due_at: 1665421245,
		total_balance: 468000
	},
	{
		period_label: 'January 23',
		created_at: 1665414165,
		period_start: 1665421245,
		period_end: 1665421245,
		due_at: 1665421245,
		total_balance: 468000
	},
	{
		period_label: 'February 23',
		created_at: 1665414165,
		period_start: 1665421245,
		period_end: 1665421245,
		due_at: 1665421245,
		total_balance: 468000
	}
];

export const SAMPLE_BANK_ACCOUNTS = [
	{
		account_holder_name: 'Ola Oladapo',
		type: 'business_account',
		account_number: 12345678,
		sort_code: '09-12-90',
		isDefault: true
	},
	{
		account_holder_name: 'Chisom Oguibe',
		type: 'business_account',
		account_number: 87654321,
		sort_code: '89-21-21',
		isDefault: false
	}
];

export const INDUSTRY_TYPES = [
	{
		label: 'Transportation - Other',
		value: '4789'
	},
	{ label: 'Transportation - Motor Freight, Carriers & Trucking', value: '4214' },
	{ label: 'Motor Vehicle Supplies and New Parts', value: '5013' }
];