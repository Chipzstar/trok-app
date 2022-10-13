import React, { useState } from 'react';
import { useRouter } from 'next/router';
import DataGrid from '../components/DataGrid';
import Empty from '../components/Empty';

const CardsTable = ({ rows }) => {
	const router = useRouter();
	const [activePage, setPage] = useState(1);
	return (
		<DataGrid
			rows={rows}
			activePage={activePage}
			setPage={setPage}
			spacingY='md'
			headings={[
				{ label: 'Card Number', key: null },
				{ label: 'Status', key: null },
				{ label: 'Assigned ', key: null },
				{ label: 'Balance', key: null },
				{ label: 'Weekly Spend Limit', key: null },
				{ label: '', key: null }
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

export default CardsTable;
