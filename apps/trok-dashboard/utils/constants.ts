import dayjs from "dayjs";
import currency from 'currency.js';
import { CARD_STATUS, PAYMENT_STATUS } from './types';
import { PhoneNumberUtil } from 'google-libphonenumber';

export const phoneUtil = PhoneNumberUtil.getInstance();

export const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_API_KEY;

export const GBP = value => currency(value, { symbol: '£', separator: ',', fromCents: true });

export const DEFAULT_HEADER_HEIGHT = 75

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
}

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
	REFERRAL: '/referral'
}

export const SAMPLE_DRIVERS = [
	{
		id: '',
		createdAt: dayjs().unix(),
		driverId: `DRIVER-ID#0001`,
		status: "OFFLINE",
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
		id: '',
		createdAt: dayjs().unix(),
		driverId: `DRIVER-ID#0002`,
		status: "OFFLINE",
		isActive: false,
		full_name: "Ola Oladapo",
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
		id: '',
		createdAt: dayjs().unix(),
		driverId: `DRIVER-ID$#0003`,
		status: "OFFLINE",
		isActive: false,
		full_name: "Ryan Bannai",
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
		id: '',
		createdAt: dayjs().unix(),
		driverId: `DRIVER-ID#0004`,
		status: "OFFLINE",
		isActive: false,
		full_name: "Oscar Sanz",
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
		spending_limit: 350000
	}
];

export const SAMPLE_CARDS = [
	{
		id: 'card_0001',
		created_at: 1665414165,
		status: CARD_STATUS.ACTIVE,
		last4: '2912',
		cardholder_name: 'Joel Cambridge',
		spending_limit: {
			weekly: 468000
		},
		balance: 4679995
	},
	{
		id: 'card_0002',
		created_at: 1665414165,
		status: CARD_STATUS.ACTIVE,
		last4: '2681',
		cardholder_name: 'Ola Oladapo',
		spending_limit: {
			weekly: 468000
		},
		balance: 4679995
	},
	{
		id: 'card_0003',
		created_at: 1665414165,
		status: CARD_STATUS.ACTIVE,
		last4: '5410',
		cardholder_name: 'Daniel Oguibe',
		spending_limit: {
			weekly: 468000
		},
		balance: 4679995
	},
	{
		id: 'card_0004',
		created_at: 1665414165,
		status: CARD_STATUS.ACTIVE,
		last4: '7341',
		cardholder_name: 'King Dave',
		spending_limit: {
			weekly: 468000
		},
		balance: 4679995
	},
	{
		id: 'card_0005',
		created_at: 1665414165,
		status: CARD_STATUS.INACTIVE,
		last4: '9127',
		cardholder_name: 'Rayan Bannai',
		spending_limit: {
			weekly: 468000
		},
		balance: 4679995
	}
]

export const SAMPLE_PAYMENTS = [
	{
		id: '',
		created_at: dayjs().unix(),
		finish_date: dayjs().unix(),
		type: 'Bank Transfer',
		amount: 650000,
		status: PAYMENT_STATUS.IN_PROGRESS,
		recipient: {
			id: '',
			name: 'John Smith'
		}
	},
	{
		id: '',
		created_at: dayjs().unix(),
		finish_date: dayjs().unix(),
		type: 'Bank Transfer',
		amount: 650000,
		status: PAYMENT_STATUS.IN_PROGRESS,
		recipient: {
			id: '',
			name: 'George Smith'
		}
	},
	{
		id: '',
		created_at: dayjs().unix(),
		finish_date: dayjs().unix(),
		type: 'Bank Transfer',
		amount: 650000,
		status: PAYMENT_STATUS.COMPLETE,
		recipient: {
			id: '',
			name: 'Rayan Bannai'
		}
	},
	{
		id: '',
		created_at: dayjs().unix(),
		finish_date: dayjs().unix(),
		type: 'Bank Transfer',
		amount: 650000,
		status: PAYMENT_STATUS.COMPLETE,
		recipient: {
			id: '',
			name: 'King Dave'
		}
	},
	{
		id: '',
		created_at: dayjs().unix(),
		finish_date: dayjs().unix(),
		type: 'Bank Transfer',
		amount: 650000,
		status: PAYMENT_STATUS.IN_PROGRESS,
		recipient: {
			id: '',
			name: 'John Smith'
		}
	},
	{
		id: '',
		created_at: dayjs().unix(),
		finish_date: dayjs().unix(),
		type: 'Bank Transfer',
		amount: 650000,
		status: PAYMENT_STATUS.FAILED,
		recipient: {
			id: '',
			name: 'Michael Phelps'
		}
	},
]

