import React, { useMemo, useState } from 'react';
import Page from '../layout/Page';
import { FIVE_HUNDRED_POUNDS, PATHS, SAMPLE_CARDS, SAMPLE_TRANSACTIONS } from '../utils/constants';
import { ActionIcon, Badge, Button, Card, Divider, Group, SimpleGrid, Space, Stack, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';
import SpendAnalysis from '../components/charts/SpendAnalysis';
import { getToken } from 'next-auth/jwt';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { trpc } from '../utils/clients';
import { IconCalendar, IconEdit } from '@tabler/icons';
import { DateRangePicker, DateRangePickerValue } from '@mantine/dates';
import isBetween from 'dayjs/plugin/isBetween';
import { GBP } from '@trok-app/shared-utils';
import ComingSoon from '../modals/ComingSoon';

dayjs.extend(isBetween);

export function Dashboard({ testMode, user, session_id, stripe_account_id }) {
	const [comingSoonModal, showComingSoon] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [range, setRange] = useState<DateRangePickerValue>([
		dayjs().startOf('week').toDate(),
		dayjs().endOf('week').toDate()
	]);
	const [chartRange, setChartRange] = useState<DateRangePickerValue>([
		dayjs().startOf('week').toDate(),
		dayjs().endOf('week').toDate()
	]);
	const transactionsQuery = trpc.getTransactions.useQuery({ userId: session_id });
	const cardsQuery = trpc.getCards.useQuery({ userId: session_id });
	const balanceQuery = trpc.getIssuingBalance.useQuery({ userId: session_id, stripeId: stripe_account_id });

	const week_spend = useMemo(() => {
		if (testMode) {
			return GBP(21272900).format();
		} else {
			let value = transactionsQuery?.data
				?.filter(t => dayjs(t.created_at).isBetween(range[0], range[1], 'h'))
				.reduce((prev, curr) => prev + curr.transaction_amount, 0);
			return GBP(value).format();
		}
	}, [testMode, transactionsQuery, range]);
	const week_savings = useMemo(() => {
		if (testMode) {
			return GBP(testMode ? 726436 : 0).format();
		} else {
			let value = transactionsQuery?.data
				?.filter(t => dayjs(t.created_at).isBetween(range[0], range[1], 'h'))
				.reduce((prev, curr) => prev + 41 * 120, 0);
			return GBP(value).format();
		}
	}, [testMode, transactionsQuery, range]);
	const num_transactions = useMemo(
		() => (testMode ? SAMPLE_TRANSACTIONS.length : transactionsQuery?.data?.length),
		[testMode, transactionsQuery]
	);
	const num_cards = useMemo(
		() => (testMode ? SAMPLE_CARDS.length : cardsQuery?.data?.length),
		[testMode, cardsQuery]
	);
	const current_balance = useMemo(() => (testMode ? 0 : balanceQuery?.data?.amount), [testMode, balanceQuery]);

	return (
		<Page.Container
			classNames='unapproved-container flex flex-col'
			header={
				<Page.Header extraClassNames='mb-3'>
					<span className='heading-1 capitalize'>{user?.business?.legal_name}</span>
				</Page.Header>
			}
		>
			<ComingSoon opened={comingSoonModal} onClose={() => showComingSoon(false)} />
			<Page.Body extraClassNames=''>
				<Title order={4} weight={500} mb='lg'>
					Overview
				</Title>
				<SimpleGrid cols={3} spacing='lg' breakpoints={[{ maxWidth: 600, cols: 1, spacing: 'sm' }]}>
					<Card shadow='sm' py={0} radius='xs'>
						<Stack px='md' py='lg'>
							<div className='flex flex-col space-y-1'>
								<span className='text-base'>Current Week Spend</span>
								<span className='heading-1'>
									{week_spend.split('.')[0]}.
									<span className='text-base'>{week_spend.split('.')[1]}</span>
								</span>
							</div>
							<div className='flex flex-col space-y-1'>
								<span className='text-base'>Current Week Savings</span>
								<span className='heading-1'>-</span>
							</div>
						</Stack>
						<Divider px={0} />
						<Group position='center' py='xs'>
							{editMode ? (
								<DateRangePicker
									fullWidth
									allowSingleDateInRange={false}
									styles={{
										input: {
											border: 0
										}
									}}
									dropdownType='modal'
									modalProps={{}}
									placeholder='Pick dates range'
									value={range}
									inputFormat='DD/MM/YYYY'
									labelSeparator=' → '
									labelFormat='MMM YYYY'
									onChange={setRange}
									onDropdownClose={() => setEditMode(false)}
								/>
							) : (
								<>
									<Text color='dimmed'>
										{dayjs(range[0]).format('MMM D')} - {dayjs(range[1]).format('MMM D')}
									</Text>
									<ActionIcon size='xs' onClick={() => setEditMode(!editMode)}>
										<IconEdit />
									</ActionIcon>
								</>
							)}
						</Group>
					</Card>
					<Card shadow='sm' py={0} radius='xs'>
						<Stack px='md' pt='lg' pb='sm'>
							<div className='flex flex-col space-y-1'>
								<span className='text-base'>Account Balance</span>
								<span
									className={`text-2xl font-medium ${
										current_balance < FIVE_HUNDRED_POUNDS && 'text-danger'
									}`}
								>
									{GBP(current_balance).format()}
								</span>
							</div>
							<div className='flex flex-col space-y-1'>
								<Group position='apart'>
									<span className='text-base'>Weekly Available Credit</span>
									<Badge color='green'>Coming Soon</Badge>
								</Group>
								<span className='heading-1'>£{GBP(testMode ? 100000 : 0).dollars()}</span>
							</div>
						</Stack>
						<Group position='center' py='xs'>
							<Button
								size='md'
								fullWidth
								onClick={() => {
									showComingSoon(true);
									setTimeout(() => {
										showComingSoon(false);
									}, 2000);
								}}
							>
								Pay Now
							</Button>
						</Group>
					</Card>
					<Card shadow='sm' py={0} radius='xs'>
						<Stack px='md' py='lg'>
							<div className='flex flex-col space-y-1'>
								<span className='text-base'>Number of Cards</span>
								<span className='heading-1'>{num_cards}</span>
							</div>
							<div className='flex flex-col space-y-1'>
								<span className='text-base'>Transactions</span>
								<span className='heading-1'>{num_transactions}</span>
							</div>
						</Stack>
						<Divider px={0} />
						<Group position='center' py='xs'>
							<Space />
						</Group>
					</Card>
				</SimpleGrid>
				<Group position='apart'>
					<Title order={4} weight={500} my='lg'>
						Spend Analysis
					</Title>
					<DateRangePicker
						icon={<IconCalendar size={18} />}
						fullWidth
						size='sm'
						radius={0}
						placeholder='Range'
						value={chartRange}
						inputFormat='DD/MM/YYYY'
						labelSeparator=' → '
						labelFormat='MMM YYYY'
						onChange={value => (value[1] instanceof Date ? setChartRange(value) : null)}
					/>
				</Group>
				<Card shadow='sm' py='lg' radius='xs'>
					<SpendAnalysis sessionId={session_id} dateRange={chartRange} />
				</Card>
			</Page.Body>
		</Page.Container>
	);
}

export async function getServerSideProps({ req, res }) {
	// @ts-ignore
	const session = await unstable_getServerSession(req, res, authOptions);
	const token = await getToken({ req });
	console.log(session);
	// check if the user is authenticated, it not, redirect back to login page
	if (!session) {
		return {
			redirect: {
				destination: PATHS.LOGIN,
				permanent: false
			}
		};
	}
	return {
		props: {
			session_id: session.id,
			user: token?.user,
			stripe_account_id: session.stripe.account_id
		}
	};
}

export default Dashboard;
