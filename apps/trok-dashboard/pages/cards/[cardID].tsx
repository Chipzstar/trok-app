import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Page from '../../layout/Page';
import { ActionIcon, Button, Card, Drawer, Group, NumberInput, Stack, Switch, Text, Title } from '@mantine/core';
import { IconCheck, IconChevronLeft, IconEdit, IconX } from '@tabler/icons';
import { useRouter } from 'next/router';
import { GBP, isProd, SAMPLE_CARDS, SAMPLE_TRANSACTIONS } from '../../utils/constants';
import TransactionTable from '../../containers/TransactionTable';
import { useForm } from '@mantine/form';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { apiClient, trpc } from '../../utils/clients';
import {
	CARD_SHIPPING_STATUS,
	CARD_STATUS,
	notifyError,
	notifySuccess,
	SpendingLimit,
	SpendingLimitInterval
} from '@trok-app/shared-utils';
import CardPaymentButton from '../../components/CardPaymentButton';
import classNames from 'classnames';
import { useToggle } from '@mantine/hooks';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CardPINDisplay from '../../components/CardPINDisplay';

const stripe = await loadStripe(String(process.env.NEXT_PUBLIC_STRIPE_API_KEY), { apiVersion: '2022-08-01' });

function formatSpendingLimits(
	limits: Record<SpendingLimitInterval, { active: boolean; amount: number }>
): SpendingLimit[] {
	const selectedLimits = Object.entries(limits).filter(([key, value]) => value.active);
	return selectedLimits.map(([key, value]: [SpendingLimitInterval, { active: boolean; amount: number }]) => ({
		amount: value.amount * 100,
		interval: key
	}));
}

