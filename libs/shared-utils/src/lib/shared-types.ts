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

export const intervals = ["per_authorization", "daily", "weekly", "monthly", "yearly", "all_time"] as const;
export type SpendingLimitInterval = typeof intervals[number];
// export type SpendingLimitInterval = "per_authorization" | "daily" | "weekly" | "monthly" | "yearly" | "all_time"


export type SpendingLimit = {
    interval: SpendingLimitInterval;
    amount: number;
};

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

export interface OnboardingFinancialInfo {
	average_monthly_revenue: number | null;
}

export type OnboardingAccountStep1 = SignupInfo & Record<'business', OnboardingBusinessInfo>

export type OnboardingAccountStep2 = SignupInfo & Record<'business', OnboardingBusinessInfo & OnboardingFinancialInfo>

export interface CardConfiguration {
	card_business_name: string;
	num_cards?: number;
	shipping_speed: ShippingSpeed;
}

export interface AddressInfo {
	line1: string;
	line2?: string;
	city: string;
	postcode: string;
	region: string;
	country?: string;
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

export interface StripeInfo {
	accountId: string;
	bankAccount?: null;
}

export interface CreateUser extends SignupInfo {
	business?: OnboardingBusinessInfo & OnboardingFinancialInfo;
	location?: AddressInfo;
	card_configuration?: CardConfiguration;
	shipping_address?: AddressInfo;
	stripe?: StripeInfo;
}
