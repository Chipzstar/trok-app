import { TokenCreateParams } from '@stripe/stripe-js';
export const FuelMerchantCategoryCodes = ["5983", "5542", "5172", "5541", "7511"] as const;
export type FuelMCC = typeof FuelMerchantCategoryCodes[number];

export type ShippingSpeed = 'standard' | 'express' | 'priority';

export type TransactionStatus = 'all' | 'approved' | 'declined'

export enum CARD_STATUS {
	ACTIVE = 'active',
	INACTIVE = 'inactive'
}

export enum TRANSACTION_STATUS {
	DECLINED = 'declined',
	APPROVED = 'approved',
}

export enum CARD_SHIPPING_STATUS {
	PENDING = 'pending',
	SHIPPED= 'shipped',
	DELIVERED= 'delivered',
	RETURNED= 'returned',
	FAILURE= 'failure',
}

export enum PAYMENT_STATUS {
	PENDING = 'pending',
	IN_PROGRESS = 'in_progress',
	COMPLETE = 'complete',
	FAILED = 'failed',
	CANCELLED = 'cancelled'
}

export enum INVOICE_STATUS {
	APPROVED = 'approved',
	UNAPPROVED = 'unapproved',
	DRAFT = 'draft',
	COMPLETE = 'complete',
	SENT = 'sent',
	PROCESSING='processing',
}

export enum INVOICE_PAID_STATUS {
	PAID = 'paid',
	UNPAID = 'unpaid',
	PARTIAL = 'partially_paid',
}

export const intervals = ["per_authorization", "daily", "weekly", "monthly", "yearly", "all_time"] as const;
export type SpendingLimitInterval = typeof intervals[number];

export type SpendingLimit = {
	interval: SpendingLimitInterval;
	amount: number;
};

export interface AddressInfo {
	line1: string;
	line2?: string;
	city: string;
	postcode: string;
	region: string;
	country?: string;
}

export interface SignupInfo {
	full_name: string;
	firstname: string;
	lastname: string;
	email: string;
	phone: string;
	password: string;
	referral_code?: string | null;
	terms?: boolean | null;
}

export interface OnboardingBusinessInfo {
	legal_name: string;
	weekly_fuel_spend: number;
	business_type: TokenCreateParams.Account.Company.Structure;
	business_crn: string;
	merchant_category_code: string;
	business_url: string;
	num_vehicles: number;
}

export interface NewOnboardingBusinessInfo {
	legal_name: string;
	num_monthly_invoices: number;
	business_type: TokenCreateParams.Account.Company.Structure;
	business_crn: string;
	merchant_category_code: string;
	business_url: string;
	num_vehicles: number;
}

export interface OnboardingDirectorInfo {
	dob: string | Date;
	email: string;
	firstname: string;
	lastname: string;
	line1: string;
	line2?: string;
	city: string;
	postcode: string;
	region: string;
	building_number?: number;
	country?: string;
}

export interface NewOnboardingRepresentativeInfo {
	dob: string | Date;
	email: string;
	firstname: string;
	lastname: string;
	line1: string;
	line2?: string;
	city: string;
	postcode: string;
	region: string;
	building_number?: number;
	country?: string;
	is_owner: boolean;
	is_director: boolean;
}

export interface OnboardingFinancialInfo {
	average_monthly_revenue: number | null;
}

export interface NewOnboardingMemberInfo {
	dob: string | Date;
	email: string;
	full_name: string;
	firstname: string;
	lastname: string;
}

export type NewOnboardingOwnersInfo = NewOnboardingMemberInfo & { "dob" : string }

export type NewOnboardingDirectorsInfo = NewOnboardingMemberInfo & { "dob" : string }

export type OnboardingAccountStep1 = SignupInfo & Record<'business', OnboardingBusinessInfo>

export type NewOnboardingAccountStep1 = SignupInfo & Record<'business', NewOnboardingBusinessInfo>

export type OnboardingAccountStep2 = SignupInfo & Record<'business', OnboardingBusinessInfo> & Record<'director', OnboardingDirectorInfo>

export type NewOnboardingAccountStep2 = NewOnboardingAccountStep1 & Record<'representative', NewOnboardingRepresentativeInfo>

export type OnboardingAccountStep3 = SignupInfo & Record<'business', OnboardingBusinessInfo & OnboardingFinancialInfo> & Record<'director', OnboardingDirectorInfo>

export type NewOnboardingAccountStep3 = NewOnboardingAccountStep2 & Record<'owners', NewOnboardingOwnersInfo[]>

export type NewOnboardingAccountStep4 = NewOnboardingAccountStep3 & Record<'directors', NewOnboardingDirectorsInfo[]>
export interface CardConfiguration {
	card_business_name: string;
	num_cards?: number;
	shipping_speed: ShippingSpeed;
}

export interface OnboardingLocationInfo extends AddressInfo, CardConfiguration {
	line1: string;
	line2?: string;
	city: string;
	postcode: string;
	region: string;
	country?: string;
	card_business_name: string;
	num_cards?: number;
	shipping_speed: ShippingSpeed;
	diff_shipping_address: boolean;
	shipping_address?: AddressInfo;
}

export interface NewOnboardingLocationInfo extends AddressInfo {
	line1: string;
	line2?: string;
	city: string;
	postcode: string;
	region: string;
	country?: string;
	diff_shipping_address: boolean;
	shipping_address?: AddressInfo;
}

export interface StripeInfo {
	accountId: string;
	bankAccount?: null;
}

export interface CreateUser extends SignupInfo {
	business?: OnboardingBusinessInfo & OnboardingFinancialInfo;

	director?: OnboardingDirectorInfo
	location?: AddressInfo;
	card_configuration?: CardConfiguration;
	shipping_address?: AddressInfo;
	stripe?: StripeInfo;
}

export interface NewCreateUser extends SignupInfo {
	business?: NewOnboardingBusinessInfo;
	owners?: NewOnboardingOwnersInfo[]
	directors?: NewOnboardingDirectorsInfo[]
	location?: AddressInfo;
	shipping_address?: AddressInfo;
	stripe?: StripeInfo;
}

export interface DriverFormValues extends AddressInfo {
	firstname: string
	lastname: string
	email: string
	phone: string
	has_spending_limit: boolean
	spending_limit: SpendingLimit
}
