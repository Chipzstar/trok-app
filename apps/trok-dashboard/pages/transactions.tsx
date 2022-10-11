import { Group, Text, Avatar, Switch, Button } from '@mantine/core';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import DataGrid from '../components/DataGrid';
import Empty from '../components/Empty';
import dayjs from 'dayjs';

const data = [
	{
		date_of_transaction: 1665414165,
		posted_date: 1665421245,
		merchant: 'BP Fuel',
		location: '319 Cambridge Heath Rd, London E2 9LH',
		driver: 'Joel Cambridge',
		amount: 468000,
		net_discount: 4679995,
		type: 'fuel',
		litres: 120,
		price_per_litre: 17080
	}
];

const transactions = () => {
	const router = useRouter();
	const [activePage, setPage] = useState(1);
	const rows = data.map((element, index) => {
		return (
			<tr key={index}>
				<td colSpan={1}>
					<span>{dayjs.unix(element.date_of_transaction).format('DD MMM YY HH:mm')}</span>
				</td>
				<td colSpan={1}>
					<span>{dayjs.unix(element.posted_date).format('DD MMM YY HH:mm')}</span>
				</td>
				<td colSpan={1}>
					<span>{element.merchant}</span>
				</td>
				<td colSpan={1}>
					<div className='flex flex-shrink flex-col'>
						<span>{element.location}</span>
					</div>
				</td>
				<td colSpan={1}>
					<Text weight={500}>
						{element.driver}
					</Text>
				</td>
				<td colSpan={1}>
					<span className='text-base font-normal'>£{element.amount / 100}</span>
				</td>
				<td colSpan={1}>
					<span>£{element.net_discount / 100}</span>
				</td>
				<td colSpan={1}>
					<span>{element.type}</span>
				</td>
				<td colSpan={1}>
					<span>{element.litres}</span>
				</td>
				<td colSpan={1}>
					<span>£{element.price_per_litre / 100}</span>
				</td>
			</tr>
		);
	});

	return (
		<div className='container p-5'>
			<div className='mt-2 mb-6 flex items-center justify-between px-2'>
				<span className="text-3xl font-semibold">Transactions</span>
				<Button className='' onClick={() => null}>
					<span className='text-base'>Export</span>
				</Button>
			</div>
			<DataGrid
				rows={rows}
				activePage={activePage}
				setPage={setPage}
				spacingY='md'
				headings={[
					{ label: 'Transaction Date', key: null },
					{
						label: 'Posted Date',
						key: null
					},
					{ label: 'Merchant', key: null },
					{ label: 'Location', key: null },
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
		</div>
	);
};

export default transactions;
