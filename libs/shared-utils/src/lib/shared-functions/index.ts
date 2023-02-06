import { showNotification } from '@mantine/notifications';
import { PhoneNumberFormat as PNF } from 'google-libphonenumber';
import { phoneUtil } from '../shared-constants';
import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';
import Prisma from '@prisma/client';
import currency from 'currency.js';
import dayjs from 'dayjs';
import { TRANSACTION_STATUS } from '../shared-types';
import orderId from 'order-id';
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const GBP = (value: number, cents = true) => currency(value, { symbol: '£', separator: ',', fromCents: cents, precision: 2 });

export function getRndInteger(min: number, max: number, offset=1) {
	return Math.floor(Math.random() * (max - min + offset)) + min;
}

export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function sanitize(str: string): string {
	return str.replace(/[_-]/g, ' ').toLowerCase();
}

export function notifySuccess(id: string, message: string, icon: JSX.Element) {
	showNotification({
		id,
		disallowClose: true,
		autoClose: 3000,
		title: 'Success',
		message,
		color: 'green',
		icon,
		loading: false
	});
}

export function notifyError(id: string, message: string, icon: JSX.Element) {
	showNotification({
		id,
		disallowClose: true,
		autoClose: 5000,
		title: 'Error',
		message,
		color: 'red',
		icon,
		loading: false
	});
}

export function notifyInfo(id: string, message: string, icon: JSX.Element) {
	showNotification({
		id,
		disallowClose: true,
		onClose: () => console.log('unmounted'),
		onOpen: () => console.log('mounted'),
		autoClose: 5000,
		title: 'Info',
		message,
		color: 'blue',
		icon,
		loading: false
	});
}

export function isValidUrl(urlString: string) {
	try {
		return Boolean(new URL(urlString));
	} catch (e) {
		return false;
	}
}

export function getE164Number(phoneNumber: string) {
	const phone = phoneUtil.parseAndKeepRawInput(phoneNumber, 'GB');
	if (phoneUtil.getRegionCodeForNumber(phone) === 'GB') {
		const E164Number = phoneUtil.format(phone, PNF.E164);
		console.log('E164Number:', E164Number);
		return E164Number;
	}
	return phoneNumber;
}

export function includesCaseInsensitive(this: string, str: string): boolean {
	return this.toLowerCase().trim().includes(str.toLowerCase().trim());
}
export function encrypt(word: string, key: string) {
	const encJson = CryptoJS.AES.encrypt(JSON.stringify(word), key.slice(0, 16)).toString();
	return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson));
}

export function decrypt(word: string, key: string) {
	const decData = CryptoJS.enc.Base64.parse(word).toString(CryptoJS.enc.Utf8);
	const bytes = CryptoJS.AES.decrypt(decData, key.slice(0, 16)).toString(CryptoJS.enc.Utf8);
	return JSON.parse(bytes);
}

export function isStringEqual(a: string, b: string) {
	return a.toLowerCase().trim() === b.toLowerCase().trim();
}

export async function hashPassword(password: string, salt_rounds = 10) {
	const salt = await bcrypt.genSalt(salt_rounds);
	return await bcrypt.hash(password, salt);
}

export async function comparePassword(plaintextPassword: string, hash: string) {
	return await bcrypt.compare(plaintextPassword, hash);
}

export function getDeclineReason(decline_code: Prisma.TransactionDeclineCode, merchant_category: string) : string {
	switch (decline_code) {
		case 'account_disabled':
			return 'Your account is currently disabled. All cards under your account will are blocked until an admin re-enables your account';
		case 'incorrect_pin':
			return 'Cardholder entered an incorrect PIN number';
		case 'insufficient_funds':
			return 'Your issuing account balance does not have enough funds to complete the transaction';
		case 'spending_controls':
		case 'authorization_controls':
			return 'The transaction was declined because of your spending controls';
		case 'card_inactive':
			return 'Cardholder tried making a payment using an inactive card';
		case 'cardholder_inactive':
			return 'This cardholder is currently set as inactive. Please contact support if you want to reactivate this driver';
		case 'suspected_fraud':
			return "This transaction was declined due to suspected fraud. Please contact support if you'd like to investigate this further";
		case 'verification_failed':
			return 'This transaction failed verification checks';
		case "webhook_timeout":
			return "This transaction was auto declined due to a system timeout. Our team has been alerted and are investigating the root cause"
		default:
			return `This card attempted to make a purchase at a prohibited merchant with category: ${merchant_category}. Please review this card's settings if this was unexpected`;
	}
}

export function filterByTimeRange(data: Prisma.Transaction[], range: [Date, Date]) {
	const startDate = dayjs(range[0]).startOf('day');
	const endDate = dayjs(range[1]).endOf('day');
	return data.filter(t => {
		const curr = dayjs(t.created_at);
		return curr.isBefore(endDate) && curr.isAfter(startDate) && t.status === TRANSACTION_STATUS.APPROVED;
	});
}

export function calcPercentageChange(original: number, current: number): number {
	if (!original) return Number.NaN;
	const difference = original - current;
	console.log("difference", difference)
	const percentage_change = (difference / original) * 100
	console.log(percentage_change)
	return percentage_change;
}

export function genInvoiceId() : string {
	return orderId('invoice').generate()
}