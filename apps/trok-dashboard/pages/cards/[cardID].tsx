import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Page from '../../layout/Page';
import { ActionIcon, Button, Card, Drawer, Group, Loader, NumberInput, Stack, Text, Title } from '@mantine/core';
import { IconCheck, IconChevronLeft, IconEdit, IconX } from '@tabler/icons';
import { useRouter } from 'next/router';
import { GBP, SAMPLE_CARDS, SAMPLE_TRANSACTIONS } from '../../utils/constants';
import TransactionTable from '../../containers/TransactionTable';
import dayjs from 'dayjs';
import { useForm } from '@mantine/form';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { trpc } from '../../utils/clients';
import { CARD_SHIPPING_STATUS, CARD_STATUS, notifyError, notifySuccess } from '@trok-app/shared-utils';
import CardTestButton from '../../components/CardTestButton';
import classNames from 'classnames';
import { useToggle } from '@mantine/hooks';

const CardDetails = ({ testMode, session_id, stripe_account_id }) => {
	const router = useRouter();
	const { cardID } = router.query;
	const [status, toggle] = useToggle(['active', 'inactive']);
	const [loading, setLoading] = useState(false);
	const [opened, setOpened] = useState(false);
	const utils = trpc.useContext();
	const cardsQuery = trpc.getCards.useQuery({ userId: session_id });
	const cardsMutation = trpc.toggleCardStatus.useMutation({
		onSuccess: function (input) {
			utils.invalidate({ userId: session_id }).then(r => console.log(input, 'Cards refetched'));
		}
	});
	const topupMutation = trpc.topUp.useMutation();
	const transactionsQuery = trpc.getCardTransactions.useQuery({ cardId: String(cardID) });

	const card = useMemo(
		() => (testMode ? SAMPLE_CARDS.find(c => c.id === cardID) : cardsQuery?.data?.find(c => c.id === cardID)),
		[cardID, cardsQuery]
	);

	const shipping_status_class = classNames({
		'font-medium': true,
		uppercase: true,
		'text-danger': card?.shipping_status === CARD_SHIPPING_STATUS.PENDING || card?.status === CARD_STATUS.INACTIVE,
		'text-warning': card?.shipping_status === CARD_SHIPPING_STATUS.SHIPPED,
		'text-success': card?.shipping_status === CARD_SHIPPING_STATUS.DELIVERED || card?.status === CARD_STATUS.ACTIVE
	});

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
					</tr>
				);
		  })
		: !transactionsQuery.isLoading
		? transactionsQuery?.data.slice(0, 3).map((t, index) => {
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

	const form = useForm({
		initialValues: {
			per_transaction: card?.spending_limits.find(l => l.interval === 'per_authorization')?.amount / 100,
			daily: card?.spending_limits.find(l => l.interval === 'daily')?.amount / 100,
			weekly: card?.spending_limits.find(l => l.interval === 'weekly')?.amount / 100,
			monthly: card?.spending_limits.find(l => l.interval === 'monthly')?.amount / 100
		}
	});

	const handleSubmit = useCallback(values => {
		alert(JSON.stringify(values));
		console.log(values);
	}, []);

	const toggleCardStatus = useCallback(
		async status => {
			setLoading(true);
			try {
				await cardsMutation.mutateAsync({
					id: String(cardID),
					stripeId: stripe_account_id,
					status
				});
				setLoading(false);
				toggle();
				notifySuccess('activate-card-success', `Card ${card?.last4} is now ${status}`, <IconCheck size={20} />);
			} catch (err) {
				setLoading(false);
				console.error(err);
				notifyError('activate-card-failed', err.message, <IconX size={20} />);
			}
		},
		[card, stripe_account_id]
	);

	useEffect(() => form.reset(), [card]);

	return (
		<Page.Container
			header={
				<Page.Header>
					<Button leftIcon={<IconChevronLeft />} variant='white' color='dark' onClick={router.back}>
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
				<Group className='pb-6' position='apart'>
					<Group>
						<Title order={1} weight={500}>
							Card **** {card?.last4}
						</Title>
						<span className={shipping_status_class}>
							{card?.shipping_status === CARD_SHIPPING_STATUS.DELIVERED
								? card?.status
								: card?.shipping_status}
						</span>
					</Group>
					<CardTestButton
						stripeId={stripe_account_id}
						id={cardID}
						cardShippingStatus={card?.shipping_status}
						cardStatus={card?.status}
					/>
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
								<span>
									{card?.spending_limits[0].interval === 'daily'
										? GBP(card?.spending_limits[0].amount).format()
										: '-'}
								</span>
								<span>
									{card?.spending_limits[0].interval === 'weekly'
										? GBP(card?.spending_limits[0].amount).format()
										: '-'}
								</span>
							</Stack>
						</Group>
					</Card>
					<Card shadow='sm' p='lg' radius='md' withBorder>
						<Stack justify='space-between' className='h-full'>
							<div className='space-y-2'>
								<Text weight={600}>Driver</Text>
								<span>{card?.cardholder_name}</span>
							</div>
							{card?.shipping_status === CARD_SHIPPING_STATUS.DELIVERED && (
								<div className='flex-end block'>
									<Loader size='sm' className={`mr-3 ${!loading && 'hidden'}`} color='white' />
									<Button size='md' onClick={() => toggleCardStatus(status)}>
										{card?.status === CARD_STATUS.INACTIVE ? 'Activate' : 'Disable'} Card
									</Button>
								</div>
							)}
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

export const getServerSideProps = async ({ req, res }) => {
	// @ts-ignore
	const session = await unstable_getServerSession(req, res, authOptions);
	return {
		props: {
			session_id: session.id,
			stripe_account_id: session?.stripe.account_id
		}
	};
};

export default CardDetails;
