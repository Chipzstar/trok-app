import React, { useState } from 'react';
import Empty from '../components/Empty';
import DataGrid from '../components/DataGrid';

const DriversTable = ({rows}) => {
	const [activePage, setPage] = useState(1)
	return (
		<DataGrid
			rows={rows}
			activePage={activePage}
			setPage={setPage}
			spacingY='md'
			headings={[
				{ label: 'First Name', key: null },
				{ label: 'Last Name', key: null },
				{ label: 'Spend', key: null },
				{ label: 'Limit', key: null },
				{ label: 'Phone Number', key: null },
				{ label: 'Email', key: null },
				{ label: '', key: null }
			]}
			emptyContent={
				<Empty
					message={
						<span className='text-center text-2xl'>
								You have no drivers
								<br />
							{"Click the 'Add Driver' button to add one"}
							</span>
					}
				/>
			}
		/>
	);
};

export default DriversTable;
