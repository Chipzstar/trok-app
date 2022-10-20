import { TokenCreateParams } from '@stripe/stripe-js';

export type ShippingSpeed = "standard" | "express" | "signature"

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

export interface CardConfiguration {
	card_business_name: string;
	num_cards: number;
	shipping_speed: ShippingSpeed;
}

export interface AddressInfo {
	line1: string;
	line2?: string;
	city: string;
	postcode: string;
	region: string;
	country: string;
}

export interface OnboardingLocationInfo extends AddressInfo, CardConfiguration {
	line1: string;
	line2?: string;
	city: string;
	postcode: string;
	region: string;
	country: string;
	card_business_name: string;
	num_cards: number;
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