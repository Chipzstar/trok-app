import { z } from 'zod';

export const AddressSchema = z.object({
	line1: z.string(),
	line2: z.nullable(z.string()).optional(),
	city: z.string(),
	postcode: z.string(),
	region: z.string(),
	country: z.string().default('GB')
})