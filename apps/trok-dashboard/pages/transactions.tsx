import { Button, Tabs, Text } from '@mantine/core';
import React from 'react';
import dayjs from 'dayjs';
import Page from '../layout/Page';
import TransactionTable from '../containers/TransactionTable';
import { SAMPLE_TRANSACTIONS } from '../utils/constants';

const Transactions = () => {
	const rows = SAMPLE_TRANSACTIONS.map((element, index) => {
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
		<Page.Container
			header={
				<Page.Header>
					<span className='text-2xl font-medium'>Transactions</span>
					<Button className='' onClick={() => null}>
						<span className='text-base font-normal'>Export</span>
					</Button>
				</Page.Header>
			}
		>
			<Page.Body>
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
			</Page.Body>
		</Page.Container>
	);
};

export default Transactions;
