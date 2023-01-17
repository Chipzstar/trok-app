import dayjs from 'dayjs';
import { CARD_STATUS, numericId, PAYMENT_STATUS } from '@trok-app/shared-utils';
import { v4 as uuidv4 } from 'uuid';
import Prisma, { Prisma as Schema } from '@prisma/client';
import { faker } from '@faker-js/faker';
import orderId from 'order-id';

const order_id = orderId(String(process.env.ENC_SECRET));

export const isProd = String(process.env.NEXT_PUBLIC_ENVIRONMENT) === 'production';
export const isDev = String(process.env.NEXT_PUBLIC_ENVIRONMENT) === 'development';
export const isCI = String(process.env.NEXT_PUBLIC_ENVIRONMENT) === 'ci';
export const requirements = [
	{ re: /[0-9]/, label: 'Includes number' },
	{ re: /[a-z]/, label: 'Includes lowercase letter' },
	{ re: /[A-Z]/, label: 'Includes uppercase letter' },
	{ re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' }
];
export const ONE_GB = 1073741824; // in bytes units
export const FIVE_MB = 5242880; // in bytes units
export const TEN_MB = 2 * FIVE_MB; // in bytes units
export const FIVE_HUNDRED_POUNDS = 50000;
export const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_API_KEY;
export const DEFAULT_HEADER_HEIGHT = 75;
export const BANNER_HEIGHT = 65;
export const STORAGE_KEYS = {
	ACCOUNT: 'account',
	SIGNUP_FORM: 'signup-form',
	COMPANY_FORM: 'company-form',
	DIRECTORS_FORM: 'director-form',
	FINANCIAL_FORM: 'financial-form',
	LOCATION_FORM: 'location-form',
	ONBOARDING_STEP: 'onboarding-step',
	TEST_MODE: 'test-mode',
	GRIFFIN: 'griffin',
	INVOICE_FORM: 'invoice-form',
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
	INVOICES: '/invoices',
	CREATE_INVOICE: '/create-invoice',
	BANK_ACCOUNT: '/payment-method',
	STATEMENTS: '/statements',
	SETTINGS: '/settings',
	REFERRAL: '/referral',
	VERIFY_EMAIL: '/verify-email',
	FORGOT_PASSWORD: '/forgot-password',
	RESET_PASSWORD: '/reset-password'
};

export const AUTH_ROUTES = [
	PATHS.LOGIN,
	PATHS.SIGNUP,
	PATHS.ONBOARDING,
	PATHS.VERIFY_EMAIL,
	PATHS.FORGOT_PASSWORD,
	PATHS.RESET_PASSWORD
];

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

export const SAMPLE_CARDS: Prisma.Card[] = [
	{
		id: uuidv4(),
		card_id: 'card_0001',
		created_at: dayjs().toDate(),
		updated_at: dayjs().toDate(),
		card_name: 'card_0001',
		userId: numericId(),
		driverId: numericId(),
		cardholder_id: uuidv4(),
		brand: 'visa',
		exp_month: 9,
		exp_year: 2026,
		cvc: '123',
		currency: 'gbp',
		card_type: 'physical',
		status: CARD_STATUS.ACTIVE,
		last4: '2912',
		cardholder_name: 'Joel Cambridge',
		spending_limits: [
			{
				amount: 468000,
				interval: 'weekly'
			}
		],
		allowed_merchant_categories: [],
		current_balance: 4679995,
		shipping_status: 'pending',
		shipping_eta: dayjs().unix()
	},
	{
		id: uuidv4(),
		card_id: 'card_0002',
		created_at: dayjs().toDate(),
		updated_at: dayjs().toDate(),
		card_name: 'card_0002',
		userId: numericId(),
		driverId: numericId(),
		cardholder_id: uuidv4(),
		brand: 'visa',
		exp_month: 9,
		exp_year: 2026,
		cvc: '123',
		currency: 'gbp',
		card_type: 'physical',
		status: CARD_STATUS.ACTIVE,
		last4: '2681',
		cardholder_name: 'Ola Oladapo',
		spending_limits: [
			{
				amount: 468000,
				interval: 'weekly'
			}
		],
		allowed_merchant_categories: [],
		current_balance: 4679995,
		shipping_status: 'pending',
		shipping_eta: dayjs().unix()
	},
	{
		id: uuidv4(),
		card_id: 'card_0003',
		created_at: dayjs().toDate(),
		updated_at: dayjs().toDate(),
		card_name: 'card_0003',
		userId: numericId(),
		driverId: numericId(),
		cardholder_id: uuidv4(),
		brand: 'visa',
		exp_month: 9,
		exp_year: 2026,
		cvc: '123',
		currency: 'gbp',
		card_type: 'physical',
		status: CARD_STATUS.ACTIVE,
		last4: '5410',
		cardholder_name: 'Daniel Oguibe',
		spending_limits: [
			{
				amount: 468000,
				interval: 'weekly'
			}
		],
		allowed_merchant_categories: [],
		current_balance: 4679995,
		shipping_status: 'pending',
		shipping_eta: dayjs().unix()
	},
	{
		id: uuidv4(),
		card_id: 'card_0004',
		created_at: dayjs().toDate(),
		updated_at: dayjs().toDate(),
		card_name: 'card_0004',
		current_balance: 4679995,
		userId: numericId(),
		driverId: numericId(),
		cardholder_id: uuidv4(),
		brand: 'visa',
		exp_month: 9,
		exp_year: 2026,
		cvc: '123',
		currency: 'gbp',
		card_type: 'physical',
		status: CARD_STATUS.ACTIVE,
		last4: '7341',
		cardholder_name: 'King Dave',
		spending_limits: [
			{
				amount: 468000,
				interval: 'weekly'
			}
		],
		allowed_merchant_categories: [],
		shipping_status: 'pending',
		shipping_eta: dayjs().unix()
	},
	{
		id: uuidv4(),
		card_id: 'card_0005',
		created_at: dayjs().toDate(),
		updated_at: dayjs().toDate(),
		card_name: 'card_0005',
		userId: numericId(),
		driverId: numericId(),
		cardholder_id: uuidv4(),
		brand: 'visa',
		exp_month: 9,
		exp_year: 2026,
		cvc: '123',
		currency: 'gbp',
		card_type: 'physical',
		status: CARD_STATUS.INACTIVE,
		last4: '9127',
		cardholder_name: 'Rayan Bannai',
		spending_limits: [
			{
				amount: 468000,
				interval: 'weekly'
			}
		],
		allowed_merchant_categories: [],
		current_balance: 4679995,
		shipping_status: 'pending',
		shipping_eta: dayjs().unix()
	}
];

export const SAMPLE_PAYMENTS: Schema.PaymentUncheckedCreateInput[] = [
	{
		id: uuidv4(),
		bankAccountId: uuidv4(),
		created_at: dayjs().format(),
		userId: uuidv4(),
		plaid_payment_id: uuidv4(),
		plaid_recipient_id: uuidv4(),
		plaid_payment_status: 'PAYMENT_STATUS_COMPLETED',
		plaid_link_token: numericId(),
		payment_type: 'Bank Transfer',
		amount: 650000,
		status: PAYMENT_STATUS.IN_PROGRESS,
		recipient_name: 'John Smith',
		reference: 'send to John Smith',
		recurring: false
	},
	{
		id: uuidv4(),
		bankAccountId: uuidv4(),
		created_at: dayjs().format(),
		userId: uuidv4(),
		plaid_payment_id: uuidv4(),
		plaid_recipient_id: uuidv4(),
		plaid_payment_status: 'PAYMENT_STATUS_COMPLETED',
		plaid_link_token: numericId(),
		payment_type: 'Bank Transfer',
		amount: 650000,
		status: PAYMENT_STATUS.IN_PROGRESS,
		recipient_name: 'George Smith',
		reference: 'send to George Smith',
		recurring: false
	},
	{
		id: uuidv4(),
		bankAccountId: uuidv4(),
		created_at: dayjs().format(),
		userId: uuidv4(),
		plaid_payment_id: uuidv4(),
		plaid_recipient_id: uuidv4(),
		plaid_payment_status: 'PAYMENT_STATUS_COMPLETED',
		plaid_link_token: numericId(),
		payment_type: 'Bank Transfer',
		amount: 650000,
		status: PAYMENT_STATUS.COMPLETE,
		recipient_name: 'Rayan Bannai',
		reference: 'send to Rayan Bannai',
		recurring: false
	},
	{
		id: uuidv4(),
		bankAccountId: uuidv4(),
		created_at: dayjs().format(),
		userId: uuidv4(),
		plaid_payment_id: uuidv4(),
		plaid_recipient_id: uuidv4(),
		plaid_payment_status: 'PAYMENT_STATUS_COMPLETED',
		plaid_link_token: numericId(),
		payment_type: 'Bank Transfer',
		amount: 650000,
		status: PAYMENT_STATUS.COMPLETE,
		recipient_name: 'King Dave',
		reference: 'Send to King Dave',
		recurring: false
	},
	{
		id: uuidv4(),
		bankAccountId: uuidv4(),
		created_at: dayjs().format(),
		userId: uuidv4(),
		plaid_payment_id: uuidv4(),
		plaid_recipient_id: uuidv4(),
		plaid_payment_status: 'PAYMENT_STATUS_COMPLETED',
		plaid_link_token: numericId(),
		payment_type: 'Bank Transfer',
		amount: 650000,
		status: PAYMENT_STATUS.IN_PROGRESS,
		recipient_name: 'Stripe Payments UK Limited',
		reference: 'Top-up balance',
		recurring: false
	},
	{
		id: uuidv4(),
		bankAccountId: uuidv4(),
		created_at: dayjs().format(),
		userId: uuidv4(),
		plaid_payment_id: uuidv4(),
		plaid_recipient_id: uuidv4(),
		plaid_payment_status: 'PAYMENT_STATUS_COMPLETED',
		plaid_link_token: numericId(),
		payment_type: 'Bank Transfer',
		amount: 650000,
		status: PAYMENT_STATUS.FAILED,
		recipient_name: 'Michael Phelps',
		reference: 'Send to Michael',
		recurring: false
	}
];

export const SAMPLE_TRANSACTIONS: Schema.TransactionUncheckedCreateInput[] = [
	{
		id: uuidv4(),
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
			category: '',
			category_code: '',
			network_id: uuidv4(),
			name: 'BP Fuel',
			city: 'London',
			postcode: 'E2 9LH'
		},
		last4: '2681',
		cardholder_name: 'Joel Cambridge',
		transaction_amount: 468000,
		status: 'approved',
		transaction_id: uuidv4(),
		transaction_type: 'capture'
	},
	{
		id: uuidv4(),
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
			category: '',
			category_code: '',
			network_id: uuidv4(),
			name: 'BP Fuel',
			city: 'London',
			postcode: 'E2 9LH'
		},
		last4: '2681',
		cardholder_name: 'Joel Cambridge',
		transaction_amount: 468000,
		status: 'approved',
		transaction_id: uuidv4(),
		transaction_type: 'capture'
	},
	{
		id: uuidv4(),
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
			category: '',
			category_code: '',
			network_id: uuidv4(),
			name: 'BP Fuel',
			city: 'London',
			postcode: 'E2 9LH'
		},
		last4: '2681',
		cardholder_name: 'Joel Cambridge',
		transaction_amount: 468000,
		status: 'approved',
		transaction_id: uuidv4(),
		transaction_type: 'capture'
	},
	{
		id: uuidv4(),
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
			category: '',
			category_code: '',
			network_id: uuidv4(),
			name: 'BP Fuel',
			city: 'London',
			postcode: 'E2 9LH'
		},
		last4: '2681',
		cardholder_name: 'Joel Cambridge',
		transaction_amount: 468000,
		status: 'approved',
		transaction_id: uuidv4(),
		transaction_type: 'capture'
	},
	{
		id: uuidv4(),
		created_at: dayjs().format(),
		updated_at: dayjs().format(),
		userId: uuidv4(),
		driverId: '',
		cardId: '',
		cardholder_id: '',
		currency: '',
		merchant_amount: 468000,
		authorization_id: '',
		merchant_data: {
			category: '',
			category_code: '',
			network_id: uuidv4(),
			name: 'BP Fuel',
			city: 'London',
			postcode: 'E2 9LH'
		},
		last4: '2681',
		cardholder_name: 'Joel Cambridge',
		transaction_amount: 468000,
		status: 'approved',
		transaction_id: uuidv4(),
		transaction_type: 'capture'
	}
];

