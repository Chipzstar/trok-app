import React from 'react';
import { useLocalStorage } from '@mantine/hooks';
import Page from '../layout/Page';
import { GBP, PATHS, STORAGE_KEYS } from '../utils/constants';
import { Button, Card, Divider, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';
import SpendAnalysis from '../components/charts/SpendAnalysis';
import { getToken } from 'next-auth/jwt';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';

const week_spend = GBP(21272900).format()
const week_savings = GBP(726436).format()

export function Dashboard(props) {
	const [business, setBusinss] = useLocalStorage({ key: STORAGE_KEYS.COMPANY_FORM, defaultValue: null });
	return (
		<Page.Container
			header={
				<Page.Header extraClassNames="mb-3">
					<span className='heading-1 capitalize'>{business?.legal_name}</span>
				</Page.Header>
			}
		>
			<Page.Body extraClassNames="">
				<Title order={4} weight={500} mb='lg'>
					Overview
				</Title>
				<SimpleGrid cols={3} spacing='lg' breakpoints={[{ maxWidth: 600, cols: 1, spacing: 'sm' }]}>
					<Card shadow='sm' py={0} radius='xs'>
						<Stack px="md" py='lg'>
							<div className="flex flex-col space-y-1">
								<span className='text-base'>Current Week Spend</span>
								<span className="heading-1">{week_spend.split(".")[0]}.
									<span className="text-base">{week_spend.split(".")[1]}</span>
								</span>
							</div>
							<div className="flex flex-col space-y-1">
								<span className='text-base'>Current Week Savings</span>
								<span className="heading-1">{week_savings.split(".")[0]}.
									<span className="text-base">{week_savings.split(".")[1]}</span>
								</span>
							</div>
						</Stack>
						<Divider px={0}/>
						<Group position="center" py="xs">
							<Text color="dimmed">{dayjs().subtract(7, "d").format("MMM D")} - {dayjs().format("MMM D")}</Text>
						</Group>
					</Card>
					<Card shadow='sm' py={0} radius='xs' >
						<Stack px='md' pt="lg" pb="sm">
							<div className="flex flex-col space-y-1">
								<span className='text-base'>Account Balance</span>
								<span className="text-2xl text-danger font-medium">{GBP(0).format()}</span>
							</div>
							<div className="flex flex-col space-y-1">
								<span className='text-base'>Weekly Available Credit</span>
								<span className="heading-1">£{GBP(100000).dollars()}</span>
							</div>
						</Stack>
						<Group position="center" py="xs">
							<Button size="md" fullWidth>Pay</Button>
						</Group>
					</Card>
					<Card shadow='sm' py={0} radius='xs'>
						<Stack px="md" py='lg'>
							<div className="flex flex-col space-y-1">
								<span className='text-base'>Upcoming Balance</span>
								<span className="heading-1">-</span>
							</div>
							<div className="flex flex-col space-y-1">
								<span className='text-base'>Due Date</span>
								<span className="heading-1">{dayjs().add(7, 'd').startOf("w").format("MMM D")}</span>
							</div>
						</Stack>
						<Divider px={0}/>
						<Group position="center" py="xs">
							<Text color="dimmed">Auto debit is on</Text>
						</Group>
					</Card>
				</SimpleGrid>
				<Title order={4} weight={500} my='lg'>
					Spend Analysis
				</Title>
				<Card shadow='sm' py="lg" radius='xs'>
					<SpendAnalysis/>
				</Card>
			</Page.Body>
		</Page.Container>
	);
}

export async function getServerSideProps ({ req, res }) {
	// @ts-ignore
	const session = await unstable_getServerSession(req, res, authOptions);
	const token = await getToken({ req });
	console.log("SESSION:", session)
	console.log("TOKEN:", token)
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
		props: {}
	};
}

export default Dashboard;
