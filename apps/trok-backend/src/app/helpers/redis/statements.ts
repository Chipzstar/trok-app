import redisClient from '../../redis';
import { BUCKET, STATEMENT_REDIS_SORTED_SET_ID } from '../../utils/constants';
import * as dayjs from 'dayjs';
import prisma from '../../db';
import * as path from 'path';
import * as fs from 'fs';
import * as easyinvoice from 'easyinvoice';
import { InvoiceData } from 'easyinvoice';
import * as Prisma from '@prisma/client';
import orderId from 'order-id';
import { generateDownloadUrl } from '../gcp';

const order_id = orderId(String(process.env.ENC_SECRET));

export async function checkPastDueStatements() {
	const MAX = dayjs().add(1, 'h').unix();
	const MIN = dayjs().subtract(1, 'h').unix();
	console.table({ MAX, MIN });
	const user_ids = await redisClient.zrange(STATEMENT_REDIS_SORTED_SET_ID, MIN, MAX, 'BYSCORE', (err, res) =>
		console.log('RESULT:', res)
	);
	// generate statement for each entry
	const result = user_ids.map(async (id, index) => {
		const statement_interval = await redisClient.hgetall(id);
		const { period_start, period_end } = statement_interval;
		// fetch the user's business information
		const user = await prisma.user.findUniqueOrThrow({
			where: {
				id
			}
		});
		// fetch all the transactions within the time range
		const transactions = await prisma.transaction.findMany({
			where: {
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
		// push statement into database
		const statement = await prisma.statement.create({
			data: {
				statement_id,
				period_start: dayjs.unix(Number(period_start)).toDate(),
				period_end: dayjs.unix(Number(period_start)).toDate(),
				userId: user.id,
				download_url: url,
				total_balance: transactions.reduce((prev, curr) => prev + curr.transaction_amount, 0)
			}
		});
		console.log(statement);
		// increment score of the sorted set entry for next month
		await redisClient.zadd(STATEMENT_REDIS_SORTED_SET_ID, dayjs().add(7, 'd').unix(), id)
		// adjust the start & end periods for the next statement
		await redisClient.hmset(id, "period_start", dayjs().unix(), "period_end", dayjs().add(7, 'd').unix())
		return statement;
	});
	return true;
}

async function generateStatement(statement_id: string, user: Prisma.User, transactions: Prisma.Transaction[]) {
	try {
		const data: InvoiceData = {
			// Customize enables you to provide your own templates
			// Please review the documentation for instructions and examples
			customize: {
				// @ts-ignore
				template: fs.readFileSync(path.join(__dirname, '/assets/weekly_statement_template.html'), 'base64') // Must be base64 encoded html
			},
			images: {
				// The logo on top of your invoice
				// @ts-ignore
				logo: fs.readFileSync(path.join(__dirname, '/assets/logo.png'), 'base64'),
				// The invoice background
				background: fs.readFileSync(path.join(__dirname, '/assets/watermark.jpg'), 'base64')
			},
			// Your own data
			sender: {
				company: 'Trok',
				address: '42 Linton Road',
				zip: 'IG11 8FS',
				city: 'Barking',
				country: 'United Kingdom'
				//"custom1": "custom value 1",
				//"custom2": "custom value 2",
				//"custom3": "custom value 3"
			},
			// Your recipient
			client: {
				company: user.business.legal_name,
				address: user.location.line1 + user.location.line2,
				zip: user.location.postcode,
				city: user.location.city,
				country: user.location.country
				// "custom1": "custom value 1",
				// "custom2": "custom value 2",
				// "custom3": "custom value 3"
			},
			information: {
				// Invoice number
				number: `#${statement_id}`,
				// Invoice data
				date: dayjs().format('DD MMM YYYY')
			},
			// The products you would like to see on your invoice
			// Total values are being calculated automatically
			products: transactions.map(t => {
				console.log(t.created_at);
				return {
					prod_date: dayjs(t.created_at).format('MMM D HH:mm'),
					quantity: '1',
					description: t.merchant_data.name ?? t.merchant_data.category,
					'tax-rate': 20,
					price: t.transaction_amount / 100
				};
			}),
			// The message you would like to display on the bottom of your invoice
			'bottom-notice': 'Thank you for using Trok :).',
			// Settings to customize your invoice
			settings: {
				currency: 'GBP', // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
				locale: 'en-GB' // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')
				// "tax-notation": "gst", // Defaults to 'vat'
				// "margin-top": 25, // Defaults to '25'
				// "margin-right": 25, // Defaults to '25'
				// "margin-left": 25, // Defaults to '25'
				// "margin-bottom": 25, // Defaults to '25'
				// "format": "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
				// "height": "1000px", // allowed units: mm, cm, in, px
				// "width": "500px", // allowed units: mm, cm, in, px
				// "orientation": "landscape", // portrait or landscape, defaults to portrait
			},
			// Translate your invoice to your preferred language
			translate: {
				// "invoice": "FACTUUR",  // Default to 'INVOICE'
				// number: 'Nummer', // Defaults to 'Number'
				// "date": "Datum", // Default to 'Date'
				// "due-date": "Verloopdatum", // Defaults to 'Due Date'
				// "subtotal": "Subtotaal", // Defaults to 'Subtotal'
				// "products": "Producten", // Defaults to 'Products'
				// quantity: 'Aantal' // Default to 'Quantity'
				// "price": "Prijs", // Defaults to 'Price'
				// "product-total": "Totaal", // Defaults to 'Total'
				// "total": "Totaal" // Defaults to 'Total'
			}
		};
		const doc = await easyinvoice.createInvoice(data);
		// console.log('PDF base64 string: ', result.pdf);
		// store the file locally in nodejs
		await fs.writeFileSync('invoice.pdf', doc.pdf, 'base64');
		// store pdf to cloud bucket
		const fileBuffer = Buffer.from(doc.pdf, 'base64');
		const filepath = `${user.business.business_crn}/STATEMENTS/${statement_id}.pdf`;
		const gcpFile = BUCKET.file(filepath);
		await gcpFile.save(fileBuffer, {public: true});

		console.log('upload finished');
		const url = await generateDownloadUrl(filepath);
		console.log('************************************************');
		console.log(url);
		return url;
	} catch (err) {
		console.error(err);
		throw err;
	}
}
