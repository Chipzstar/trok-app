import { Button, Tabs, Text } from '@mantine/core';
import React from 'react';
import dayjs from 'dayjs';
import PageContainer from '../layout/PageContainer';
import TransactionTable from '../containers/TransactionTable';

const data = [
	{
		date_of_transaction: 1665414165,
		posted_date: 1665421245,
		merchant: 'BP Fuel',
		location: '319 Cambridge Heath Rd, London E2 9LH',
		last4: '2681',
		driver: 'Joel Cambridge',
		amount: 468000,
		net_discount: 4679995,
		type: 'fuel',
		litres: 120,
		price_per_litre: 17080
	},
	{
		date_of_transaction: 1665414165,
		posted_date: 1665421245,
		merchant: 'BP Fuel',
		location: '319 Cambridge Heath Rd, London E2 9LH',
		last4: '2681',
		driver: 'Joel Cambridge',
		amount: 468000,
		net_discount: 4679995,
		type: 'fuel',
		litres: 120,
		price_per_litre: 17080
	},
	{
		date_of_transaction: 1665414165,
		posted_date: 1665421245,
		merchant: 'BP Fuel',
		location: '319 Cambridge Heath Rd, London E2 9LH',
		last4: '2681',
		driver: 'Joel Cambridge',
		amount: 468000,
		net_discount: 4679995,
		type: 'fuel',
		litres: 120,
		price_per_litre: 17080
	},
	{
		date_of_transaction: 1665414165,
		posted_date: 1665421245,
		merchant: 'BP Fuel',
		location: '319 Cambridge Heath Rd, London E2 9LH',
		last4: '2681',
		driver: 'Joel Cambridge',
		amount: 468000,
		net_discount: 4679995,
		type: 'fuel',
		litres: 120,
		price_per_litre: 17080
	},
	{
		date_of_transaction: 1665414165,
		posted_date: 1665421245,
		merchant: 'BP Fuel',
		location: '319 Cambridge Heath Rd, London E2 9LH',
		last4: '2681',
		driver: 'Joel Cambridge',
		amount: 468000,
		net_discount: 4679995,
		type: 'fuel',
		litres: 120,
		price_per_litre: 17080
	}
];

const Transactions = () => {
	const rows = data.map((element, index) => {
		return (
			<tr key={index} style={{
				border: 'none'
			}}>
				<td colSpan={1}>
					<span>{dayjs.unix(element.date_of_transaction).format('MMM DD HH:mma')}</span>
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
					<span>{element.last4}</span>
				</td>
				<td colSpan={1}>
					<Text weight={500}>{element.driver}</Text>
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
					<span>£{element.price_per_litre / 100}p</span>
				</td>
			</tr>
		);
	});

	return (
		<PageContainer
			header={
				<PageContainer.Header>
					<span className='text-2xl font-medium'>Transactions</span>
					<Button className='' onClick={() => null}>
						<span className='text-base font-normal'>Export</span>
					</Button>
				</PageContainer.Header>
			}
		>
			<PageContainer.Body>
				<Tabs defaultValue="all" classNames={{
					root: 'flex flex-col grow',
					tabsList: '',
					tab: 'mx-4'
				}}>
					<Tabs.List>
						<Tabs.Tab value="all">All</Tabs.Tab>
						<Tabs.Tab value="approved" >Approved</Tabs.Tab>
						<Tabs.Tab value="declined">Declined</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value="all" pt="xs" className="h-full">
						<TransactionTable rows={rows}/>
					</Tabs.Panel>

					<Tabs.Panel value="approved" pt="xs" className="h-full">
						<TransactionTable rows={rows}/>
					</Tabs.Panel>

					<Tabs.Panel value="declined" pt="xs" className="h-full">
						<TransactionTable rows={rows}/>
					</Tabs.Panel>
				</Tabs>
			</PageContainer.Body>
		</PageContainer>
	);
};

export default Transactions;
