import { Button, Drawer, Group, MultiSelect, Stack, Tabs, Text, Title } from '@mantine/core';
import React, { useCallback, useRef, useState } from 'react';
import Page from '../layout/Page';
import TransactionTable from '../containers/TransactionTable';
import { SAMPLE_CARDS, SAMPLE_DRIVERS, SAMPLE_TRANSACTIONS } from '../utils/constants';
import { useForm } from '@mantine/form';
import { uniqueArray } from '../utils/functions';
import { IconCalendar, IconFilter } from '@tabler/icons';
import { DateRangePicker, DateRangePickerValue } from '@mantine/dates';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { trpc } from '../utils/clients';
import { usePapaParse } from 'react-papaparse';
import dayjs from 'dayjs';
import { TransactionStatus } from '@trok-app/shared-utils';

interface ExportForm {
	file_type: 'CSV' | 'PDF';
	transaction_range: DateRangePickerValue;
	locations: string[];
	cards: string[];
	drivers: string[];
}

const Transactions = ({ testMode, session_id }) => {
	const [activeTab, setActiveTab] = useState<TransactionStatus | null>('all');
	const exportRef = useRef(null);
	const { jsonToCSV } = usePapaParse();
	const [csv, setCSV] = useState('');
	const [opened, setOpened] = useState(false);
	const transactionsQuery = trpc.getTransactions.useQuery({ userId: session_id });
	const cardsQuery = trpc.getCards.useQuery({ userId: session_id });
	const driversQuery = trpc.getDrivers.useQuery({ userId: session_id });

	const data = testMode
		? SAMPLE_TRANSACTIONS
		: transactionsQuery?.data
		? transactionsQuery.data.filter(t => activeTab === 'all' || t.status === activeTab)
		: [];

	const form = useForm<ExportForm>({
		initialValues: {
			file_type: 'CSV',
			transaction_range: [null, null],
			locations: [],
			cards: [],
			drivers: []
		},
		validate: {
			transaction_range: value => (value.some(d => d === null) ? 'Please enter a complete time range' : null)
		}
	});

	const filterTransactions = (filters: ExportForm) => {
		return transactionsQuery?.data
			?.filter(t => {
				// if transaction date lies outside the date range, skip transaction
				let isValid = !(
					dayjs(t.created_at).isBefore(filters.transaction_range[0]) ||
					dayjs(t.created_at).isAfter(filters.transaction_range[1]) ||
					(filters.cards.length && !filters.cards.includes(t.cardId)) ||
					(filters.drivers.length && !filters.drivers.includes(t.driverId)) ||
					(filters.locations.length && !filters.locations.includes(t.merchant_data.city))
				);
				console.table({ isValid });
				return isValid;
			})
			.map(t => ({
				['Transaction Id']: t.transaction_id,
				['Created At']: dayjs(t.created_at).format('MMM DD HH:mma'),
				Cardholder: t.cardholder_name,
				['Card Last4']: t.last4,
				Amount: t.transaction_amount,
				Merchant: t.merchant_data.name,
				['Merchant Category']: t.merchant_data.category,
				Type: t.transaction_type,
				City: t.merchant_data.city
			}));
	};

	const handleSubmit = useCallback(
		values => {
			const transactions = filterTransactions(values);
			const results = jsonToCSV(transactions);
			exportRef.current.href = `data:text/csv;charset=utf-8,${results}`;
			exportRef.current.click();
		},
		[exportRef, csv]
	);

	return (
		<Page.Container
			header={
				<Page.Header>
					<span className='text-2xl font-medium'>Transactions</span>
					<Button className='' onClick={() => setOpened(true)}>
						<span className='text-base font-normal'>Export</span>
					</Button>
				</Page.Header>
			}
		>
			<Drawer
				opened={opened}
				onClose={() => setOpened(false)}
				padding='xl'
				size='xl'
				position='right'
				classNames={{
					drawer: 'flex h-full'
				}}
			>
				<Stack justify='center'>
					<Title order={2} weight={500}>
						<span>Export</span>
					</Title>
					<form onSubmit={form.onSubmit(handleSubmit)} className='flex flex-col space-y-4'>
						<Group spacing={5}>
							<IconFilter stroke={1.5} />
							<span className='font-medium'>Filter</span>
						</Group>
						<DateRangePicker
							required
							icon={<IconCalendar size={18} />}
							fullWidth
							size='sm'
							label='Transaction Range'
							placeholder='Pick dates range'
							value={form.values.transaction_range}
							error={form.errors.transaction_range}
							inputFormat='DD/MM/YYYY'
							labelSeparator=' → '
							labelFormat='MMM YYYY'
							onChange={value => form.setFieldValue('transaction_range', value)}
						/>
						<MultiSelect
							label='Locations'
							data={uniqueArray(
								data.map(value => ({
									label: value.merchant_data.city,
									value: value.merchant_data.city
								})),
								'merchant_data.city'
							)}
							{...form.getInputProps('locations')}
						/>
						<MultiSelect
							label='Cards'
							data={
								testMode
									? SAMPLE_CARDS.map(value => ({
											label: value.last4,
											value: value.id
									  }))
									: cardsQuery?.data?.map(value => ({
											label: value.last4,
											value: value.id
									  }))
							}
							{...form.getInputProps('cards')}
						/>
						<MultiSelect
							label='Drivers'
							data={
								testMode
									? SAMPLE_DRIVERS.map(value => ({
											label: value.full_name,
											value: value.full_name
									  }))
									: driversQuery?.data?.map(value => ({
											label: value.full_name,
											value: value.id
									  }))
							}
							{...form.getInputProps('drivers')}
						/>
						<Group py='xl' position='right'>
							<Button type='submit'>
								<Text weight={500}>Export</Text>
							</Button>
							<a
								ref={exportRef}
								href={`data:text/csv;charset=utf-8,${csv}`}
								download={`Transactions - ${dayjs(form.values.transaction_range[0]).format(
									'MMM DD'
								)} - ${dayjs(form.values.transaction_range[1]).format('MMM DD')}.csv`}
								className='hidden'
							>
								<button>DOWNLOAD</button>
							</a>
						</Group>
					</form>
				</Stack>
			</Drawer>
			<Page.Body>
				<Tabs
					defaultValue='all'
					value={activeTab}
					onTabChange={(val: TransactionStatus) => setActiveTab(val)}
					classNames={{
						root: 'flex flex-col grow',
						tabsList: '',
						tab: 'mx-4'
					}}
				>
					<Tabs.List>
						<Tabs.Tab value='all'>All</Tabs.Tab>
						<Tabs.Tab value='approved'>Approved</Tabs.Tab>
						<Tabs.Tab value='declined'>Declined</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='all' className='h-full'>
						<TransactionTable data={data} />
					</Tabs.Panel>

					<Tabs.Panel value='approved' className='h-full'>
						<TransactionTable data={data} />
					</Tabs.Panel>

					<Tabs.Panel value='declined' className='h-full'>
						<TransactionTable data={data} />
					</Tabs.Panel>
				</Tabs>
			</Page.Body>
		</Page.Container>
	);
};

export const getServerSideProps = async ({ req, res }) => {
	// @ts-ignore
	const session = await unstable_getServerSession(req, res, authOptions);
	return {
		props: {
			session_id: session.id,
			stripeAccountId: session?.stripe.account_id
		}
	};
};

export default Transactions;
