import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Page from '../../layout/Page';
import { ActionIcon, Button, Card, Group, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { IconCheck, IconChevronLeft, IconEdit, IconX } from '@tabler/icons';
import { useRouter } from 'next/router';
import { isProd, SAMPLE_CARDS, SAMPLE_TRANSACTIONS } from '../../utils/constants';
import TransactionTable from '../../containers/TransactionTable';
import { useForm } from '@mantine/form';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { apiClient, trpc } from '../../utils/clients';
import {
	CARD_SHIPPING_STATUS,
	CARD_STATUS,
	GBP,
	notifyError,
	notifySuccess,
	SpendingLimit,
	SpendingLimitInterval
} from '@trok-app/shared-utils';
import CardPaymentButton from '../../components/CardPaymentButton';
import classNames from 'classnames';
import { Elements } from '@stripe/react-stripe-js';
import CardPINDisplay from '../../components/CardPINDisplay';
import getStripe from '../../utils/load-stripejs';
import useWindowSize from '../../hooks/useWindowSize';
import Prisma from '@prisma/client';
import dayjs from 'dayjs';
import SpendingLimitForm, { SpendingLimitFormValues } from '../../modals/SpendingLimitForm';
import AllowedCategoriesForm, { AllowedCategoriesFormValues } from '../../modals/AllowedCategoriesForm';
import { useMediaQuery } from '@mantine/hooks';

function formatSpendingLimits(
	limits: Record<SpendingLimitInterval, { active: boolean; amount: number }>
): SpendingLimit[] {
	const selectedLimits = Object.entries(limits).filter(([key, value]) => value.active);
	return selectedLimits.map(([key, value]: [SpendingLimitInterval, { active: boolean; amount: number }]) => ({
		amount: value.amount * 100,
		interval: key
	}));
}

let stripe;

const CardDetails = ({ testMode, session_id, stripe_account_id }) => {
	const router = useRouter();
	const largeScreen = useMediaQuery('(min-width: 1200px)');
	const { height } = useWindowSize();
	const { cardID } = router.query;
	const [nonce, setNonce] = useState(null);
	const [ephemeralKey, setEphemeralKey] = useState(null);
	const [loading, setLoading] = useState(false);
	const [limitsOpened, setLimitsOpened] = useState(false);
	const [categoriesOpened, setCategoriesOpened] = useState(false);
	const utils = trpc.useContext();
	const cardsQuery = trpc.getCards.useQuery({ userId: session_id });
	const cardStatusMutation = trpc.toggleCardStatus.useMutation({
		onSuccess: function (input) {
			utils.getCards.invalidate({ userId: session_id }).then(r => console.log(input, 'Cards refetched'));
		}
	});
	const spendingLimitMutation = trpc.updateSpendingLimits.useMutation({
		onSuccess: function (input) {
			utils.getCards.invalidate({ userId: session_id }).then(r => spendingLimitForm.reset());
		}
	});
	const allowedCategoriesMutation = trpc.updateAllowedCategories.useMutation({
		onSuccess: function (input) {
			utils.getCards.invalidate({ userId: session_id }).then(r => allowedCategoriesForm.reset());
		}
	});
	const transactionsQuery = trpc.getCardTransactions.useQuery({ card_id: String(cardID) });

	const card = useMemo<Prisma.Card | undefined>(
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

	const data = testMode
		? SAMPLE_TRANSACTIONS.slice(0, 3)
		: !transactionsQuery.isLoading
		? transactionsQuery?.data
		: [];

	useEffect(() => {
		(async () => {
			stripe = await getStripe({ apiVersion: '2022-08-01', stripeAccount: stripe_account_id });
			const nonceResult = await stripe.createEphemeralKeyNonce({
				issuingCard: String(cardID)
			});
			setNonce(nonceResult.nonce);
			const result = (
				await apiClient.post('/server/stripe/ephemeral-keys', {
					card_id: String(cardID),
					nonce: nonceResult.nonce,
					stripe_account_id
				})
			).data;
			setEphemeralKey(result.ephemeral_key_secret);
		})();
	}, [cardID, stripe_account_id]);

	useEffect(() => {
		spendingLimitForm.reset();
		allowedCategoriesForm.reset();
	}, [card]);

	const spendingLimitForm = useForm<SpendingLimitFormValues>({
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

	const allowedCategoriesForm = useForm<AllowedCategoriesFormValues>({
		initialValues: {
			fuel: card?.allowed_merchant_categories[0],
			truck_stops: card?.allowed_merchant_categories[1],
			repair: card?.allowed_merchant_categories[2],
			hotels: card?.allowed_merchant_categories[3],
			tolls: card?.allowed_merchant_categories[4]
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
			setLimitsOpened(false);
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

	const updateAllowedCategories = useCallback(async values => {
		setLoading(true);
		try {
			await allowedCategoriesMutation.mutateAsync({
				userId: session_id,
				card_id: String(cardID),
				stripeId: stripe_account_id,
				// @ts-ignore
				allowed_categories: Object.values(values)
			});
			setLoading(false);
			setCategoriesOpened(false);
			notifySuccess(
				'update-allowed-categories-success',
				'Allowed categories updated successfully',
				<IconCheck size={20} />
			);
		} catch (err) {
			setLoading(false);
			console.error(err);
			notifyError('update-allowed-categories-failed', err?.error?.message ?? err.message, <IconX size={20} />);
		}
	}, []);

	const toggleCardStatus = useCallback(async () => {
		setLoading(true);
		try {
			const status = card?.status === CARD_STATUS.ACTIVE ? CARD_STATUS.INACTIVE : CARD_STATUS.ACTIVE;
			await cardStatusMutation.mutateAsync({
				card_id: String(cardID),
				stripeId: stripe_account_id,
				status
			});
			setLoading(false);
			notifySuccess('activate-card-success', `Card ${card?.last4} is now ${status}`, <IconCheck size={20} />);
		} catch (err) {
			setLoading(false);
			console.error(err);
			notifyError('activate-card-failed', err?.error?.message ?? err.message, <IconX size={20} />);
		}
	}, [card, stripe_account_id]);

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
			<SpendingLimitForm
				opened={limitsOpened}
				onClose={() => setLimitsOpened(false)}
				form={spendingLimitForm}
				loading={loading}
				onSubmit={updateSpendingLimit}
			/>
			<AllowedCategoriesForm
				opened={categoriesOpened}
				onClose={() => setCategoriesOpened(false)}
				form={allowedCategoriesForm}
				loading={loading}
				onSubmit={updateAllowedCategories}
			/>
			<Page.Body extraClassNames='px-10'>
				<Group className='pb-6' position='apart'>
					<Group>
						<Title order={1} weight={500}>
							Card **** {card?.last4}
						</Title>
						<div className='flex flex-col items-center'>
							<span className={shipping_status_class}>
								{card?.shipping_status === CARD_SHIPPING_STATUS.DELIVERED
									? card?.status
									: card?.shipping_status}
							</span>
							{card?.shipping_status !== CARD_SHIPPING_STATUS.DELIVERED && (
								<span className='text-xs font-medium text-gray-500'>
									(ETA. {dayjs.unix(card?.shipping_eta).format('DD MMM')})
								</span>
							)}
						</div>
					</Group>
					{!isProd && (
						<CardPaymentButton
							stripeId={stripe_account_id}
							cardId={cardID}
							cardShippingStatus={card?.shipping_status}
							cardStatus={card?.status}
						/>
					)}
				</Group>
				<div className='grid grid-cols-1 gap-y-4 md:grid-cols-3 md:gap-y-0 md:gap-x-4'>
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
									<Text>Edit Limits &nbsp;</Text>
									<ActionIcon size='sm' onClick={() => setLimitsOpened(true)}>
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
										? GBP(
												card?.spending_limits.find(({ interval }) => interval === 'weekly')
													?.amount
										  ).format()
										: '-'}
								</span>
							</Stack>
						</Group>
					</Card>
					<Card shadow='sm' p='lg' radius='md' withBorder>
						<Group position='apart'>
							<Stack>
								<Text color='dimmed' transform='uppercase'>
									Categories
								</Text>
								<span>Fuel</span>
								<span>Truck Stops</span>
								<span>Repairs</span>
							</Stack>
							<Stack className='h-full'>
								<div className='flex h-full'>
									<Text>Edit Categories &nbsp;</Text>
									<ActionIcon size='sm' onClick={() => setCategoriesOpened(true)}>
										<IconEdit />
									</ActionIcon>
								</div>
								<span>{card?.allowed_merchant_categories[0]?.enabled ? 'Allowed' : 'Prohibited'}</span>
								<span>{card?.allowed_merchant_categories[1]?.enabled ? 'Allowed' : 'Prohibited'}</span>
								<span>{card?.allowed_merchant_categories[2]?.enabled ? 'Allowed' : 'Prohibited'}</span>
							</Stack>
						</Group>
					</Card>
					<Card shadow='sm' p='lg' radius='md' withBorder>
						<Stack justify='space-between' className='h-full'>
							<div className='space-y-2'>
								<Text weight={600}>Driver</Text>
								<span>{card?.cardholder_name}</span>
							</div>
							<Elements
								stripe={getStripe({ apiVersion: '2022-08-01', stripeAccount: stripe_account_id })}
							>
								<CardPINDisplay card_id={cardID} nonce={nonce} ephemeral_key_secret={ephemeralKey} />
							</Elements>
							{card?.shipping_status === CARD_SHIPPING_STATUS.DELIVERED && (
								<div>
									<Button
										size={largeScreen ? 'sm' : 'xs'}
										onClick={toggleCardStatus}
										loading={loading}
									>
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
				<ScrollArea.Autosize maxHeight={height - 450}>
					<TransactionTable
						loading={!testMode && transactionsQuery.isLoading}
						data={data}
						spacingY='sm'
						withPagination={false}
					/>
				</ScrollArea.Autosize>
			</Page.Body>
		</Page.Container>
	);
};

export const getServerSideProps = async ({ req, res }) => {
	const session = await unstable_getServerSession(req, res, authOptions);
	return {
		props: {
			session_id: session.id,
			stripe_account_id: session?.stripe.account_id
		}
	};
};

export default CardDetails;
