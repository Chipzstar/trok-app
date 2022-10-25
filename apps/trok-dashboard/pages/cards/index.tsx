import React, { useCallback, useState } from 'react';
import Page from '../../layout/Page';
import {
	ActionIcon,
	Button,
	Text,
	Drawer,
	Group,
	NumberInput,
	Select,
	Stack,
	Tabs,
	TextInput,
	Title, Loader
} from '@mantine/core';
import CardsTable from '../../containers/CardsTable';
import { GBP, PATHS, SAMPLE_CARDS } from '../../utils/constants';
import { capitalize, sanitize } from '../../utils/functions';
import classNames from 'classnames';
import { trpc } from '../../utils/clients';
import { CARD_STATUS } from '../../utils/types';
import { IconCheck, IconChevronRight, IconX } from '@tabler/icons';
import { useRouter } from 'next/router';
import { useForm } from '@mantine/form';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { CARD_TYPES, intervals, notifyError, notifySuccess } from '@trok-app/shared-utils';

const Cards = ({ testMode, sessionID }) => {
	const [loading, setLoading] = useState(false);
	const [opened, setOpened] = useState(false);
	const router = useRouter();
	const utils = trpc.useContext();
	const driversQuery = trpc.getDrivers.useQuery({ userId: sessionID });
	const cardsQuery = trpc.getCards.useQuery({ userId: sessionID });
	const mutation = trpc.createCard.useMutation({
		onSuccess: function (input) {
			utils.invalidate({ userId: sessionID }).then(r => console.log(input, 'Cards refetched'));
		}
	});
	const rows = testMode
		? SAMPLE_CARDS.map((element, index) => {
				const statusClass = classNames({
					'py-1': true,
					'w-28': true,
					rounded: true,
					'text-center': true,
					uppercase: true,
					'text-xs': true,
					'tracking-wide': true,
					'font-semibold': true,
					'text-success': element.status === CARD_STATUS.ACTIVE,
					'text-danger': element.status === CARD_STATUS.INACTIVE,
					'bg-success/25': element.status === CARD_STATUS.ACTIVE,
					'bg-danger/25': element.status === CARD_STATUS.INACTIVE
				});
				return (
					<tr
						key={index}
						style={{
							border: 'none'
						}}
					>
						<td colSpan={1}>
							<span>{element.last4}</span>
						</td>
						<td colSpan={1}>
							<div className={statusClass}>
								<span>{sanitize(element.status)}</span>
							</div>
						</td>
						<td colSpan={1}>
							<div className='flex flex-shrink flex-col'>
								<span>{element.cardholder_name}</span>
							</div>
						</td>
						<td colSpan={1}>
							<span>{GBP(element.balance).format()}</span>
						</td>
						<td colSpan={1}>
							<span>{GBP(element.spending_limits.weekly).format()}</span>
						</td>
						<td role='button' onClick={() => router.push(`${PATHS.CARDS}/${element.id}`)}>
							<Group grow position='left'>
								<ActionIcon size='sm'>
									<IconChevronRight />
								</ActionIcon>
							</Group>
						</td>
					</tr>
				);
		  })
		: !cardsQuery.isLoading
		? cardsQuery.data.map((element, index) => {
				const statusClass = classNames({
					'py-1': true,
					'w-28': true,
					rounded: true,
					'text-center': true,
					uppercase: true,
					'text-xs': true,
					'tracking-wide': true,
					'font-semibold': true,
					'text-success': element.status === CARD_STATUS.ACTIVE,
					'text-danger': element.status === CARD_STATUS.INACTIVE,
					'bg-success/25': element.status === CARD_STATUS.ACTIVE,
					'bg-danger/25': element.status === CARD_STATUS.INACTIVE
				});
				return (
					<tr
						key={index}
						style={{
							border: 'none'
						}}
					>
						<td colSpan={1}>
							<span>{element.last4}</span>
						</td>
						<td colSpan={1}>
							<div className={statusClass}>
								<span>{sanitize(element.status)}</span>
							</div>
						</td>
						<td colSpan={1}>
							<div className='flex flex-shrink flex-col'>
								<span>{element.cardholder_name}</span>
							</div>
						</td>
						<td colSpan={1}>
							<span>{GBP(element.current_balance).format()}</span>
						</td>
						<td colSpan={1}>
							<span>{GBP(element.spending_limits[0].amount).format()}</span>
						</td>
						<td role='button' onClick={() => router.push(`${PATHS.CARDS}/${element.id}`)}>
							<Group grow position='left'>
								<ActionIcon size='sm'>
									<IconChevronRight />
								</ActionIcon>
							</Group>
						</td>
					</tr>
				);
		  })
		: [];

	const form = useForm({
		initialValues: {
			type: '', // physical or virtual
			driver: '', // driver id
			card_name: '', // useful name to identify the cardholder
			frequency: null,
			spending_limit: {
				amount: 0,
				interval: null
			}
		}
	});

	const handleSubmit = useCallback(async values => {
		setLoading(true);
		console.log(values);
		try {
			const driver = driversQuery?.data.find(driver => values.driver === driver.id)
			if (driver) {
				const card = await mutation.mutateAsync({
					user_id: sessionID,
					card_type: values.type,
					card_name: values.card_name,
					driver_id: values.driver,
					cardholder_id: driver?.cardholder_id,
					currency: values.currency,
					spending_limits: {
						amount: values.spending_limit.amount * 100,
						interval: values.spending_limit.interval
					}
				});
				setLoading(false);
				setOpened(false);
				notifySuccess('add-driver-success', `New Card added for ${card.cardholder_name}`, <IconCheck size={20} />);
			} else {
				throw new Error("Could not find a driver with ID " + values.driver)
			}
		} catch (err) {
			console.error(err);
			setLoading(false);
			notifyError('add-card-failed', err.message, <IconX size={20} />);
		}
	}, [sessionID, driversQuery]);

	return (
		<Page.Container
			header={
				<Page.Header>
					<span className='text-2xl font-medium'>Cards</span>
					<Button className='' onClick={() => setOpened(true)}>
						<span className='text-base font-normal'>Add new card</span>
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
						<span>Create new card</span>
					</Title>
					<form onSubmit={form.onSubmit(handleSubmit)} className='flex flex-col space-y-4'>
						<Select
							required
							label='Card Type'
							data={Object.values(CARD_TYPES).map(item => ({
								label: capitalize(item),
								value: item
							}))}
							{...form.getInputProps('type')}
						/>
						<Select
							required
							label='Assign Driver'
							data={driversQuery?.data?.map(value => ({
								label: value.full_name,
								value: value.id
							}))}
							{...form.getInputProps('driver')}
						/>
						<TextInput
							description='You can give this card a nickname for easy identification'
							label='Card Name'
							{...form.getInputProps('card_name')}
						/>
						<Group grow spacing='xl'>
							<NumberInput
								required
								label='Spend Limit'
								min={100}
								max={1000000}
								step={100}
								parser={(value: string) => value.replace(/\£\s?|(,*)/g, '')}
								formatter={value =>
									!Number.isNaN(parseFloat(value))
										? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
										: '£ '
								}
								{...form.getInputProps('spending_limit.amount')}
							/>
							<Select
								required
								label='Frequency'
								data={intervals.slice(0, -1).map(item => ({
									label: capitalize(sanitize(item)),
									value: item
								}))}
								{...form.getInputProps('spending_limit.interval')}
							/>
						</Group>
						<Group py='xl' position='right'>
							<Button type='submit'>
								<Loader size='sm' className={`mr-3 ${!loading && 'hidden'}`} color='white' />
								<Text weight={500}>Create</Text>
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
						<Tabs.Tab value='all'>All Cards</Tabs.Tab>
						<Tabs.Tab value='active'>Active</Tabs.Tab>
						<Tabs.Tab value='inactive'>Inactive</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='all' className='h-full'>
						<CardsTable rows={rows} />
					</Tabs.Panel>

					<Tabs.Panel value='active' className='h-full'>
						<CardsTable rows={rows} />
					</Tabs.Panel>

					<Tabs.Panel value='inactive' className='h-full'>
						<CardsTable rows={rows} />
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
			sessionID: session.id
		}
	};
};

export default Cards;