const CardDetails = ({ testMode, session_id, stripe_account_id }) => {
	const router = useRouter();
	const { cardID } = router.query;
	const [nonce, setNonce] = useState(null);
	const [ephemeralKey, setEphemeralKey] = useState(null);
	const [status, toggle] = useToggle(['active', 'inactive']);
	const [loading, setLoading] = useState(false);
	const [opened, setOpened] = useState(false);
	const utils = trpc.useContext();
	const cardsQuery = trpc.getCards.useQuery({ userId: session_id });
	const cardStatusMutation = trpc.toggleCardStatus.useMutation({
		onSuccess: function(input) {
			utils.invalidate({ userId: session_id }).then(r => console.log(input, 'Cards refetched'));
		}
	});
	const spendingLimitMutation = trpc.updateSpendingLimits.useMutation({
		onSuccess: function(input) {
			utils.invalidate({ userId: session_id }).then(r => form.reset());
		}
	});
	const transactionsQuery = trpc.getCardTransactions.useQuery({ card_id: String(cardID) });

	const card = useMemo(
		() =>
			testMode ? SAMPLE_CARDS.find(c => c.card_id === cardID) : cardsQuery?.data?.find(c => c.card_id === cardID),
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
		? SAMPLE_TRANSACTIONS.slice(0, 3)
		: !transactionsQuery.isLoading
			? transactionsQuery?.data.slice(0, 3)
			: [];
	useEffect(() => {
		(async () => {
			const nonceResult = await stripe.createEphemeralKeyNonce({
				issuingCard: String(cardID)
			});
			setNonce(nonceResult.nonce);
			const result = (await apiClient.post('/server/stripe/ephemeral-keys', {
				card_id: String(cardID),
				stripe_account_id
			})).data;
			setEphemeralKey(result.ephemeral_key_secret);
		})();
	}, [cardID, stripe_account_id]);

	useEffect(() => form.reset(), [card]);

	const form = useForm({
		initialValues: {
			per_authorization: {
				active: Boolean(card?.spending_limits.find(l => l.interval === 'per_authorization')),
				amount: GBP(card?.spending_limits.find(l => l.interval === 'per_authorization')?.amount).value
			},
			daily: {
				active: Boolean(card?.spending_limits.find(l => l.interval === 'daily')),
				amount: GBP(card?.spending_limits.find(l => l.interval === 'daily')?.amount).value
			},
			weekly: {
				active: Boolean(card?.spending_limits.find(l => l.interval === 'weekly')),
				amount: GBP(card?.spending_limits.find(l => l.interval === 'weekly')?.amount).value
			},
			monthly: {
				active: Boolean(card?.spending_limits.find(l => l.interval === 'monthly')),
				amount: GBP(card?.spending_limits.find(l => l.interval === 'monthly')?.amount).value
			}
		}
	});
	const updateSpendingLimit = useCallback(async values => {
		setLoading(true);
		try {
			const spending_limits = formatSpendingLimits(values);
			await spendingLimitMutation.mutateAsync({
				userId: session_id,
				card_id: String(cardID),
				stripeId: stripe_account_id,
				// @ts-ignore
				spending_limits
			});
			setLoading(false);
			setOpened(false);
			notifySuccess(
				'update-spending-limit-success',
				'Spending limits updated successfully',
				<IconCheck size={20} />
			);
		} catch (err) {
			setLoading(false);
			console.error(err);
			notifyError('update-spending-limit-failed', err?.error?.message ?? err.message, <IconX size={20} />);
		}
	}, []);

	const toggleCardStatus = useCallback(
		async status => {
			setLoading(true);
			try {
				await cardStatusMutation.mutateAsync({
					card_id: String(cardID),
					stripeId: stripe_account_id,
					status
				});
				setLoading(false);
				toggle();
				notifySuccess('activate-card-success', `Card ${card?.last4} is now ${status}`, <IconCheck size={20} />);
			} catch (err) {
				setLoading(false);
				console.error(err);
				notifyError('activate-card-failed', err?.error?.message ?? err.message, <IconX size={20} />);
			}
		},
		[card, stripe_account_id]
	);

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
					<form onSubmit={form.onSubmit(updateSpendingLimit)} className='flex flex-col space-y-4'>
						<div className='flex items-center space-x-4'>
							<Switch
								onLabel='ON'
								offLabel='OFF'
								size='md'
								{...form.getInputProps('per_authorization.active', { type: 'checkbox' })}
							/>
							<NumberInput
								disabled={!form.values.per_authorization.active}
								classNames={{ root: 'w-full' }}
								label='Per Transaction Limit'
								parser={(value: string) => value.replace(/£\s?|(,*)/g, '')}
								formatter={value =>
									!Number.isNaN(parseFloat(value))
										? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
										: '£ '
								}
								{...form.getInputProps('per_authorization.amount')}
							/>
						</div>
						<div className='flex items-center space-x-4'>
							<Switch
								onLabel='ON'
								offLabel='OFF'
								size='md'
								{...form.getInputProps('daily.active', { type: 'checkbox' })}
							/>
							<NumberInput
								disabled={!form.values.daily.active}
								classNames={{ root: 'w-full' }}
								label='Daily Spend Limit'
								parser={(value: string) => value.replace(/£\s?|(,*)/g, '')}
								formatter={value =>
									!Number.isNaN(parseFloat(value))
										? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
										: '£ '
								}
								{...form.getInputProps('daily.amount')}
							/>
						</div>
						<div className='flex items-center space-x-4'>
							<Switch
								onLabel='ON'
								offLabel='OFF'
								size='md'
								{...form.getInputProps('weekly.active', { type: 'checkbox' })}
							/>
							<NumberInput
								disabled={!form.values.weekly.active}
								classNames={{ root: 'w-full' }}
								label='Weekly Spend Limit'
								parser={(value: string) => value.replace(/£\s?|(,*)/g, '')}
								formatter={value =>
									!Number.isNaN(parseFloat(value))
										? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
										: '£ '
								}
								{...form.getInputProps('weekly.amount')}
							/>
						</div>
						<div className='flex items-center space-x-4'>
							<Switch
								onLabel='ON'
								offLabel='OFF'
								size='md'
								{...form.getInputProps('monthly.active', { type: 'checkbox' })}
							/>
							<NumberInput
								disabled={!form.values.monthly.active}
								classNames={{ root: 'w-full' }}
								label='Monthly Spend Limit'
								parser={(value: string) => value.replace(/£\s?|(,*)/g, '')}
								formatter={value =>
									!Number.isNaN(parseFloat(value))
										? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
										: '£ '
								}
								{...form.getInputProps('monthly.amount')}
							/>
						</div>
						<Group py='xl' position='right'>
							<Button
								type='submit'
								styles={{
									root: {
										width: 120
									}
								}}
								loading={loading}
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
					{!isProd && <CardPaymentButton
						stripeId={stripe_account_id}
						cardId={cardID}
						cardShippingStatus={card?.shipping_status}
						cardStatus={card?.status}
					/>}
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
								<span>
									{card?.spending_limits.find(({ interval }) => interval === 'per_authorization')
										? GBP(
											card?.spending_limits.find(
												({ interval }) => interval === 'per_authorization'
											)?.amount
										).format()
										: '-'}
								</span>
								<span>
									{card?.spending_limits.find(({ interval }) => interval === 'daily')
										? GBP(
											card?.spending_limits.find(({ interval }) => interval === 'daily')
												?.amount
										).format()
										: '-'}
								</span>
								<span>
									{card?.spending_limits.find(({ interval }) => interval === 'weekly')
										? GBP(card?.spending_limits.find(({ interval }) => interval === 'weekly')?.amount).format()
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
							<Group grow position='apart'>
								{card?.shipping_status === CARD_SHIPPING_STATUS.DELIVERED && (
									<Button size='md' onClick={() => toggleCardStatus(status)} loading={loading}>
										{card?.status === CARD_STATUS.INACTIVE ? 'Activate' : 'Disable'} Card
									</Button>)}
								<Elements stripe={stripe}>
									<CardPINDisplay
										card_id={cardID}
										nonce={nonce}
										ephemeral_key_secret={ephemeralKey}
									/>
								</Elements>
							</Group>

						</Stack>
					</Card>
				</div>
				<Title order={1} weight={500} py='xl'>
					Recent Transactions
				</Title>
				<TransactionTable data={rows} spacingY='sm' withPagination={false} />
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
