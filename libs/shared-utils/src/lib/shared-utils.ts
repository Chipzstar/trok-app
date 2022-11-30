import { showNotification } from '@mantine/notifications';
import { PhoneNumberFormat as PNF } from 'google-libphonenumber';
import { phoneUtil } from './shared-constants';
import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';
import Prisma from '@prisma/client';

export function notifySuccess(id: string, message: string, icon: JSX.Element) {
	showNotification({
		id,
		disallowClose: true,
		onClose: () => console.log('unmounted'),
		onOpen: () => console.log('mounted'),
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
		onClose: () => console.log('unmounted'),
		onOpen: () => console.log('mounted'),
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

export function checkIfNullOrUndefined(variable: any) {
	return typeof variable === 'undefined' || variable === null;
}

export function encrypt(word: string, key: string) {
	let encJson = CryptoJS.AES.encrypt(JSON.stringify(word), key.slice(0, 16)).toString();
	return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson));
}

export function decrypt(word: string, key: string) {
	let decData = CryptoJS.enc.Base64.parse(word).toString(CryptoJS.enc.Utf8);
	let bytes = CryptoJS.AES.decrypt(decData, key.slice(0, 16)).toString(CryptoJS.enc.Utf8);
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
			return `This card attempted to make a purchase at a non-fuel card merchant with category: ${merchant_category}`;
	}
}
