import React from 'react';
import Page from '../layout/Page';
import { GBP, PATHS } from '../utils/constants';
import { Button, Card, Divider, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';
import SpendAnalysis from '../components/charts/SpendAnalysis';
import { getToken } from 'next-auth/jwt';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';

export function Dashboard({ testMode, user }) {
	const week_spend = GBP(testMode ? 21272900 : 0).format()
	const week_savings = GBP(testMode ? 726436 : 0).format()
	return (
		<Page.Container
			header={
				<Page.Header extraClassNames='mb-3'>
					<span className='heading-1 capitalize'>{user?.business?.legal_name}</span>
				</Page.Header>
			}
		>
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
								<span className='heading-1'>
									{week_savings.split('.')[0]}.
									<span className='text-base'>{week_savings.split('.')[1]}</span>
								</span>
							</div>
						</Stack>
						<Divider px={0} />
						<Group position='center' py='xs'>
							<Text color='dimmed'>
								{dayjs().subtract(7, 'd').format('MMM D')} - {dayjs().format('MMM D')}
							</Text>
						</Group>
					</Card>
					<Card shadow='sm' py={0} radius='xs'>
						<Stack px='md' pt='lg' pb='sm'>
							<div className='flex flex-col space-y-1'>
								<span className='text-base'>Account Balance</span>
								<span className='text-2xl font-medium text-danger'>{GBP(0).format()}</span>
							</div>
							<div className='flex flex-col space-y-1'>
								<span className='text-base'>Weekly Available Credit</span>
								<span className='heading-1'>£{GBP(testMode ? 100000 : 0).dollars()}</span>
							</div>
						</Stack>
						<Group position='center' py='xs'>
							<Button size='md' fullWidth>
								Pay
							</Button>
						</Group>
					</Card>
					<Card shadow='sm' py={0} radius='xs'>
						<Stack px='md' py='lg'>
							<div className='flex flex-col space-y-1'>
								<span className='text-base'>Upcoming Balance</span>
								<span className='heading-1'>-</span>
							</div>
							<div className='flex flex-col space-y-1'>
								<span className='text-base'>Due Date</span>
								<span className='heading-1'>{testMode ? dayjs().add(7, 'd').startOf('w').format('MMM D') : "-"}</span>
							</div>
						</Stack>
						<Divider px={0} />
						<Group position='center' py='xs'>
							<Text color='dimmed'>Auto debit is on</Text>
						</Group>
					</Card>
				</SimpleGrid>
				<Title order={4} weight={500} my='lg'>
					Spend Analysis
				</Title>
				<Card shadow='sm' py='lg' radius='xs'>
					<SpendAnalysis testMode={testMode} />
				</Card>
			</Page.Body>
		</Page.Container>
	);
}

export async function getServerSideProps ({ req, res }) {
	// @ts-ignore
	const session = await unstable_getServerSession(req, res, authOptions);
	const token = await getToken({ req });
	console.log(session)
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
			user: token?.user
		}
	};
}

export default Dashboard;
