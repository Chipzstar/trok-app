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
	createCustomer: t.procedure
		.input(
			z.object({
				userId: z.string(),
				display_name: z.string(),
				primary_contact: z.string(),
				company: z.string(),
				email: z.string().email().optional(),
				phone: z.string().optional(),
				billing_address: AddressSchema.optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				return await ctx.prisma.customer.create({
					data: {
						...input
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
				description: z.string().optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				return await ctx.prisma.lineItem.create({
					data: {
						...input
					}
				});
			} catch (err) {
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err.message });
			}
		})
});

export default invoiceRouter;
