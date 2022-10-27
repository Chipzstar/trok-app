import { Button, Drawer, Group, MultiSelect, Select, Stack, Tabs, Text, Title } from '@mantine/core';
import React, { useCallback, useState } from 'react';
import dayjs from 'dayjs';
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

interface ExportForm {
	file_type: 'CSV' | 'PDF';
	transaction_range: DateRangePickerValue;
	locations: string[];
	cards: string[];
	drivers: string[];
}

const Transactions = ({ testMode, sessionID }) => {
	const [opened, setOpened] = useState(false);
	const query = trpc.getTransactions.useQuery({ userId: sessionID });

	const rows = testMode
		? SAMPLE_TRANSACTIONS.map((element, index) => {
				return (
					<tr key={index}>
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
					</tr>
				);
		  })
		: !query.isLoading
		? query?.data.map((t, index) => {
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
							<span className='text-base font-normal'>£{t.transaction_amount / 100}</span>
						</td>
					</tr>
				);
		  })
		: [];

	const form = useForm<ExportForm>({
		initialValues: {
			file_type: 'CSV',
			transaction_range: [null, null],
			locations: [],
			cards: [],
			drivers: []
		}
	});

	const handleSubmit = useCallback(values => {
		alert(JSON.stringify(values));
		console.log(values);
	}, []);

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
						<Select required label='File Type' data={['PDF', 'CSV']} {...form.getInputProps('type')} />
						<Group spacing={5}>
							<IconFilter stroke={1.5} />
							<span className='font-medium'>Filter</span>
						</Group>
						<DateRangePicker
							icon={<IconCalendar size={18} />}
							fullWidth
							size='sm'
							label='Transaction Range'
							placeholder='Pick dates range'
							value={form.values.transaction_range}
							inputFormat='DD/MM/YYYY'
							labelSeparator=' → '
							labelFormat='MMM YYYY'
							onChange={value => form.setFieldValue('transaction_range', value)}
						/>
						<MultiSelect
							label='Locations'
							data={uniqueArray(
								SAMPLE_TRANSACTIONS.map(value => ({
									label: value.location,
									value: value.id
								})),
								'location'
							)}
							{...form.getInputProps('locations')}
						/>
						<MultiSelect
							label='Cards'
							data={SAMPLE_CARDS.map(value => ({
								label: value.last4,
								value: value.id
							}))}
							{...form.getInputProps('cards')}
						/>
						<MultiSelect
							label='Drivers'
							data={SAMPLE_DRIVERS.map(value => ({
								label: value.full_name,
								value: value.full_name
							}))}
							{...form.getInputProps('drivers')}
						/>
						<Group py='xl' position='right'>
							<Button type='submit'>
								<Text weight={500}>Export</Text>
							</Button>
						</Group>
					</form>
				</Stack>
			</Drawer>
			<Page.Body>
				<Tabs
					defaultValue='all'
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
						<TransactionTable rows={rows} />
					</Tabs.Panel>

					<Tabs.Panel value='approved' className='h-full'>
						<TransactionTable rows={rows} />
					</Tabs.Panel>

					<Tabs.Panel value='declined' className='h-full'>
						<TransactionTable rows={rows} />
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
			sessionID: session.id,
			stripeAccountId: session?.stripeId
		}
	};
};

export default Transactions;
