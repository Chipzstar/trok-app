import React, { useCallback } from 'react';
import { useForm } from '@mantine/form';
import { Button, Checkbox, Group, Stack, TextInput } from '@mantine/core';

const Step4 = () => {
	const form = useForm({
		initialValues: {
			line1: '',
			line2: '',
			city: '',
			postcode: '',
			region: '',
			country: 'GB'
		}
	});

	const handleSubmit = useCallback((values) => {
			alert(values);
		},
		[]
	);

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className='h-full w-full flex'>
			<Stack className="w-1/2 mx-auto my-auto">
				<TextInput
					required
					label='Address line 1'
					placeholder='100 Watson Road'
					{...form.getInputProps('line1')}
				/>
				<TextInput
					required
					label='Address line 2'
					placeholder='Nechells'
					{...form.getInputProps('line2')}
				/>
				<TextInput
					required
					label='City'
					placeholder='Birmingham'
					{...form.getInputProps('city')}
				/>
				<TextInput
					required
					label='Postal Code'
					placeholder='B7 5SA'
					{...form.getInputProps('postcode')}
				/>
				<TextInput
					required
					label='County / Region'
					placeholder='West Midlands'
					{...form.getInputProps('region')}
				/>
				<TextInput
					readOnly
					required
					label='Country'
					placeholder='GB'
					{...form.getInputProps('country')}
				/>
				<Group grow mt="lg">
					<Button type='submit' variant='filled' color='dark' size='lg' classNames={{
						root: 'bg-black w-full'
					}}>
						Continue
					</Button>
				</Group>
			</Stack>
		</form>
	);
};

export default Step4;