import redisClient from '../redis';
import { BUCKET, IS_DEVELOPMENT, STATEMENT_REDIS_SORTED_SET_ID } from '../utils/constants';
import dayjs from 'dayjs';
import prisma from '../db';
import path from 'path';
import Prisma from '@prisma/client';
import orderId from 'order-id';
import { generateDownloadUrl } from './gcp';
import PDFDocument from 'pdfkit';
import { GBP, TRANSACTION_STATUS } from '@trok-app/shared-utils';

const order_id = orderId(String(process.env.ENC_SECRET));

export async function checkPastDueStatements() {
	try {
		// set buffer of max +1 hour and min -1 hour from current timestamp
		// when querying statements that are ready to generated
		const MAX = dayjs().add(1, 'h').unix();
		const MIN = dayjs().subtract(1, 'h').unix();
		console.table({ MAX, MIN });
		const user_ids = await redisClient.zrange(STATEMENT_REDIS_SORTED_SET_ID, MIN, MAX, 'BYSCORE', (err, res) =>
			console.log('RESULT:', res)
		);
		// generate statement for each entry
		user_ids.map(async (id, index) => {
			const statement_interval = await redisClient.hgetall(id);
			const { period_start, period_end } = statement_interval;
			// fetch the user's business information
			const user = await prisma.user.findUniqueOrThrow({
				where: {
					id
				}
			});
			// fetch all APPROVED transactions within the time range
			const transactions = await prisma.transaction.findMany({
				where: {
					status: TRANSACTION_STATUS.APPROVED,
					userId: id,
					created_at: {
						lte: dayjs.unix(Number(period_end)).toDate(),
						gte: dayjs.unix(Number(period_start)).toDate()
					}
				}
			});
			console.log('Num transactions:', transactions.length);
			let statement_id = order_id.generate();
			const url = await generateStatement(statement_id, user, transactions);
			if (IS_DEVELOPMENT) {
				return null;
			}
			// push statement into database
			const statement = await prisma.statement.create({
				data: {
					statement_id,
					period_start: dayjs.unix(Number(period_start)).toDate(),
					period_end: dayjs.unix(Number(period_end)).toDate(),
					userId: user.id,
					download_url: url,
					total_balance: transactions.reduce((prev, curr) => prev + curr.transaction_amount, 0)
				}
			});
			console.log('************************************************');
			console.log("NEW STATEMENT:", statement);
			console.log('************************************************');
			// attach DB Statement ID to included transactions
			Promise.all(
				transactions.map(transaction =>
					prisma.transaction.update({
						where: {
							id: transaction.id
						},
						data: {
							statementId: statement.id
						}
					})
				)
			)
				.then(r => console.log('Transactions attached'))
				.catch(err => console.error('Error attaching transactions:', err));
			// increment score of the sorted set entry for next month
			await redisClient.zadd(STATEMENT_REDIS_SORTED_SET_ID, dayjs().add(7, 'd').unix(), id);
			// adjust the start & end periods for the next statement
			await redisClient.hmset(id, 'email', user.email, 'period_start', dayjs().unix(), 'period_end', dayjs().add(7, 'd').unix());
			return statement;
		});
		return true;
	} catch (e) {
		throw e;
	}
}

async function generateStatement(statement_id: string, user: Prisma.User, transactions: Prisma.Transaction[]) {
	let doc = new PDFDocument({ margin: 50 });
	const total = transactions.reduce((prev, curr) => prev + curr.transaction_amount, 0);
	doc.fontSize(12);
	generateHeader(doc); // Invoke `generateHeader` function.
	generateCustomerInformation(doc, statement_id, user, total);
	generateInvoiceTable(doc, total, transactions);
	generateFooter(doc); // Invoke `generateFooter` function.
	doc.end();

	const filepath = `${user.business.business_crn}/STATEMENTS/${statement_id}.pdf`;
	const uploadResult = await upload(doc, statement_id, filepath);
	console.log(uploadResult);
	return await generateDownloadUrl(filepath);
}

