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
	Title
} from '@mantine/core';
import CardsTable from '../../containers/CardsTable';
import { GBP, PATHS, SAMPLE_CARDS, SAMPLE_DRIVERS } from '../../utils/constants';
import { sanitize } from '../../utils/functions';
import classNames from 'classnames';
import { CARD_STATUS } from '../../utils/types';
import { IconChevronRight } from '@tabler/icons';
import { useRouter } from 'next/router';
import { useForm } from '@mantine/form';

const Cards = () => {
	const [opened, setOpened] = useState(false);
	const router = useRouter();
	const rows = SAMPLE_CARDS.map((element, index) => {
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
					<span>{GBP(element.spending_limit.weekly).format()}</span>
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
	});

	const form = useForm({
		initialValues: {
			type: '', // physical or virtual
			driver: '', // driver id
			card_name: '', // useful name to identify the cardholder
			spending_limit: null,
			frequency: null,
			payment_methods_allowed: []
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
						<Select required label='Card Type' data={['Physical', 'Virtual']} {...form.getInputProps('type')} />
						<Select
							required
							label='Assign Driver'
							data={SAMPLE_DRIVERS.map(value => ({
								label: value.full_name,
								value: value.id
							}))}
							{...form.getInputProps('driver')}
						/>
						<TextInput description="You can give this card a nickname for easy identification" label='Card Name' {...form.getInputProps('card_name')} />
						<Group grow spacing="xl">
							<NumberInput
								label='Spend Limit'
								min={100}
								max={1000000}
								step={100}
								formatter={(value) =>
									!Number.isNaN(parseFloat(value))
										? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
										: '£ '
								}
								{...form.getInputProps('spending_limit')}
							/>
							<Select
								label="Frequency"
								data={['Per transaction', 'Daily', 'Weekly', 'Monthly']}
								{...form.getInputProps('frequency')}
							/>
						</Group>
						<Group py="xl" position="right">
							<Button type="submit">
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

					<Tabs.Panel value='all' pt='xs' className='h-full'>
						<CardsTable rows={rows} />
					</Tabs.Panel>

					<Tabs.Panel value='active' pt='xs' className='h-full'>
						<CardsTable rows={rows} />
					</Tabs.Panel>

					<Tabs.Panel value='inactive' pt='xs' className='h-full'>
						<CardsTable rows={rows} />
					</Tabs.Panel>
				</Tabs>
			</Page.Body>
		</Page.Container>
	);
};

export default Cards;