export const SAMPLE_TRANSACTIONS = [
	{
		id: '',
		date_of_transaction: 1665414165,
		posted_date: 1665421245,
		merchant: 'BP Fuel',
		location: 'London, E2 9LH',
		last4: '2681',
		driver: 'Joel Cambridge',
		amount: 468000,
		net_discount: 4679995,
		type: 'fuel',
		litres: 120,
		price_per_litre: 17080
	},
	{
		id: '',
		date_of_transaction: 1665414165,
		posted_date: 1665421245,
		merchant: 'BP Fuel',
		location: 'London, E2 9LH',
		last4: '2681',
		driver: 'Joel Cambridge',
		amount: 468000,
		net_discount: 4679995,
		type: 'fuel',
		litres: 120,
		price_per_litre: 17080
	},
	{
		id: '',
		date_of_transaction: 1665414165,
		posted_date: 1665421245,
		merchant: 'BP Fuel',
		location: 'London, E2 9LH',
		last4: '2681',
		driver: 'Joel Cambridge',
		amount: 468000,
		net_discount: 4679995,
		type: 'fuel',
		litres: 120,
		price_per_litre: 17080
	},
	{
		id: '',
		date_of_transaction: 1665414165,
		posted_date: 1665421245,
		merchant: 'BP Fuel',
		location: 'London, E2 9LH',
		last4: '2681',
		driver: 'Joel Cambridge',
		amount: 468000,
		net_discount: 4679995,
		type: 'fuel',
		litres: 120,
		price_per_litre: 17080
	},
	{
		id: '',
		date_of_transaction: 1665414165,
		posted_date: 1665421245,
		merchant: 'BP Fuel',
		location: 'London, E2 9LH',
		last4: '2681',
		driver: 'Joel Cambridge',
		amount: 468000,
		net_discount: 4679995,
		type: 'fuel',
		litres: 120,
		price_per_litre: 17080
	}
];

export const SAMPLE_STATEMENTS = [
	{
		period_label: 'October 22',
		created_at: 1665414165,
		period_start: 1665421245,
		period_end: 1665421245,
		due_at: 1665421245,
		total_balance: 468000,
	},
	{
		period_label: 'November 22',
		created_at: 1665414165,
		period_start: 1665421245,
		period_end: 1665421245,
		due_at: 1665421245,
		total_balance: 468000,
	},
	{
		period_label: 'December 22',
		created_at: 1665414165,
		period_start: 1665421245,
		period_end: 1665421245,
		due_at: 1665421245,
		total_balance: 468000,
	},
	{
		period_label: 'January 23',
		created_at: 1665414165,
		period_start: 1665421245,
		period_end: 1665421245,
		due_at: 1665421245,
		total_balance: 468000,
	},
	{
		period_label: 'February 23',
		created_at: 1665414165,
		period_start: 1665421245,
		period_end: 1665421245,
		due_at: 1665421245,
		total_balance: 468000,
	}
];

export const SAMPLE_BANK_ACCOUNTS = [
	{
		account_holder_name: 'Ola Oladapo',
		type: 'business_account',
		account_number: 12345678,
		sort_code: "09-12-90",
		isDefault: true,
	},
	{
		account_holder_name: 'Chisom Oguibe',
		type: 'business_account',
		account_number: 87654321,
		sort_code: "89-21-21",
		isDefault: false,
	}
];

export const INDUSTRY_TYPES = [
	{
		label: 'Transportation - Other',
		value: '4789'
	},
	{ label: 'Transportation - Motor Freight, Carriers & Trucking', value: '4214' },
	{ label: 'Motor Vehicle Supplies and New Parts', value: '5013' }
]