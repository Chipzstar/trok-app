import { showNotification } from '@mantine/notifications';
import { PhoneNumberFormat as PNF, PhoneNumberUtil } from 'google-libphonenumber';
import currency from 'currency.js';

export const phoneUtil = PhoneNumberUtil.getInstance();

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

export function isValidUrl(urlString: string) {
	try {
		return Boolean(new URL(urlString));
	}
	catch(e){
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
	return phoneNumber
}

export function includesCaseInsensitive(this: string, str: string): boolean {
	return this.toLowerCase().includes(str.toLowerCase());
}

export function checkIfNullOrUndefined(variable: any) {
	return typeof variable === 'undefined' || variable === null;
}

export const GBP = (value: number) => currency(value, { symbol: '£', separator: ',', fromCents: true });