export const SAMPLE_STATEMENTS = [
	{
		created_at: dayjs().format(),
		period_start: 1665421245,
		period_end: 1665421245,
		due_at: 1665421245,
		total_balance: 468000
	},
	{
		created_at: dayjs().add(1, 'M').format(),
		period_start: 1665421245,
		period_end: 1665421245,
		due_at: 1665421245,
		total_balance: 468000
	},
	{
		created_at: dayjs().add(2, 'M').format(),
		period_start: 1665421245,
		period_end: 1665421245,
		due_at: 1665421245,
		total_balance: 468000
	},
	{
		created_at: dayjs().add(3, 'M').format(),
		period_start: 1665421245,
		period_end: 1665421245,
		due_at: 1665421245,
		total_balance: 468000
	},
	{
		created_at: dayjs().add(4, 'M').format(),
		period_start: 1665421245,
		period_end: 1665421245,
		due_at: 1665421245,
		total_balance: 468000
	}
];

export const SAMPLE_BANK_ACCOUNTS: Schema.BankAccountUncheckedCreateInput[] = [
	{
		id: uuidv4(),
		userId: uuidv4(),
		stripe_bank_id: uuidv4(),
		fingerprint: uuidv4(),
		bank_name: 'Barclays Business',
		institution_id: 'ins_117181',
		account_holder_name: 'Ola Oladapo',
		account_number: '12345678',
		sort_code: '09-12-90',
		is_default: true,
		status: 'active'
	},
	{
		id: uuidv4(),
		userId: uuidv4(),
		stripe_bank_id: uuidv4(),
		fingerprint: uuidv4(),
		bank_name: 'Barclays Business',
		institution_id: 'ins_117181',
		account_holder_name: 'Chisom Oguibe',
		account_number: '87654321',
		sort_code: '89-21-21',
		is_default: false,
		status: 'active'
	}
];

