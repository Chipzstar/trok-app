import { z } from 'zod';

export const SignupSchema = z.object({
	email: z.string().email({message: 'Invalid email'}).max(50),
	full_name: z.string().nullable(),
	firstname: z.string({required_error: 'Required'}).max(25),
	lastname: z.string({required_error: 'Required'}).max(25),
	phone: z.string({required_error: 'Required'}).max(25),
	referral_code: z.string().max(10, "Referral code must contain at most 10 characters").optional(),
	password: z.string().max(50),
	terms: z.boolean().refine(val => val, "Please check this box")
});