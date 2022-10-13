export type TableHeadings = {
	label: string;
	key: string | null
}

export enum CARD_STATUS {
	ACTIVE="active",
	INACTIVE="inactive"
}

export enum PAYMENT_STATUS {
	IN_PROGRESS="in_progress",
	COMPLETE="complete",
	FAILED="failed"
}