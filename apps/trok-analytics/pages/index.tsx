import { AppShell, Group, Header, Select, SimpleGrid, Title } from '@mantine/core';
import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Stat from '../components/Stat';
import { trpc } from '../utils/clients';
import { CategoryScale, Chart, LinearScale, LineElement, PointElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import TransactionsChart from '../components/TransactionsChart';
import dayjs from 'dayjs';
import { DateRangePickerValue } from '@mantine/dates';
import { INTERVAL, TimeInterval } from '../utils/types';
import { calcPercentageChange, capitalize, ONE_MINUTE, sanitize } from '@trok-app/shared-utils';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import isBetween from 'dayjs/plugin/isBetween';
import useWindowSize from '../hooks/useWindowSize';

dayjs.extend(advancedFormat);
dayjs.extend(isBetween);

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
	const { height } = useWindowSize();
	const [interval, setInterval] = useState<TimeInterval>('Last 3 Days');
	const [range, setRange] = useState<DateRangePickerValue>(intervals[INTERVAL.LAST_3_DAYS]);
	const users = trpc.countUsers.useQuery(null, {refetchInterval: ONE_MINUTE});
	const cards = trpc.countCards.useQuery(null, {refetchInterval: ONE_MINUTE});
	const cardholders = trpc.countDrivers.useQuery(null, {refetchInterval: ONE_MINUTE});
	const transaction_amount = trpc.countTransactionAmount.useQuery(null, {refetchInterval: ONE_MINUTE});
	const transactions = trpc.getApprovedTransactions.useQuery(null, {refetchInterval: ONE_MINUTE})

	const users_diff = useMemo(() => {
		if (users.data) {
			const curr_filtered_users = users.data.filter(
				user => dayjs(user.created_at).isBetween(
					dayjs().startOf('month'),
					dayjs().endOf('month'),
					'day'
				));
			const prev_filtered_users = users.data.filter(
				user => dayjs(user.created_at).isBetween(
					dayjs().subtract(1, "month").startOf('month'),
					dayjs().subtract(1, "month").endOf('month'),
					'day'
				));
			return calcPercentageChange(curr_filtered_users.length, prev_filtered_users.length);
		}
		return Number.NaN
	}, [users])

	const cards_diff = useMemo(() => {
		if (cards.data) {
			const curr_filtered_cards = cards.data.filter(
				c => dayjs(c.created_at).isBetween(
					dayjs().startOf('month'),
					dayjs().endOf('month'),
					'day'
				));
			console.log("CURRENT CARDS");
			curr_filtered_cards.forEach((c, i) => console.log(i + ": ", dayjs(c.created_at).format("DD-MM-YYYY")))
			const prev_filtered_cards = cards.data.filter(
				c => dayjs(c.created_at).isBetween(
					dayjs().subtract(1, "month").startOf('month'),
					dayjs().subtract(1, "month").endOf('month'),
					'day'
				));
			console.log("PREVIOUS CARDS");
			prev_filtered_cards.forEach((card, i) => console.log(i + ": ", dayjs(card.created_at).format("DD-MM-YYYY")))
			return calcPercentageChange(curr_filtered_cards.length, prev_filtered_cards.length);
		}
		return Number.NaN
	}, [cards])

	const cardholders_diff = useMemo(() => {
		if (cardholders.data) {
			const curr_filtered_cardholders = cardholders.data.filter(
				c => dayjs(c.created_at).isBetween(
					dayjs().startOf('month'),
					dayjs().endOf('month'),
					'day'
				));
			console.log("CURRENT cardholders");
			curr_filtered_cardholders.forEach((c, i) => console.log(i + ": ", dayjs(c.created_at).format("DD-MM-YYYY")))
			const prev_filtered_cardholders = cardholders.data.filter(
				c => dayjs(c.created_at).isBetween(
					dayjs().subtract(1, "month").startOf('month'),
					dayjs().subtract(1, "month").endOf('month'),
					'day'
				));
			console.log("PREVIOUS cardholders");
			prev_filtered_cardholders.forEach((c, i) => console.log(i + ": ", dayjs(c.created_at).format("DD-MM-YYYY")))
			return calcPercentageChange(curr_filtered_cardholders.length, prev_filtered_cardholders.length);
		}
		return Number.NaN
	}, [cardholders])

	const transactions_diff = useMemo(() => {
		if (transactions.data) {
			const curr_transactions_amount = transactions.data.filter(
				c => dayjs(c.created_at).isBetween(
					dayjs().startOf('month'),
					dayjs().endOf('month'),
					'day'
				)).reduce((prev, curr) => prev + curr.transaction_amount, 0);
			console.log("CURRENT transactions total:", curr_transactions_amount);
			const prev_transactions_amount = transactions.data.filter(
				c => dayjs(c.created_at).isBetween(
					dayjs().subtract(1, "month").startOf('month'),
					dayjs().subtract(1, "month").endOf('month'),
					'day'
				)).reduce((prev, curr) => prev + curr.transaction_amount, 0);
			console.log("PREVIOUS transactions", );
			return calcPercentageChange(curr_transactions_amount, prev_transactions_amount);
		}
		return Number.NaN
	}, [transactions]);

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
						diff={users_diff}
						loading={users.isLoading}
					/>
					<Stat
						title={'Number of Cards'}
						icon='card'
						value={cards.data?.length}
						diff={cards_diff}
						loading={cards.isLoading}
					/>
					<Stat
						title={'Number of Cardholders'}
						icon='cardholder'
						value={cardholders.data?.length}
						diff={cardholders_diff}
						loading={cardholders.isLoading}
					/>
					<Stat
						title={'Total Transaction Amount'}
						icon='cash'
						value={transaction_amount.data}
						diff={transactions_diff}
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
				<TransactionsChart height={height} dateRange={range} />
			</div>
		</AppShell>
	);
}

export default Main;
