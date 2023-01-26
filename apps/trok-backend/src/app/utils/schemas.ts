import { z } from 'zod';

export const AddressSchema = z.object({
	line1: z.string(),
	line2: z.nullable(z.string()).optional(),
	city: z.string(),
	postcode: z.string(),
	region: z.string(),
	country: z.string().default('GB')
})

export const shippingSpeedSchema = z.union([
	z.literal("standard"),
	z.literal("express"),
	z.literal("priority")
])

export const signupInfoSchema = z.object({
	full_name: z.string(),
	firstname: z.string(),
	lastname: z.string(),
	email: z.string(),
	phone: z.string(),
	password: z.string(),
	referral_code: z.string().optional().nullable(),
	terms: z.boolean().optional().nullable()
});

export const newOnboardingBusinessInfoSchema = z.object({
	legal_name: z.string(),
	num_monthly_invoices: z.number(),
	business_type: z.string(),
	business_crn: z.string(),
	merchant_category_code: z.string(),
	business_url: z.string(),
	num_vehicles: z.number()
})

export const newOnboardingRepresentativeInfoSchema = z.object({
	dob: z.string(),
	email: z.string(),
	firstname: z.string(),
	lastname: z.string(),
	line1: z.string(),
	line2: z.string().optional(),
	city: z.string(),
	postcode: z.string(),
	region: z.string(),
	building_number: z.number().optional(),
	country: z.string().optional(),
	is_owner: z.boolean(),
	is_director: z.boolean()
})

export const newOnboardingMemberInfoSchema = z.object({
	dob: z.string(),
	email: z.string(),
	full_name: z.string(),
	firstname: z.string(),
	lastname: z.string()
})

const businessInfoSchema = z.object({
	business: newOnboardingBusinessInfoSchema
})

const representativeSchema = z.object({})

export const newOnboardingOwnersInfoSchema = newOnboardingMemberInfoSchema

export const newOnboardingDirectorsInfoSchema = newOnboardingMemberInfoSchema

export const newOnboardingAccountStep1Schema = signupInfoSchema.and(
	businessInfoSchema
)

export const newOnboardingAccountStep2Schema = newOnboardingAccountStep1Schema.and(
	representativeSchema
)

export const cardConfigurationSchema = z.object({
	card_business_name: z.string(),
	num_cards: z.number().optional(),
	shipping_speed: shippingSpeedSchema
})

export const onboardingLocationInfoSchema = AddressSchema
	.extend(cardConfigurationSchema.shape)
	.extend({
		line1: z.string(),
		line2: z.string().optional(),
		city: z.string(),
		postcode: z.string(),
		region: z.string(),
		country: z.string().optional(),
		card_business_name: z.string(),
		num_cards: z.number().optional(),
		shipping_speed: shippingSpeedSchema,
		diff_shipping_address: z.boolean(),
		shipping_address: AddressSchema.optional()
	})