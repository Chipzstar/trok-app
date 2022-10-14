import React, { useState } from 'react';
import DataGrid from '../components/DataGrid';
import Empty from '../components/Empty';

const StatementsTable = ({ rows }) => {
	const [activePage, setPage] = useState(1);
	return (
		<DataGrid
			rows={rows}
			activePage={activePage}
			setPage={setPage}
			spacingY='md'
			headings={[
				{ label: 'Billing Period', key: null },
				{ label: 'Due At', key: null },
				{ label: 'Total Balance', key: null },
				{ label: 'Actions', key: null }
			]}
			emptyContent={<Empty message={<span className='text-center text-2xl'>You have no statements</span>} />}
		/>
	);
};

export default StatementsTable;