export const SAMPLE_INVOICES: Schema.InvoiceUncheckedCreateInput[] = [
	{
		id: uuidv4(),
		userId: uuidv4(),
		invoice_id: order_id.generate(),
		invoice_number: `INV-#${numericId()}`,
		invoice_date: dayjs().unix(),
		customerId: uuidv4(),
		customer_name: faker.company.name(),
		due_date: dayjs().add(7, 'day').unix(),
		line_items: Array(4).fill({
			id: uuidv4(),
			name: faker.commerce.productName(),
			quantity: 1,
			price: Number(faker.commerce.price()),
			description: '',
			unit: ''
		}),
		total_amount: 468000,
		subtotal: 404320,
		amount_due: 468000,
		ItemIds: [],
		paid_status: 'unpaid',
		status: 'processing',
		download_url: '',
		approved: false,
		pod: false
	},
	{
		id: uuidv4(),
		userId: uuidv4(),
		invoice_id: order_id.generate(),
		invoice_number: `INV-#${numericId()}`,
		invoice_date: dayjs().unix(),
		customerId: uuidv4(),
		customer_name: faker.company.name(),
		due_date: dayjs().add(7, 'day').unix(),
		line_items: Array(3).fill({
			id: uuidv4(),
			name: faker.commerce.productName(),
			quantity: 1,
			price: Number(faker.commerce.price()),
			description: '',
			unit: ''
		}),
		total_amount: 468000,
		subtotal: 404320,
		amount_due: 468000,
		ItemIds: [],
		paid_status: 'paid',
		status: 'complete',
		download_url: '',
		approved: true,
		pod: true
	},
	{
		id: uuidv4(),
		userId: uuidv4(),
		invoice_id: order_id.generate(),
		invoice_number: `INV-#${numericId()}`,
		invoice_date: dayjs().unix(),
		customerId: uuidv4(),
		customer_name: faker.company.name(),
		due_date: dayjs().add(7, 'day').unix(),
		line_items: Array(3).fill({
			id: uuidv4(),
			name: faker.commerce.productName(),
			quantity: 1,
			price: Number(faker.commerce.price()),
			description: '',
			unit: ''
		}),
		total_amount: 468000,
		subtotal: 404320,
		amount_due: 468000,
		ItemIds: [],
		paid_status: 'paid',
		status: 'complete',
		download_url: '',
		approved: true,
		pod: true
	},
	{
		id: uuidv4(),
		userId: uuidv4(),
		invoice_id: order_id.generate(),
		invoice_number: `INV-#${numericId()}`,
		invoice_date: dayjs().unix(),
		customerId: uuidv4(),
		customer_name: faker.company.name(),
		due_date: dayjs().add(7, 'day').unix(),
		line_items: Array(2).fill({
			id: uuidv4(),
			name: faker.commerce.productName(),
			quantity: 1,
			price: Number(faker.commerce.price()),
			description: '',
			unit: ''
		}),
		total_amount: 468000,
		subtotal: 404320,
		amount_due: 468000,
		ItemIds: [],
		paid_status: 'unpaid',
		status: 'draft',
		download_url: '',
		approved: false,
		pod: true
	},
	{
		id: uuidv4(),
		userId: uuidv4(),
		invoice_id: order_id.generate(),
		invoice_number: `INV-#${numericId()}`,
		invoice_date: dayjs().unix(),
		customerId: uuidv4(),
		customer_name: faker.company.name(),
		due_date: dayjs().add(7, 'day').unix(),
		line_items: Array(3).fill({
			id: uuidv4(),
			name: faker.commerce.productName(),
			quantity: 1,
			price: Number(faker.commerce.price()),
			description: '',
			unit: ''
		}),
		total_amount: 468000,
		subtotal: 404320,
		amount_due: 468000,
		ItemIds: [],
		paid_status: 'unpaid',
		status: 'draft',
		download_url: '',
		approved: false,
		pod: false
	},
	{
		id: uuidv4(),
		userId: uuidv4(),
		invoice_id: order_id.generate(),
		invoice_number: `INV-#${numericId()}`,
		invoice_date: dayjs().unix(),
		customerId: uuidv4(),
		customer_name: faker.company.name(),
		due_date: dayjs().add(7, 'day').unix(),
		line_items: Array(2).fill({
			id: uuidv4(),
			name: faker.commerce.productName(),
			quantity: 1,
			price: Number(faker.commerce.price()),
			description: '',
			unit: ''
		}),
		total_amount: 468000,
		subtotal: 404320,
		amount_due: 468000,
		ItemIds: [],
		paid_status: 'paid',
		status: 'sent',
		download_url: '',
		approved: true,
		pod: true
	},
	{
		id: uuidv4(),
		userId: uuidv4(),
		invoice_id: order_id.generate(),
		invoice_number: `INV-#${numericId()}`,
		invoice_date: dayjs().unix(),
		customerId: uuidv4(),
		customer_name: faker.company.name(),
		due_date: dayjs().add(7, 'day').unix(),
		line_items: Array(2).fill({
			id: uuidv4(),
			name: faker.commerce.productName(),
			quantity: 1,
			price: Number(faker.commerce.price()),
			description: '',
			unit: ''
		}),
		total_amount: 468000,
		subtotal: 404320,
		amount_due: 468000,
		ItemIds: [],
		paid_status: 'paid',
		status: 'sent',
		download_url: '',
		approved: true,
		pod: true
	}
];

