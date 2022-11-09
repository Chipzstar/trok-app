import React, { useState } from 'react';
import Empty from '../components/Empty';
import DataGrid from '../components/DataGrid';
import { MantineNumberSize, Text } from '@mantine/core';
import dayjs from 'dayjs';
import { GBP } from '@trok-app/shared-utils';

const TransactionTable = ({ data, spacingY = 'md', withPagination = true }) => {
	const [activePage, setPage] = useState(1);

	const rows = data.map((t, index) => {
		return (
			<tr key={index}>
				<td colSpan={1}>
					<span>{dayjs(t.created_at).format('MMM DD HH:mma')}</span>
				</td>
				<td colSpan={1}>
					<span>{t.merchant_data.name}</span>
				</td>
				<td colSpan={1}>
					<div className='flex flex-shrink flex-col'>
						<span>
							{t.merchant_data.city} {t.merchant_data.postcode}
						</span>
					</div>
				</td>
				<td colSpan={1}>
					<span>{t.last4}</span>
				</td>
				<td colSpan={1}>
					<Text weight={500}>{t.cardholder_name}</Text>
				</td>
				<td colSpan={1}>
					<span className='text-base font-normal'>{GBP(t.transaction_amount).format()}</span>
				</td>
				<td colSpan={1}>
					<span>{t?.purchase_details?.fuel_type ?? "-"}</span>
				</td>
				<td colSpan={1}>
					<span>{t?.purchase_details?.volume ?? "-"}</span>
				</td>
				<td colSpan={1}>
					<span>{t?.purchase_details?.unit_cost_decimal ? t?.purchase_details?.unit_cost_decimal + "p" :  "-"}</span>
				</td>
			</tr>
		);
	});

	return (
		<DataGrid
			rows={rows}
			activePage={activePage}
			setPage={setPage}
			spacingY={spacingY as MantineNumberSize}
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
				{ label: 'Type', key: null },
				{ label: 'Litres', key: null },
				{ label: 'Price Per Litre', key: null }
			]}
			withPagination={withPagination}
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
