import React, { useState } from 'react';
import Empty from '../components/Empty';
import DataGrid from '../components/DataGrid';
import { useRouter } from 'next/router';

const TransactionTable = ({rows}) => {
	const router = useRouter();
	const [activePage, setPage] = useState(1);
	return (
		<DataGrid
			rows={rows}
			activePage={activePage}
			setPage={setPage}
			spacingY='md'
			headings={[
				{ label: 'Transacted', key: null },
				{ label: 'Merchant', key: null },
				{ label: 'Location', key: null },
				{ label: 'Card', key: null },
				{
					label: 'Driver',
					key: null
				},
				{ label: 'Amount', key: null },
				{ label: 'Net of Discount', key: null },
				{ label: 'Type', key: null },
				{ label: 'Litres', key: null },
				{ label: 'Price Per Litre', key: null }
			]}
			emptyContent={
				<Empty
					message={
						<span className='text-center text-2xl'>
									You have no transactions
									<br />
									Your transaction will appear once your drivers start using their fuel cards
								</span>
					}
				/>
			}
		/>
	);
};

export default TransactionTable;