function generateHeader(doc: PDFKit.PDFDocument) {
	doc.image(path.join(__dirname, '/assets/logo.png'), 50, 45, { width: 50 })
		.fillColor('#444444')
		.fontSize(20)
		.text('Trok', 110, 57)
		.fontSize(10)
		.text('35 Forresters Apartments', 200, 65, { align: 'right' })
		.text('42 Linton Road, Barking', 200, 80, { align: 'right' })
		.text('Essex', 200, 95, { align: 'right' })
		.text('IG11 8FS', 200, 110, { align: 'right' })
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

function generateCustomerInformation(doc: PDFKit.PDFDocument, statement_id: string, user: Prisma.User, amount: number) {
	const shipping: Prisma.Address = user.shipping_address;
	const business: Prisma.BusinessInfo = user.business;
	const total_spent = GBP(amount).format();

	doc.fillColor('#444444').fontSize(20).text('Statement', 50, 160);

	generateHr(doc, 185);

	const customerInformationTop = 200;

	doc.fontSize(10)
		.text('Statement Number:', 50, customerInformationTop)
		.font('Helvetica-Bold')
		.text(statement_id, 150, customerInformationTop)
		.font('Helvetica')
		.text('Statement Date:', 50, customerInformationTop + 15)
		.text(dayjs().format('DD/MM/YYYY'), 150, customerInformationTop + 15)
		.text('Total Spent:', 50, customerInformationTop + 30)
		.text(total_spent, 150, customerInformationTop + 30)
		.font('Helvetica-Bold')
		.text(business.legal_name, 300, customerInformationTop)
		.font('Helvetica')
		.text(`${shipping.line1} ${shipping?.line2}`, 300, customerInformationTop + 15)
		.text(shipping.city + ', ' + shipping.postcode + ', ' + shipping.country, 300, customerInformationTop + 30)
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
		.text(c2, 150, y)
		.text(c3, 280, y, { width: 90, align: 'right' })
		.text(c4, 370, y, { width: 90, align: 'right' })
		.text(c5, 0, y, { align: 'right' });
}

function generateInvoiceTable(doc: PDFKit.PDFDocument, total: number, transactions: Prisma.Transaction[]) {
	let i,
		invoiceTableTop = 330;
	generateTableRow(doc, invoiceTableTop, 'Item ID', 'Merchant', 'Unit Cost', 'Litres', 'Line Total');
	generateHr(doc, invoiceTableTop + 20);
	doc.font('Helvetica');
	for (i = 0; i < transactions.length; i++) {
		const item = transactions[i];
		const position = invoiceTableTop + (i + 1) * 30;
		const litres = item?.purchase_details?.unit_cost_decimal
			? GBP(item.purchase_details.unit_cost_decimal).format()
			: '-';
		const volume = item?.purchase_details?.volume.toString() ?? '-';
		generateTableRow(
			doc,
			position,
			item.authorization_id.slice(0, 15),
			item.merchant_data?.name ?? item.merchant_data.category,
			litres,
			volume,
			GBP(item.transaction_amount).format()
		);
		generateHr(doc, position + 20);
	}
	const subtotalPosition = invoiceTableTop + (i + 1) * 30;
	const VAT = total - total * 0.8;
	generateTableRow(doc, subtotalPosition, '', '', 'Subtotal exc. Vat', '', GBP(total * 0.8).format());
	const paidToDatePosition = subtotalPosition + 20;
	generateTableRow(doc, paidToDatePosition, '', '', 'VAT (20%)', '', GBP(VAT).format());
	const duePosition = paidToDatePosition + 25;
	doc.font('Helvetica-Bold');
	generateTableRow(doc, duePosition, '', '', 'Total', '', GBP(total).format());
	doc.font('Helvetica');
}

const upload = (doc: PDFKit.PDFDocument, filename: string, filepath: string) => {
	return new Promise((resolve, reject) => {
		const file = BUCKET.file(filepath);
		doc.pipe(file.createWriteStream())
			.on('finish', () => {
				resolve(`${filename} uploaded successfully`);
			})
			.on('error', err => {
				console.error(err);
				reject(err);
			});
	});
};
