import { Button, Checkbox, Group, Loader, Modal, NumberInput, Select, Text, TextInput } from '@mantine/core';
import React, { useEffect } from 'react';
import { useForm } from '@mantine/form';
import { capitalize, intervals, sanitize } from '@trok-app/shared-utils';

const EditDriverForm = ({ loading, driver, onClose, onSubmit }) => {
	const form = useForm({
		initialValues: {
			firstname: driver?.firstname,
			lastname: driver?.lastname,
			email: driver?.email,
			phone: driver?.phone,
			address: {
				line1: driver?.address.line1,
				city: driver?.address.city,
				postcode: driver?.address.postcode,
				region: driver?.address.region,
				country: 'GB'
			},
			has_spending_limit: false,
			spending_limit: {
				amount: 100,
				interval: ''
			}
		}
	});

	useEffect(() => {
		form.setValues({
			...driver,
			/*address: {
				...driver.address,
				line2: driver?.address.line2 ?? undefined
			},*/
			has_spending_limit: !!driver?.spending_limit,
			spending_limit: {
				amount: driver?.spending_limit?.amount ?? null,
				interval: driver?.spending_limit?.interval ?? null
			}
		});
		form.resetDirty();
	}, [driver]);

	return (
		<Modal
			opened={!!driver}
			onClose={onClose}
			centered
			padding='lg'
			size='lg'
			title='Update Driver'
			styles={{
				title: {
					fontSize: 24
				}
			}}
		>
			<form onSubmit={form.onSubmit(onSubmit)} className='flex flex-col space-y-4'>
				<Group grow spacing='xl'>
					<TextInput required label='First Name' {...form.getInputProps('firstname')} />
					<TextInput required label='Last Name' {...form.getInputProps('lastname')} />
				</Group>
				<Group grow spacing='xl'>
					<TextInput required type='tel' label='Phone Number' {...form.getInputProps('phone')} />
					<TextInput required type='email' label='Email' {...form.getInputProps('email')} />
				</Group>
				<Group grow spacing='xl'>
					<TextInput required label='Address 1' {...form.getInputProps('address.line1')} />
					<TextInput label='Address 2' {...form.getInputProps('address.line2')} />
				</Group>
				<Group grow spacing='xl'>
					<TextInput required label='City' {...form.getInputProps('address.city')} />
					<TextInput required label='Postal Code' {...form.getInputProps('address.postcode')} />
				</Group>
				<Group grow spacing='xl'>
					<TextInput required label='Region' {...form.getInputProps('address.region')} />
					<TextInput required label='Country' readOnly {...form.getInputProps('address.country')} />
				</Group>
				<Checkbox
					label='Add spending limit'
					size='sm'
					{...form.getInputProps('has_spending_limit', { type: 'checkbox' })}
				/>
				{form.values.has_spending_limit && (
					<Group grow spacing='xl'>
						<NumberInput
							required={form.values.has_spending_limit}
							type='text'
							label='Spend Limit'
							min={100}
							max={1000000}
							step={100}
							parser={(value: string) => value.replace(/£\s?|(,*)/g, '')}
							formatter={(value: string) =>
								!Number.isNaN(parseFloat(value))
									? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
									: '£ '
							}
							{...form.getInputProps('spending_limit.amount')}
						/>
						<Select
							required={form.values.has_spending_limit}
							label='Frequency'
							data={intervals.slice(0, -1).map(item => ({
								label: capitalize(sanitize(item)),
								value: item
							}))}
							{...form.getInputProps('spending_limit.interval')}
						/>
					</Group>
				)}
				<Group position='right'>
					<Button disabled={!form.isDirty()} type='submit' loading={loading}>
						<Text weight={500}>Update Driver</Text>
					</Button>
				</Group>
			</form>
		</Modal>
	);
};

export default EditDriverForm;
