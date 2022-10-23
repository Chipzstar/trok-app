import React, { useCallback, useMemo, useState } from 'react';
import Page from '../../layout/Page';
import { ActionIcon, Button, Card, Drawer, Group, NumberInput, Stack, Text, Title } from '@mantine/core';
import { IconChevronLeft, IconEdit } from '@tabler/icons';
import { useRouter } from 'next/router';
import { SAMPLE_CARDS, SAMPLE_TRANSACTIONS } from '../../utils/constants';
import TransactionTable from '../../containers/TransactionTable';
import dayjs from 'dayjs';
import { useForm } from '@mantine/form';

const CardDetails = ({ testMode }) => {
	const rows = testMode
		? SAMPLE_TRANSACTIONS.slice(0, 3).map((element, index) => {
				return (
					<tr
						key={index}
						style={{
							border: 'none'
						}}
					>
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
		  })
		: [];
	const [opened, setOpened] = useState(false);
	const router = useRouter();
	const { cardID } = router.query;

	const card = useMemo(() => {
		return SAMPLE_CARDS.find(c => c.id === cardID);
	}, [cardID]);

	const form = useForm({
		initialValues: {
			per_transaction: null,
			daily: null,
			weekly: null,
			monthly: null
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
					<Button leftIcon={<IconChevronLeft />} variant='white' color='dark' onClick={() => router.back()}>
						<span className='text-xl font-medium'>Back</span>
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
				<Stack>
					<Title order={2} weight={500}>
						<span>Edit Spend Limits</span>
					</Title>
					<form onSubmit={form.onSubmit(handleSubmit)} className='flex flex-col space-y-4'>
						<NumberInput
							label='Per Transaction Limit'
							formatter={value =>
								!Number.isNaN(parseFloat(value))
									? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
									: '£ '
							}
							{...form.getInputProps('per_transaction')}
						/>
						<NumberInput
							label='Daily Spend Limit'
							formatter={value =>
								!Number.isNaN(parseFloat(value))
									? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
									: '£ '
							}
							{...form.getInputProps('daily')}
						/>
						<NumberInput
							label='Weekly Spend Limit'
							formatter={value =>
								!Number.isNaN(parseFloat(value))
									? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
									: '£ '
							}
							{...form.getInputProps('weekly')}
						/>
						<NumberInput
							label='Monthly Spend Limit'
							formatter={value =>
								!Number.isNaN(parseFloat(value))
									? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
									: '£ '
							}
							{...form.getInputProps('monthly')}
						/>
						<Group py='xl' position='right'>
							<Button
								type='submit'
								styles={{
									root: {
										width: 120
									}
								}}
							>
								<Text weight={500}>Save</Text>
							</Button>
						</Group>
					</form>
				</Stack>
			</Drawer>
			<Page.Body extraClassNames='px-10'>
				<Group className='pb-6'>
					<Title order={1} weight={500}>
						Card **** {card?.last4}
					</Title>
					<span className='font-medium uppercase text-success'>{card?.status}</span>
				</Group>
				<div className='grid grid-cols-1 gap-x-8 md:grid-cols-2'>
					<Card shadow='sm' p='lg' radius='md' withBorder>
						<Group position='apart'>
							<Stack>
								<Text color='dimmed' transform='uppercase'>
									Spending Limit
								</Text>
								<span>Per Transaction</span>
								<span>Daily</span>
								<span>Weekly</span>
							</Stack>
							<Stack>
								<div className='flex items-center'>
									<Text>Edit Spend Limits &nbsp;</Text>
									<ActionIcon size='sm' onClick={() => setOpened(true)}>
										<IconEdit />
									</ActionIcon>
								</div>
								<span>-</span>
								<span>£2000</span>
								<span>£6000</span>
							</Stack>
						</Group>
					</Card>
					<Card shadow='sm' p='lg' radius='md' withBorder>
						<Stack justify='space-between' className='h-full'>
							<div className='space-y-2'>
								<Text weight={600}>Driver</Text>
								<span>{card?.cardholder_name}</span>
							</div>
							<div className='flex-end block'>
								<Button size='md'>Disable Card</Button>
							</div>
						</Stack>
					</Card>
				</div>
				<Title order={1} weight={500} py='xl'>
					Recent Transactions
				</Title>
				<TransactionTable rows={rows} spacingY='sm' withPagination={false} />
			</Page.Body>
		</Page.Container>
	);
};

export default CardDetails;
