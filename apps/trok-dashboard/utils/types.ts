export type TableHeadings = {
	label: string;
	key: string | null;
};

export interface SelectInput {
	value: string | number;
	label: string;
	group?: string
}