export const SAMPLE_CUSTOMERS = [
	{
		id: uuidv4(),
		name: faker.name.fullName(),
		email: faker.internet.email(),
		company: faker.company.name()
	},
	{
		id: uuidv4(),
		name: faker.name.fullName(),
		email: faker.internet.email(),
		company: faker.company.name()
	},
	{
		id: uuidv4(),
		name: faker.name.fullName(),
		email: faker.internet.email(),
		company: faker.company.name()
	},
	{
		id: uuidv4(),
		name: faker.name.fullName(),
		email: faker.internet.email(),
		company: faker.company.name()
	},
	{
		id: uuidv4(),
		name: faker.name.fullName(),
		email: faker.internet.email(),
		company: faker.company.name()
	}
];

export const SAMPLE_LINE_ITEMS = [
	{
		id: uuidv4(),
		name: faker.commerce.productName(),
		price: faker.commerce.price(),
		quantity: faker.random.numeric()
	},
	{
		id: uuidv4(),
		name: faker.commerce.productName(),
		price: faker.commerce.price(),
		quantity: faker.random.numeric()
	},
	{
		id: uuidv4(),
		name: faker.commerce.productName(),
		price: faker.commerce.price(),
		quantity: faker.random.numeric()
	},
	{
		id: uuidv4(),
		name: faker.commerce.productName(),
		price: faker.commerce.price(),
		quantity: faker.random.numeric()
	},
	{
		id: uuidv4(),
		name: faker.commerce.productName(),
		price: faker.commerce.price(),
		quantity: faker.random.numeric()
	},
	{
		id: uuidv4(),
		name: faker.commerce.productName(),
		price: faker.commerce.price(),
		quantity: faker.random.numeric()
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
