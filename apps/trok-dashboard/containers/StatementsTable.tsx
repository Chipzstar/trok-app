import React, { useState } from 'react';
import DataGrid from '../components/DataGrid';
import Empty from '../components/Empty';
import { LoadingOverlay } from '@mantine/core';

const StatementsTable = ({ loading, rows }) => {
	const [activePage, setPage] = useState(1);
	return (
		loading ? <div className='relative h-full'><LoadingOverlay visible={loading} transitionDuration={500} overlayBlur={2} /></div> : <DataGrid
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
