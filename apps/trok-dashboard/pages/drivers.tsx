import { ActionIcon, Button, Drawer, Group, NumberInput, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { useRouter } from 'next/router';
import React, { useCallback, useState } from 'react';
import { IconPencil } from '@tabler/icons';
import { GBP, SAMPLE_DRIVERS } from '../utils/constants';
import PageContainer from '../layout/PageContainer';
import DriversTable from '../containers/DriversTable';
import { useForm } from '@mantine/form';

const rows = SAMPLE_DRIVERS.map((element, index) => {
	return (
		<tr key={index}>
			<td colSpan={1}>
				<span>{element.firstname}</span>
			</td>
			<td colSpan={1}>
				<span>{element.lastname}</span>
			</td>
			<td colSpan={1}>
				<span>{GBP(element.current_spend).format()}</span>
			</td>
			<td colSpan={1}>
				<span>{GBP(element.spending_limit).format()}</span>
			</td>
			<td colSpan={1}>
				<span>{element.phone}</span>
			</td>
			<td colSpan={1}>
				<span>{element.email}</span>
			</td>
			<td>
				<Group spacing='md' position='left'>
					<ActionIcon size='sm' onClick={() => null}>
						<IconPencil />
					</ActionIcon>
				</Group>
			</td>
		</tr>
	);
});

const Drivers = () => {
	const [opened, setOpened] = useState(false);
	const router = useRouter();

	const form = useForm({
		initialValues: {
			firstname: '',
			lastname: '',
			email: '',
			phone: '',
			line1: '',
			line2: '',
			city: '',
			postcode: '',
			region: '',
			country: 'GB',
			spending_limit: 100,
			frequency: 'daily'
		}
	})

	const handleSubmit = useCallback(values => {
		alert(JSON.stringify(values));
		console.log(values)
	}, [])

	return (
		<PageContainer
			header={
				<PageContainer.Header>
					<span className='text-2xl font-medium'>Drivers</span>
					<Button className='' onClick={() => setOpened(true)}>
						<span className='text-base font-normal'>Add new driver</span>
					</Button>
				</PageContainer.Header>
			}
		>
			<Drawer
				opened={opened}
				onClose={() => setOpened(false)}
				padding='xl'
				size='xl'
				position='right'
			>
				<Stack justify='center'>
					<Title order={2} weight={500}>
						<span>Create new card</span>
					</Title>
					<form onSubmit={form.onSubmit(handleSubmit)} className='flex flex-col space-y-4'>
						<Group grow spacing="xl">
							<TextInput label='First Name' {...form.getInputProps('firstname')} />
							<TextInput label='Last Name' {...form.getInputProps('lastname')} />
						</Group>
						<Group grow spacing="xl">
							<TextInput label='Phone Number' {...form.getInputProps('phone')} />
							<TextInput label='Email' {...form.getInputProps('email')} />
						</Group>
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
						<Group grow spacing="xl">
							<TextInput label='Address 1' {...form.getInputProps('line1')} />
							<TextInput label='Address 2' {...form.getInputProps('line2')} />
						</Group>
						<Group grow spacing="xl">
							<TextInput label='City' {...form.getInputProps('city')} />
							<TextInput label='Postal Code' {...form.getInputProps('postcode')} />
						</Group>
						<Group grow spacing="xl">
							<TextInput label='Region' {...form.getInputProps('region')} />
							<TextInput label='Country' readOnly {...form.getInputProps('country')} />
						</Group>
						<Group py="xl" position="right">
							<Button>
								<Text weight={500}>Add Driver</Text>
							</Button>
						</Group>
					</form>
				</Stack>
			</Drawer>
			<PageContainer.Body>
				<DriversTable rows={rows}/>
			</PageContainer.Body>
		</PageContainer>
	);
};

export default Drivers;
