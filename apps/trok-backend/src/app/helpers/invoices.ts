import Prisma from '@prisma/client';
import PDFDocument from 'pdfkit';
import { generateDownloadUrl, uploadPDF } from './gcp';
import path from 'path';
import { GBP } from '@trok-app/shared-utils';
import dayjs from 'dayjs';

export async function generateInvoice(invoice_number: string, user: Prisma.User, invoice: Prisma.Invoice, customer: Prisma.Customer, tax: Prisma.TaxRate | null=null) {
	const doc = new PDFDocument({ margin: 50 });
	doc.fontSize(12);
	generateHeader(doc, user); // Invoke `generateHeader` function.
	generateCustomerInformation(doc, user, customer, invoice);
	generateInvoiceTable(doc, invoice, tax);
	generateFooter(doc); // Invoke `generateFooter` function.
	doc.end();
	const filepath = `${user.business.business_crn}/INVOICES/${invoice.invoice_id}/${invoice_number}.pdf`;
	const uploadResult = await uploadPDF(doc, invoice_number, filepath);
	console.log(uploadResult);
	return await generateDownloadUrl(filepath);
}

function generateHeader(doc: PDFKit.PDFDocument, user: Prisma.User) {
	doc.image(path.join(__dirname, '/assets/logo.png'), 50, 45, { width: 50 })
		.fillColor('#444444')
		.fontSize(20)
		.text(user.business.legal_name, 110, 57)
		.fontSize(10)
		.text(user.location.line1, 200, 65, { align: 'right' })
		.text(user.location.city, 200, 80, { align: 'right' })
		.text(user.location.region, 200, 95, { align: 'right' })
		.text(user.location.postcode, 200, 110, { align: 'right' })
		.moveDown();
}

function generateFooter(doc: PDFKit.PDFDocument) {
	doc.fontSize(10).text('Thank you for using Trok!', 50, 780, {
		align: 'center',
		width: 500
	});
}

function generateHr(doc: PDFKit.PDFDocument, y: number) {
	doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y).lineTo(600, y).stroke();
}

function generateCustomerInformation(doc: PDFKit.PDFDocument, user: Prisma.User, customer: Prisma.Customer, invoice: Prisma.Invoice) {
	const shipping: Prisma.Address = user.shipping_address;

	doc.fillColor('#444444').fontSize(20).text('Invoice', 50, 160);

	generateHr(doc, 185);

	const customerInformationTop = 200;

	doc.fontSize(10)
		.text('Invoice Number:', 50, customerInformationTop)
		.font('Helvetica-Bold')
		.text(invoice.invoice_number, 150, customerInformationTop)
		.font('Helvetica')
		.text('Invoice Date:', 50, customerInformationTop + 15)
		.text(dayjs.unix(invoice.invoice_date).format('DD/MM/YYYY'), 150, customerInformationTop + 15)
		.text('Due Date:', 50, customerInformationTop + 30)
		.text(dayjs.unix(invoice.due_date).format("DD/MM/YYYY"), 150, customerInformationTop + 30)
		.font('Helvetica-Bold')
		.text(customer.company, 300, customerInformationTop)
		.font('Helvetica')
		.text(`${customer.billing_address.line1} ${customer.billing_address?.line2 ?? ""}`, 300, customerInformationTop + 15)
		.text(customer.billing_address.city + ', ' + customer.billing_address.postcode + ', ' + customer.billing_address.country, 300, customerInformationTop + 30)
		.moveDown();

	generateHr(doc, 252);
}

function generateTableRow(
	doc: PDFKit.PDFDocument,
	y: number,
	c1: string,
	c2: string,
	c3: string,
	c4: string,
	c5: string
) {
	doc.fontSize(10)
		.text(c1, 50, y)
		.text(c2, 80, y)
		.text(c3, 210, y, { width: 90, align: 'right' })
		.text(c4, 300, y, { width: 90, align: 'right' })
		.text(c5, 0, y, { align: 'right' });
}

function generateInvoiceTable(doc: PDFKit.PDFDocument, invoice: Prisma.Invoice, tax: Prisma.TaxRate | null=null) {
	let i;
	const invoiceTableTop = 330;
	generateTableRow(doc, invoiceTableTop, '#','Items', 'Quantity', 'Price', 'Amount');
	generateHr(doc, invoiceTableTop + 20);
	doc.font('Helvetica');
	for (i = 0; i < invoice.line_items.length; i++) {
		const item = invoice.line_items[i];
		const position = invoiceTableTop + (i + 1) * 30;
		generateTableRow(
			doc,
			position,
			String(i + 1),
			item.name,
			String(item.quantity),
			GBP(item.price).format(),
			GBP(item.price * item.quantity).format()
		);
		generateHr(doc, position + 20);
	}
	const subtotalPosition = invoiceTableTop + (i + 1) * 30;
	let totalPosition;
	const sub_total_text = !tax ? "" : tax.calculation === "inclusive" ? `Subtotal inc. ${tax.type}` : `Subtotal exc. ${tax.type}`;
	generateTableRow(doc, subtotalPosition, '', '', sub_total_text, '', GBP(invoice.subtotal).format());
	if (tax) {
		const taxPosition = subtotalPosition + 20;
		const tax_amount = invoice.total_amount - invoice.subtotal;
		generateTableRow(doc, taxPosition, '', '', `${tax.type} (${tax.percentage}%)`, '', GBP(tax_amount).format());
		totalPosition = taxPosition + 25;
	} else {
		totalPosition = subtotalPosition + 25;
	}
	doc.font('Helvetica-Bold');
	generateTableRow(doc, totalPosition, '', '', 'Total', '', GBP(invoice.total_amount).format());
	doc.font('Helvetica');
}