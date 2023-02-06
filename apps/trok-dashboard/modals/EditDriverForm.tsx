import { Button, Checkbox, Group, Modal, NumberInput, Select, Text, TextInput } from '@mantine/core';
import React, { useEffect } from 'react';
import { useForm } from '@mantine/form';
import { capitalize, intervals, DriverFormValues, sanitize } from '@trok-app/shared-utils';

const EditDriverForm = ({ loading, driver, onClose, onSubmit }) => {
	const form = useForm<DriverFormValues>({
		initialValues: {
			firstname: driver?.firstname,
			lastname: driver?.lastname,
			email: driver?.email,
			phone: driver?.phone,
			line1: driver?.address.line1,
			city: driver?.address.city,
			postcode: driver?.address.postcode,
			region: driver?.address.region,
			country: driver?.address.country ?? "GB",
			has_spending_limit: false,
			spending_limit: {
				amount: 100,
				interval: null
			}
		},
		validate: {
			firstname: val => !val ? 'Required' : null,
			lastname: val => !val ? 'Required' : null,
			email: val => !val ? 'Required' : null,
			phone: val => !val ? 'Required' : null,
			line1: val => !val ? 'Required' : null,
			city: val => !val ? 'Required' : null,
			postcode: val => !val ? 'Required' : null,
			region: val => !val ? 'Required' : null,
			country: val => !val ? 'Required' : null,
			spending_limit: {
				amount: (value, values) => values.has_spending_limit && (!value || Number(value) < 100) ? 'Amount must be at least £100' : null,
				interval: (value, values) => values.has_spending_limit && !value ? 'Required' : null
			}
		}
	});

	useEffect(() => {
		form.setValues(values => ({
			...values,
			firstname: driver?.firstname ?? "",
			lastname: driver?.lastname ?? "",
			email: driver?.email ?? "",
			phone: driver?.phone ?? "",
			line1: driver?.address.line1 ?? "",
			line2: driver?.address?.line2 ?? "",
			city: driver?.address.city ?? "",
			postcode: driver?.address.postcode ?? "",
			region: driver?.address.region ?? "",
			country: driver?.address.country ?? "GB",
			has_spending_limit: !!driver?.spending_limit,
			spending_limit: {
				amount: driver?.spending_limit?.amount ?? null,
				interval: driver?.spending_limit?.interval ?? null
			}
		}));
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
			<form onSubmit={form.onSubmit(onSubmit)} className='flex flex-col space-y-4' data-cy='edit-driver-form'>
				<Group grow spacing='xl'>
					<TextInput
						withAsterisk
						label='First Name'
						{...form.getInputProps('firstname')}
						data-cy='edit-driver-firstname'
					/>
					<TextInput
						withAsterisk
						label='Last Name'
						{...form.getInputProps('lastname')}
						data-cy='edit-driver-lastname'
					/>
				</Group>
				<Group grow spacing='xl'>
					<TextInput
						withAsterisk
						type='tel'
						label='Phone Number'
						{...form.getInputProps('phone')}
						data-cy='edit-driver-phone'
					/>
					<TextInput
						withAsterisk
						type='email'
						label='Email'
						{...form.getInputProps('email')}
						data-cy='edit-driver-email'
					/>
				</Group>
				<Group grow spacing='xl'>
					<TextInput
						withAsterisk
						label='Address 1'
						{...form.getInputProps('line1')}
						data-cy='edit-driver-line1'
					/>
					<TextInput label='Address 2' {...form.getInputProps('line2')} data-cy='edit-driver-line2' />
				</Group>
				<Group grow spacing='xl'>
					<TextInput
						withAsterisk
						label='City'
						{...form.getInputProps('city')}
						data-cy='edit-driver-city'
					/>
					<TextInput
						withAsterisk
						label='Postal Code'
						{...form.getInputProps('postcode')}
						data-cy='edit-driver-postcode'
					/>
				</Group>
				<Group grow spacing='xl'>
					<TextInput
						withAsterisk
						label='Region'
						{...form.getInputProps('region')}
						data-cy='edit-driver-region'
					/>
					<TextInput
						withAsterisk
						label='Country'
						readOnly
						{...form.getInputProps('country')}
						data-cy='edit-driver-country'
					/>
				</Group>
				<Checkbox
					label='Add spending limit'
					size='sm'
					{...form.getInputProps('has_spending_limit', { type: 'checkbox' })}
					data-cy="edit-driver-has-spending-limit"
				/>
				{form.values.has_spending_limit && (
					<Group grow spacing='xl'>
						<NumberInput
							withAsterisk={form.values.has_spending_limit}
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
							withAsterisk={form.values.has_spending_limit}
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
