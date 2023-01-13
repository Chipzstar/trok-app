import React, { FocusEventHandler } from 'react';

export type TableHeadings = {
	label: string;
	key: string | null;
};

export interface LineItem {
	id: string;
	name: string;
	quantity: number;
	price: number;
	description?: string;
	editing?: boolean;
}

export enum GRIFFIN_VERIFICATION_STATUS {
	COMPLETE = 'checks-complete',
	FAILED = 'failed',
	PENDING = 'pending',
	IN_PROGRESS = 'in-progress'
}

export enum GRIFFIN_RISK_RATING {
	HIGH = 'high-risk',
	MEDIUM = 'medium-risk',
	LOW = 'low-risk'
}

export interface DynamicInputFieldProps {
	editMode: boolean;
	disabled?: boolean;
	value: any;
	onChange: (event: string | null | React.ChangeEvent<HTMLInputElement>) => void;
	error?: string;
	onFocus?: FocusEventHandler<HTMLInputElement>;
	onBlur?: FocusEventHandler<HTMLInputElement>;
	is_merchant_code?: boolean;
	is_business_type?: boolean;
	isPassword?: boolean;
}

export interface InvoiceFormValues {
	pod: string | null;
	invoice: string | null;
}
