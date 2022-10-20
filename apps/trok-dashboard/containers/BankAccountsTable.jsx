import React, { useState } from 'react';
import DataGrid from '../components/DataGrid';
import Empty from '../components/Empty';

const BankAccountsTable = ({ rows }) => {
	const [activePage, setPage] = useState(1);
	return (
		<DataGrid
			rows={rows}
			activePage={activePage}
			setPage={setPage}
			spacingY='md'
			headings={[
				{ label: 'Business Account Name', key: null },
				{ label: 'Account Type', key: null },
				{ label: 'Account Number', key: null },
				{ label: 'Sort Code', key: null },
				{ label: '', key: null }
			]}
			emptyContent={
				<Empty
					message={
						<span className='text-center text-2xl'>
							You have no bank account
							<br />
							{"Click the 'Add bank account' button to link one"}
						</span>
					}
				/>
			}
		/>
	);
};

export default BankAccountsTable;
