import { AppShell, Header, SimpleGrid, Title, Group, Select } from '@mantine/core';
import React, { useState } from 'react';
import Image from 'next/image';
import Stat from '../components/Stat';
import { trpc } from '../utils/clients';
import { CategoryScale, Chart, LinearScale, PointElement, LineElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import TransactionsChart from '../components/TransactionsChart';
import dayjs from 'dayjs';
import { DateRangePickerValue } from '@mantine/dates';
import { INTERVAL, TimeInterval } from '../utils/types';
import { capitalize, sanitize } from '@trok-app/shared-utils';
import useWindowSize from '../hooks/useWindowSize';

Chart.register(CategoryScale, LineElement, LinearScale, ChartDataLabels, PointElement);

const DEFAULT_HEADER_HEIGHT = 65;

const intervals: Record<INTERVAL, DateRangePickerValue> = {
	[INTERVAL.TODAY]: [dayjs().startOf('d').toDate(), dayjs().endOf('d').toDate()],
	[INTERVAL.LAST_3_DAYS]: [dayjs().subtract(3, 'd').startOf('d').toDate(), dayjs().endOf('d').toDate()],
	[INTERVAL.LAST_WEEK]: [
		dayjs().subtract(1, 'week').startOf('week').toDate(),
		dayjs().subtract(1, 'week').endOf('week').toDate()
	],
	[INTERVAL.THIS_MONTH]: [dayjs().startOf('month').toDate(), dayjs().endOf('d').toDate()],
	[INTERVAL.LAST_MONTH]: [
		dayjs().subtract(1, 'month').startOf('month').toDate(),
		dayjs().subtract(1, 'month').endOf('month').toDate()
	],
	[INTERVAL.THIS_YEAR]: [dayjs().startOf('year').toDate(), dayjs().endOf('d').toDate()]
};

export function Main() {
	const [interval, setInterval] = useState<TimeInterval>('Last 3 Days');
	const [range, setRange] = useState<DateRangePickerValue>(intervals[INTERVAL.LAST_3_DAYS]);
	const { height } = useWindowSize();
	const users = trpc.countUsers.useQuery();
	const cards = trpc.countCards.useQuery();
	const cardholders = trpc.countDrivers.useQuery();
	const transactions = trpc.countTransactionAmount.useQuery();

	return (
		<AppShell
			padding={0}
			header={
				<Header height={DEFAULT_HEADER_HEIGHT} zIndex={50} p='md'>
					<Group align='center' spacing="xs">
						<Image src='/static/images/logo-blue.svg' height={30} width={30} />
						<span className='text-2xl font-semibold'>Trok Analytics</span>
					</Group>
				</Header>
			}
			styles={theme => ({
				main: {
					backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]
				}
			})}
		>
			<div className='space-y-6 p-8'>
				<SimpleGrid
					cols={4}
					breakpoints={[
						{ maxWidth: 'md', cols: 2 },
						{ maxWidth: 'xs', cols: 1 }
					]}
				>
					<Stat
						title={'Number of Users'}
						icon='user'
						value={users.data?.length}
						diff={50}
						loading={users.isLoading}
					/>
					<Stat
						title={'Number of Cards'}
						icon='card'
						value={cards.data}
						diff={50}
						loading={cards.isLoading}
					/>
					<Stat
						title={'Number of Cardholders'}
						icon='cardholder'
						value={cardholders.data}
						diff={50}
						loading={cardholders.isLoading}
					/>
					<Stat
						title={'Total Transaction Amount'}
						icon='cash'
						value={transactions.data}
						diff={50}
						loading={transactions.isLoading}
						is_currency
					/>
				</SimpleGrid>
				<Group position='apart'>
					<Title order={2} weight={500}>Transactions Timeline</Title>
					<Select
						size='md'
						value={interval}
						onChange={val => {
							setInterval(val as TimeInterval);
							setRange(intervals[val]);
						}}
						data={Object.values(INTERVAL).map(item => ({
							label: capitalize(sanitize(item)),
							value: item
						}))}
					/>
				</Group>
				<TransactionsChart dateRange={range} />
			</div>
		</AppShell>
	);
}

export default Main;
