export type TableHeadings = {
	label: string;
	key: string | null;
};

export interface SelectInput {
	value: string | number;
	label: string;
	group?: string
}

export interface LineItem {
	id: string;
	name: string
	quantity: number
	price: number
	description?: string
	editing?: boolean
}

export enum GRIFFIN_VERIFICATION_STATUS {
	COMPLETE='checks-complete',
	FAILED='failed',
	PENDING='pending',
	IN_PROGRESS= 'in-progress'
}

export enum GRIFFIN_RISK_RATING {
	HIGH="high-risk",
	MEDIUM="medium-risk",
    LOW="low-risk"
}