import React, { useState } from 'react';
import DataGrid from '../components/DataGrid';
import Empty from '../components/Empty';

const PaymentsTable = ({rows}) => {
	const [activePage, setPage] = useState(1)
	return (
		<DataGrid
			rows={rows}
			activePage={activePage}
			setPage={setPage}
			spacingY='md'
			headings={[
				{ label: 'Sent Date', key: null },
				{ label: 'Sent To', key: null },
				{ label: 'Method', key: null },
				{ label: 'Amount', key: null },
				{ label: 'Status', key: null },
				{ label: '', key: null }
			]}
			emptyContent={
				<Empty
					message={
						<span className='text-center text-2xl'>
								You have no payments
								<br />
							{"Click the 'Send Payment' button to top-up your driver's card"}
							</span>
					}
				/>
			}
		/>
	);
};

export default PaymentsTable;
