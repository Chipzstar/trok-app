import dayjs from "dayjs";
import currency from 'currency.js';

export const GBP = value => currency(value, { symbol: '£', separator: ',', fromCents: true });

export const DEFAULT_HEADER_HEIGHT = 70

export const STORAGE_KEYS = {
	AUTH: 'auth',
	COMPLETE: 'complete',
	ACCOUNT: 'account',
	SIGNUP_FORM: 'signup-form',
	COMPANY_FORM: 'onboarding-company-form',
	FINANCIAL_FORM: 'financial-form',
	LOCATION_FORM: 'location-form'
}

export const PATHS = {
	HOME: '/',
	SIGNUP: '/signup',
	TRANSACTIONS: '/transactions',
	DRIVERS: '/drivers',
	BILLING: '/billing',
	ONBOARDING: '/onboarding',
	CARDS: '/cards',
	PAYMENTS: '/payments',
	BANK_ACCOUNT: '/bank-account',
	STATEMENTS: '/statements',
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