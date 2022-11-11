import { PhoneNumberUtil } from 'google-libphonenumber';
import currency from 'currency.js';

export const phoneUtil = PhoneNumberUtil.getInstance();
export const GBP = (value: number) => currency(value, { symbol: '£', separator: ',', fromCents: true });

export const PLAID_INSTITUTIONS = [
	{
		label: 'Allied Irish Bank (GB) - Business',
		value: 'ins_118272'
	},
	{
		label: 'Bank of Ireland (UK) - Business On Line',
		value: 'ins_120185'
	},
	{
		label: "Bank of Scotland - Business",
		value: "ins_118276",
	},
	{
		label: 'Barclays (UK) - Online Banking: Business',
		value: 'ins_118305'
	},
	{
		label: 'C. Hoare & Co',
		value: 'ins_127298'
	},
	{
		label: 'CashPlus',
		value: 'ins_119178'
	},
	{
		label: 'Cater Allen Private Bank',
		value: 'ins_119552'
	},
	{
		label: 'Chase (UK)',
		value: 'ins_133093'
	},
	{
		label: 'Coutts',
		value: 'ins_118915'
	},
	{
		label: 'Cumberland Building Society',
		value: 'ins_118932'
	},
	{
		label: 'First Direct',
		value: 'ins_81'
	},
	{
		label: 'First Trust Bank (UK) - Business',
		value: 'ins_118510'
	},
	{
		label: 'Halifax',
		value: 'ins_117246'
	},
	{
		label: 'HSBC (UK) - Business',
		value: 'ins_118277'
	},
	{
		label: 'HSBC (UK) - HSBCNet: Corporate',
		value: 'ins_133269'
	},
	{
		label: 'ICICI Bank',
		value: 'ins_127246'
	},
	{
		label: 'Investec',
		value: 'ins_126246'
	},
	{
		label: 'Kleinwort Hambros',
		value: 'ins_124915'
	},
	{
		label: 'Lloyds Bank - Business',
		value: 'ins_118275'
	},
	{
		label: 'Lloyds Bank - Commercial',
		value: 'ins_128699'
	},
	{
		label: 'Mettle',
		value: 'ins_126252'
	},
	{
		label: 'Model - Ozone',
		value: 'ins_132688'
	},
	{
		label: 'Monzo',
		value: 'ins_117243'
	},
	{
		label: 'Nationwide Building Society',
		value: 'ins_60'
	},
	{
		label: 'NatWest - Business',
		value: 'ins_115643'
	},
	{
		label: 'Revolut (UK)',
		value: 'ins_63'
	},
	{
		label: 'Royal Bank of Scotland - Current Accounts',
		value: 'ins_115642'
	},
	{
		label: 'Santander (UK) - Personal and Business',
		value: 'ins_62'
	},
	{
		label: 'Silicon Valley Bank (UK)',
		value: 'ins_12883'
	},
	{
		label: 'Starling',
		value: 'ins_117520'
	},
	{
		label: 'Tesco (UK)',
		value: 'ins_118393'
	},
	{
		label: 'Tide',
		value: 'ins_118505'
	},
	{
		label: 'TSB',
		value: 'ins_86'
	},
	{
		label: 'Ulster Bank (UK)',
		value: 'ins_117734'
	},
	{
		label: 'Virgin Money - Current and Savings accounts',
		value: 'ins_129622'
	},
	{
		label: 'Wise (UK)',
		value: 'ins_121978'
	},
	{
		label: 'Yorkshire Building Society (UK)',
		value: 'ins_118392'
	}
]