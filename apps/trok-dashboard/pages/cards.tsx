import React from 'react';
import PageContainer from '../layout/PageContainer';
import { Button, Tabs, Text } from '@mantine/core';
import CardsTable from '../containers/CardsTable';
import { GBP } from '../utils/constants';
import { capitalize, sanitize } from '../utils/functions';
import classNames from 'classnames';
import { CARD_STATUS } from '../utils/types';

const data = [
	{
		created_at: 1665414165,
		status: CARD_STATUS.ACTIVE,
		last4: '2681',
		cardholder_name: 'Joel Cambridge',
		spending_limit: {
			weekly: 468000
		},
		balance: 4679995
	},
	{
		created_at: 1665414165,
		status: CARD_STATUS.ACTIVE,
		last4: '2681',
		cardholder_name: 'Ola Oladapo',
		spending_limit: {
			weekly: 468000
		},
		balance: 4679995
	},
	{
		created_at: 1665414165,
		status: CARD_STATUS.ACTIVE,
		last4: '2681',
		cardholder_name: 'Daniel Oguibe',
		spending_limit: {
			weekly: 468000
		},
		balance: 4679995
	},
	{
		created_at: 1665414165,
		status: CARD_STATUS.ACTIVE,
		last4: '2681',
		cardholder_name: 'King Dave',
		spending_limit: {
			weekly: 468000
		},
		balance: 4679995
	},
	{
		created_at: 1665414165,
		status: CARD_STATUS.INACTIVE,
		last4: '2681',
		cardholder_name: 'Rayan Bannai',
		spending_limit: {
			weekly: 468000
		},
		balance: 4679995
	}
];

const Cards = () => {
	const rows = data.map((element, index) => {
		const statusClass = classNames({
			'py-1': true,
			'w-28': true,
			rounded: true,
			'text-center': true,
			uppercase: true,
			'text-xs': true,
			'tracking-wide': true,
			'font-semibold': true,
			'text-success': element.status === CARD_STATUS.ACTIVE,
			'text-danger': element.status === CARD_STATUS.INACTIVE,
			'bg-success/25': element.status === CARD_STATUS.ACTIVE,
			'bg-danger/25': element.status === CARD_STATUS.INACTIVE
		});

		return (
			<tr
				key={index}
				style={{
					border: 'none'
				}}
			>
				<td colSpan={1}>
					<span>{element.last4}</span>
				</td>
				<td colSpan={1}>
					<div className={statusClass}>
						<span>{sanitize(element.status)}</span>
					</div>
				</td>
				<td colSpan={1}>
					<div className='flex flex-shrink flex-col'>
						<span>{element.cardholder_name}</span>
					</div>
				</td>
				<td colSpan={1}>
					<span>{GBP(element.balance).format()}</span>
				</td>
				<td colSpan={1}>
					<span>{GBP(element.spending_limit.weekly).format()}</span>
				</td>
				<td colSpan={1}>

				</td>
			</tr>
		);
	});

	return (
		<PageContainer
			header={
				<PageContainer.Header>
					<span className='text-2xl font-medium'>Cards</span>
					<Button className='' onClick={() => null}>
						<span className='text-base font-normal'>Add new card</span>
					</Button>
				</PageContainer.Header>
			}
		>
			<PageContainer.Body>
				<Tabs
					defaultValue='all'
					classNames={{
						root: 'flex flex-col grow',
						tabsList: '',
						tab: 'mx-4'
					}}
				>
					<Tabs.List>
						<Tabs.Tab value='all'>All Cards</Tabs.Tab>
						<Tabs.Tab value='active'>Active</Tabs.Tab>
						<Tabs.Tab value='inactive'>Inactive</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='all' pt='xs' className="h-full">
						<CardsTable rows={rows} />
					</Tabs.Panel>

					<Tabs.Panel value='active' pt='xs' className="h-full">
						<CardsTable rows={rows} />
					</Tabs.Panel>

					<Tabs.Panel value='inactive' pt='xs' className="h-full">
						<CardsTable rows={rows} />
					</Tabs.Panel>
				</Tabs>
			</PageContainer.Body>
		</PageContainer>
	);
};

export default Cards;
