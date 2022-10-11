import { useState, useEffect } from 'react';

// @ts-ignore
const calculateRange = (data, rowsPerPage): Number[] => {
	const range = [];
	const num = Math.ceil(data.length / rowsPerPage);
	for (let i = 1; i <= num; i++) {
		range.push(i);
	}
	return range;
};

// @ts-ignore
const sliceData = (data, page, rowsPerPage) => {
	return data.slice((page - 1) * rowsPerPage, page * rowsPerPage);
};

// @ts-ignore
export function useTable(data, page, height, rowHeight) {
	const [tableRange, setTableRange] = useState<Number[]>([]);
	const [slice, setSlice] = useState<any[]>([]);
	const rowsPerPage = Math.floor(height / rowHeight);

	useEffect(() => {
		const range = calculateRange(data, rowsPerPage);
		setTableRange([...range]);

		const slice = sliceData(data, page, rowsPerPage);
		setSlice([...slice]);
	}, [data, setTableRange, page, setSlice, height]);

	return { slice, range: tableRange };
}

export default useTable;

