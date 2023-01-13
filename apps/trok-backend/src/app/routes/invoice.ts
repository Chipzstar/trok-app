import { t } from '../trpc';
import { z } from 'zod';
import { AddressSchema } from '../utils/schemas';
import { TRPCError } from '@trpc/server';
import { generateInvoice } from '../helpers/invoices';
import { INVOICE_STATUS } from '@trok-app/shared-utils';
import { Prisma } from '@prisma/client';

const LineItemSchema = z.object({
	id: z.string(),
	name: z.string(),
	quantity: z.number(),
	price: z.number(),
	unit: z.string().nullable().optional(),
	description: z.string().nullable().optional()
});

export const TaxRateSchema = z.object({
	id: z.string(),
	name: z.string(),
	percentage: z.number(),
	description: z.string().nullable().optional(),
	// calculation: z.union([z.literal("inclusive"), z.literal("exclusive")])
	calculation: z.enum(['inclusive', 'exclusive'])
});

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
	getItems: t.procedure
		.input(
			z.object({
				userId: z.string()
			})
		)
		.query(async ({ input, ctx }) => {
			try {
				return await ctx.prisma.item.findMany({
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
	getTaxRates: t.procedure
		.input(
			z.object({
				userId: z.string()
			})
		)
		.query(async ({ input, ctx }) => {
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
				console.error(err);
				// @ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err?.message });
			}
		}),
	getInvoices: t.procedure
		.input(
			z.object({
				userId: z.string()
			})
		)
		.query(async ({ input, ctx }) => {
			try {
				return await ctx.prisma.invoice.findMany({
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
				email: z.union([z.string().email().optional(), z.literal('')]),
				phone: z.string().optional(),
				billing_address: AddressSchema,
				shipping_address: AddressSchema.nullable().optional(),
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
						billing_address: {
							line1: input.billing_address.line1,
							...(input.billing_address.line2 && { line2: input.billing_address.line2 }),
							city: input.billing_address.city,
							postcode: input.billing_address.postcode,
							region: input.billing_address.region,
							country: input.billing_address.country
						},
						...(input?.shipping_address && {
							shipping_address: {
								line1: input.shipping_address.line1,
								...(input.shipping_address.line2 && { line2: input.shipping_address.line2 }),
								city: input.shipping_address.city,
								postcode: input.shipping_address.postcode,
								region: input.shipping_address.region,
								country: input.shipping_address.country
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
	createItem: t.procedure
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
				return await ctx.prisma.item.create({
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
		}),
	createInvoice: t.procedure
		.input(
			z.object({
				userId: z.string(),
				customer: z.string(),
				invoice_date: z.number(),
				due_date: z.number(),
				invoice_id: z.string(),
				invoice_number: z.string(),
				line_items: LineItemSchema.array(),
				tax_rate: TaxRateSchema.nullable().optional(),
				subtotal: z.number(),
				total: z.number(),
				notes: z.string().optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				console.table(input);
				// fetch the user (business) who created the invoice
				const user = await ctx.prisma.user.findUniqueOrThrow({
					where: {
						id: input.userId
					}
				});
				// fetch the original items used in the invoice
				const original_items = (
					await ctx.prisma.item.findMany({
						where: {
							id: { in: input.line_items.map(item => item.id) }
						},
						select: {
							id: true
						}
					})
				).map(item => item.id);
				// fetch the customer used in the invoice
				const customer = await ctx.prisma.customer.findUniqueOrThrow({
					where: {
						id: input.customer
					}
				});
				// if there is tax fetch the tax rate used in the invoice
				let tax_rate = null;
				if (input.tax_rate) {
					tax_rate = await ctx.prisma.taxRate.findUnique({
						where: {
							id: input.tax_rate.id
						}
					});
				}
				// create the invoice
				const invoice = await ctx.prisma.invoice.create({
					data: {
						userId: input.userId,
						customerId: input.customer,
						customer_name: customer.display_name,
						invoice_id: input.invoice_id,
						invoice_number: input.invoice_number,
						invoice_date: input.invoice_date,
						due_date: input.due_date,
						subtotal: input.subtotal,
						amount_due: input.total,
						total_amount: input.total,
						ItemIds: original_items,
						line_items: <Prisma.InvoiceLineItemCreateInput[]>input.line_items,
						status: INVOICE_STATUS.DRAFT,
						paid_status: 'unpaid',
						...(input.tax_rate && { taxRateId: input.tax_rate.id }),
						notes: input.notes
					}
				});
				console.log('************************************************');
				console.log(JSON.stringify(invoice, null, 2));
				console.log('************************************************');
				generateInvoice(invoice.invoice_number, user, invoice, customer, tax_rate)
					.then(invoice => console.log('Successfully created invoice ' + invoice))
					.catch(err => console.log(err));
				return invoice;
			} catch (err) {
				console.error(err);
				//@ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err.message });
			}
		})
});

export default invoiceRouter;
