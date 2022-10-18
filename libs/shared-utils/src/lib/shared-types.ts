import { TokenCreateParams } from '@stripe/stripe-js';

export interface SignupInfo {
	full_name: string;
	firstname: string;
	lastname: string;
	email: string;
	phone: string;
	password: string;
	referral_code?: string;
	terms?: boolean;
}

export interface OnboardingBusinessInfo {
	legal_name: string;
	weekly_fuel_spend: string;
	business_type: TokenCreateParams.Account.Company.Structure;
	merchant_category_code: string;
	business_crn: string;
	business_url: string;
	num_vehicles: number | null;
}

export interface ShippingAddress {
	line1: string;
	line2?: string;
	city: string;
	postcode: string;
	region: string;
	country: string;
}

export interface OnboardingLocationInfo extends ShippingAddress{
	line1: string;
	line2?: string;
	city: string;
	postcode: string;
	region: string;
	country: string;
	card_business_name: string;
	num_cards: number;
	shipping_speed: string;
	diff_shipping_address: boolean;
	shipping_address?: ShippingAddress;
}