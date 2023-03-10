import { useEffect, useMemo, useState } from 'react';

const calculateRange = (data, rowsPerPage): number[] => {
	const range = [];
	const num = Math.ceil(data.length / rowsPerPage);
	for (let i = 1; i <= num; i++) {
		range.push(i);
	}
	return range;
};

const sliceData = (data, page, rowsPerPage) => {
	return data.slice((page - 1) * rowsPerPage, page * rowsPerPage);
};

export function useTable(data, page, height, rowHeight) {
	const [tableRange, setTableRange] = useState<number[]>([]);
	const [slice, setSlice] = useState<any[]>([]);
	const rowsPerPage = Math.floor(height / rowHeight);

	const startIndex = useMemo(() => page * rowsPerPage - (rowsPerPage - 1), [page, rowsPerPage]);

	const endIndex = useMemo(
		() => (data.length / rowsPerPage <= page ? data.length : rowsPerPage * page),
		[data, page, rowsPerPage]
	);

	useEffect(() => {
		const range = calculateRange(data, rowsPerPage);
		setTableRange([...range]);

		const slice = sliceData(data, page, rowsPerPage);
		setSlice([...slice]);
	}, [data, setTableRange, page, setSlice, height]);

	return { startIndex, endIndex, slice, range: tableRange };
}

export default useTable;

