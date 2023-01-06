import React, { useCallback, useState } from 'react';
import Page from '../../layout/Page';
import { Button, Drawer, Group, NumberInput, Select, Stack, Tabs, Text, TextInput, Title } from '@mantine/core';
import CardsTable from '../../containers/CardsTable';
import { SAMPLE_CARDS } from '../../utils/constants';
import { trpc } from '../../utils/clients';
import { IconCheck, IconX } from '@tabler/icons';
import { useForm } from '@mantine/form';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { capitalize, intervals, notifyError, notifySuccess, sanitize } from '@trok-app/shared-utils';

const Cards = ({ testMode, session_id }) => {
	const [activeTab, setActiveTab] = useState<string | null>('all');
	const [loading, setLoading] = useState(false);
	const [opened, setOpened] = useState(false);
	const utils = trpc.useContext();
	const driversQuery = trpc.getDrivers.useQuery({ userId: session_id });
	const cardsQuery = trpc.getCards.useQuery({ userId: session_id });
	const mutation = trpc.createCard.useMutation({
		onSuccess: function (input) {
			utils.getCards.invalidate({ userId: session_id }).then(r => console.log(input, 'Cards refetched'));
		}
	});

	const data = testMode
		? SAMPLE_CARDS.filter(c => activeTab === 'all' || c.status === activeTab)
		: cardsQuery.data
		? cardsQuery?.data.filter(c => activeTab === 'all' || c.status === activeTab)
		: [];

	const form = useForm({
		initialValues: {
			// physical or virtual
			driver: '', // driver id
			card_name: '', // useful name to identify the cardholder
			spending_limit: {
				amount: 0,
				interval: null
			}
		},
		validate: {
			spending_limit: {
				amount: (val, values) => val < 100 ? "Limit must be more than £100" : null,
				interval: (val, values) => !val ? "Required" : null
			}
		}
	});

	const handleSubmit = useCallback(
		async values => {
			setLoading(true);
			try {
				const driver = driversQuery?.data.find(driver => values.driver === driver.id);
				if (driver) {
					const card = await mutation.mutateAsync({
						user_id: session_id,
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
					notifySuccess(
						'add-driver-success',
						`New Card added for ${card.cardholder_name}`,
						<IconCheck size={20} />
					);
				} else {
					throw new Error('Could not find a driver with ID ' + values.driver);
				}
			} catch (err) {
				console.error(err);
				setLoading(false);
				notifyError('add-card-failed', err?.error?.message ?? err.message, <IconX size={20} />);
			}
		},
		[session_id, driversQuery]
	);

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
						<TextInput
							description='You can give this card a nickname for easy identification'
							label='Card Name'
							{...form.getInputProps('card_name')}
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
						<Group grow spacing='xl'>
							<NumberInput
								required
								label='Spend Limit'
								min={100}
								max={1000000}
								step={100}
								parser={(value: string) => value.replace(/£\s?|(,*)/g, '')}
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
							<Button type='submit' loading={loading}>
								<Text weight={500}>Create</Text>
							</Button>
						</Group>
					</form>
				</Stack>
			</Drawer>
			<Page.Body>
				<Tabs
					value={activeTab}
					onTabChange={setActiveTab}
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
						<CardsTable loading={!testMode && cardsQuery.isLoading} data={data} />
					</Tabs.Panel>

					<Tabs.Panel value='active' className='h-full'>
						<CardsTable loading={!testMode && cardsQuery.isLoading} data={data} />
					</Tabs.Panel>

					<Tabs.Panel value='inactive' className='h-full'>
						<CardsTable loading={!testMode && cardsQuery.isLoading} data={data} />
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
			session_id: session.id
		}
	};
};

export default Cards;
