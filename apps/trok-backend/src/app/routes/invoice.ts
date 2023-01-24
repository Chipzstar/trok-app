import { t } from '../trpc';
import { z } from 'zod';
import { AddressSchema } from '../utils/schemas';
import { TRPCError } from '@trpc/server';
import { generateInvoice } from '../helpers/invoices';
import { INVOICE_STATUS } from '@trok-app/shared-utils';
import { Prisma } from '@prisma/client';
import { prettyPrint } from '../utils/helpers';
import { mailerSend } from '../utils/clients';
import { Attachment, EmailParams, Recipient, Sender } from 'mailersend';
import { downloadPDF, generateDownloadUrl } from '../helpers/gcp';

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
	getSingleCustomer: t.procedure
		.input(
			z.object({
				id: z.string(),
				userId: z.string()
			})
		)
		.query(async ({ input, ctx }) => {
			try {
				return await ctx.prisma.customer.findUniqueOrThrow({
					where: {
						id: input.id,
						userId: input.userId
					}
				});
			} catch (err) {
				console.error(err);
				//@ts-ignore
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Customer not found' });
			}
		}),
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
				// fetch default tax rates
				const default_rates = await ctx.prisma.taxRate.findMany({
					where: {
						is_default: true
					}
				});
				// fetch user's custom tax rates
				const custom_rates = await ctx.prisma.taxRate.findMany({
					where: {
						userId: input.userId,
						is_default: false
					},
					orderBy: {
						created_at: 'desc'
					}
				});
				return [...default_rates, ...custom_rates];
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
				email: z.string().email(),
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
						email: input.email,
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
				type: z.enum(['VAT', 'GST']),
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
						type: input.type,
						percentage: input.percentage,
						description: input?.description,
						calculation: input.calculation,
						is_default: false
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
				customer_id: z.string().optional(),
				customer_name: z.string(),
				customer_email: z.string().email(),
				invoice_date: z.number(),
				due_date: z.number(),
				invoice_id: z.string(),
				invoice_number: z.string(),
				line_items: LineItemSchema.array(),
				tax_rate: TaxRateSchema.nullable().optional(),
				subtotal: z.number(),
				total: z.number(),
				notes: z.string().optional(),
				invoice_Upload_Filepath: z.string().optional()
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
							id: { in: input.line_items.map(item => item.id) },
							userId: input.userId
						},
						select: {
							id: true
						}
					})
				).map(item => item.id);
				// fetch the customer used in the invoice
				let customer = null;
				if (input.customer_id) {
					customer = await ctx.prisma.customer.findUniqueOrThrow({
						where: {
							id: input.customer_id,
							userId: input.userId
						}
					});
				}
				// if there is tax fetch the tax rate used in the invoice
				let tax_rate = null;
				if (input.tax_rate) {
					// first check if the tax rate is a default one
					tax_rate = await ctx.prisma.taxRate.findUnique({
						where: {
							id: input.tax_rate.id,
							is_default: true
						}
					});
					if (!tax_rate) {
						// if not, check if it is a custom tax created by the user
						tax_rate = await ctx.prisma.taxRate.findUnique({
							where: {
								id: input.tax_rate.id,
								userId: input.userId
							}
						});
					}
				}
				// create the invoice
				const invoice = await ctx.prisma.invoice.create({
					data: {
						userId: input.userId,
						customerId: input.customer_id,
						customer_name: customer?.display_name ?? input.customer_name,
						customer_email: customer?.email ?? input.customer_email,
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
						download_url: '',
						filepath: '',
						notes: input.notes,
						approved: false,
						approval_requested: false,
						pod: false,
					}
				});
				if (customer) {
					const { download_url, filepath } = await generateInvoice(invoice.invoice_number, user, invoice, customer, tax_rate);
					await ctx.prisma.invoice.update({
						where: {
							id: invoice.id
						},
						data: {
							filepath,
							download_url
						}
					});
				} else if (input.invoice_Upload_Filepath) {
					const invoice_url = await generateDownloadUrl(input.invoice_Upload_Filepath);
					await ctx.prisma.invoice.update({
						where: {
							id: invoice.id
						},
						data: {
							filepath: input.invoice_Upload_Filepath,
							download_url: invoice_url
						}
					});

				}
				prettyPrint(invoice);
				return invoice;
			} catch (err) {
				console.error(err);
				//@ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err.message });
			}
		}),
	updateInvoice: t.procedure
		.input(
			z.object({
				invoice_id: z.string(),
				userId: z.string(),
				pod: z.boolean().optional(),
				status: z.string().optional(),
				paid_status: z.union([z.literal('paid'), z.literal('unpaid'), z.literal('partially_paid')]).optional(),
				approval_requested: z.boolean().optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				console.table(input);
				const invoice = await ctx.prisma.invoice.update({
					where: {
						invoice_id: input.invoice_id,
						userId: input.userId
					},
					data: {
						...(input.pod && { pod: input.pod }),
						...(input.status && { status: input.status }),
						...(input.paid_status && { paid_status: input.paid_status }),
						...(input.approval_requested && { approval_requested: input.approval_requested })
					}
				});
				prettyPrint(invoice);
				return invoice;
			} catch (err) {
				console.error(err);
				//@ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err.message });
			}
		}),
	deleteInvoice: t.procedure
		.input(
			z.object({
				userId: z.string(),
				id: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				const invoice = await ctx.prisma.invoice.update({
					where: {
						id: input.id,
						userId: input.userId
					},
					data: {
						deleted: true
					}
				});
				return invoice;
			} catch (err) {
				console.error(err);
				//@ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err.message });
			}
		}),
	sendInvoice: t.procedure
		.input(
			z.object({
				userId: z.string(),
				invoice_id: z.string(),
				to: z.string(),
				from: z.string(),
				subject: z.string(),
				bodyText: z.string(),
				bodyHTML: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				console.table({ to: input.to, from: input.from, subject: input.subject, text: input.bodyText });
				console.log(input.bodyHTML);
				// find the corresponding user based on the auth session
				const user = await ctx.prisma.user.findUniqueOrThrow({
					where: {
						id: input.userId
					}
				});
				console.log('-----------------------------------------------');
				console.log(user);
				// find the invoice to be sent using the invoice id
				const invoice = await ctx.prisma.invoice.findUniqueOrThrow({
					where: {
						invoice_id: input.invoice_id
					}
				});
				console.log('-----------------------------------------------');
				console.log(invoice);
				const file_content = await downloadPDF(invoice.filepath);
				const sentFrom = new Sender('hello@trok.co', 'Trok');
				const replyTo = new Sender(user.email, user.full_name);
				const recipients = [new Recipient(input.to, invoice?.customer_name ?? undefined)];
				const attachments = [new Attachment(file_content, `${invoice.invoice_number}.pdf`, 'attachment')];
				const emailParams = new EmailParams()
					.setFrom(sentFrom)
					.setTo(recipients)
					.setReplyTo(replyTo)
					.setAttachments(attachments)
					.setSubject(input.subject)
					.setHtml(input.bodyHTML)
					.setText(input.bodyText);
				const result = await mailerSend.email.send(emailParams);
				console.log('************************************************');
				console.log(result);
				// update status of the invoice to "sent"
				await ctx.prisma.invoice.update({
					where: {
						invoice_id: input.invoice_id
					},
					data: {
						status: INVOICE_STATUS.SENT
					}
				});
				return result;
			} catch (err) {
				console.error(err);
				//@ts-ignore
				throw new TRPCError({ code: 'BAD_REQUEST', message: err.message });
			}
		})
});

export default invoiceRouter;
