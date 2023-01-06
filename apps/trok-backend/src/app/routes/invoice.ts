import { t } from '../trpc';
import { z } from 'zod';
import { AddressSchema } from '../utils/schemas';
import { TRPCError } from '@trpc/server';

const invoiceRouter = t.router({
	getCustomers: t.procedure
		.input(
			z.object({
				userId: z.string()
			})
		)
		.query(async ({ input, ctx }) => {
			try {
				return await ctx.prisma.customer.findMany({
					where: {
						userId: input.userId
					},
					orderBy: {
						created_at: 'desc'
					}
				});
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		}),
	getLineItems: t.procedure
		.input(
			z.object({
				userId: z.string()
			})
		)
		.query(async ({ input, ctx }) => {
			try {
				return await ctx.prisma.lineItem.findMany({
					where: {
						userId: input.userId
					},
					orderBy: {
						created_at: 'desc'
					}
				});
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		}),
	getTaxRates: t.procedure.input(
		z.object({
			userId: z.string()
		})
	).query(async ({input, ctx}) => {
		try {
			return await ctx.prisma.taxRate.findMany({
				where: {
					userId: input.userId
				},
				orderBy: {
					created_at: 'desc'
				}
			});
		} catch (err) {
		    console.error(err)
			// @ts-ignore
			throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
		}
	}),
	createCustomer: t.procedure
		.input(
			z.object({
				userId: z.string(),
				display_name: z.string(),
				primary_contact: z.string(),
				company: z.string(),
				email: z.union([z.string().email().optional(), z.literal('')]),
				phone: z.string().optional(),
				billing_address: AddressSchema.optional(),
				website: z.union([z.string().url().optional(), z.literal('')])
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				return await ctx.prisma.customer.create({
					data: {
						userId: input.userId,
						company: input.company,
						display_name: input.display_name,
						primary_contact: input.primary_contact,
						email: input?.email ?? undefined,
						phone: input?.phone ?? undefined,
						website: input?.website ?? undefined,
						...(input?.billing_address && {
							billing_address: {
								line1: input.billing_address.line1,
								line2: input.billing_address.line2,
								city: input.billing_address.city,
								postcode: input.billing_address.postcode,
								region: input.billing_address.region,
								country: input.billing_address.country
							}
						})
					}
				});
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err.message });
			}
		}),
	createLineItem: t.procedure
		.input(
			z.object({
				userId: z.string(),
				name: z.string(),
				price: z.number(),
				unit: z.string().optional(),
				description: z.string().optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				return await ctx.prisma.lineItem.create({
					data: {
						userId: input.userId,
						name: input.name,
						price: input.price,
						description: input?.description ?? undefined,
						unit: input?.unit ?? undefined
					}
				});
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err.message });
			}
		}),
	createTaxRate: t.procedure
		.input(
			z.object({
				userId: z.string(),
				name: z.string(),
				percentage: z.number(),
				description: z.string().optional(),
				calculation: z.enum(['inclusive', 'exclusive'])
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				return await ctx.prisma.taxRate.create({
					data: {
						userId: input.userId,
						name: input.name,
						percentage: input.percentage,
						description: input?.description,
						calculation: input.calculation
					}
				});
			} catch (err) {
				console.error(err);
				//@ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err.message });
			}
		})
});

export default invoiceRouter;
