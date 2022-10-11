import React, { useCallback } from 'react';
import { useForm } from '@mantine/form';
import { Button, Checkbox, Group, Stack, TextInput } from '@mantine/core';

const Step4 = ({nextStep}) => {
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
			console.log(values);
			nextStep()
		},
		[]
	);

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className='h-full w-full flex flex-col'>
			<h1 className="text-2xl text-center font-semibold mb-4">Tell us where you are located</h1>
			<Stack className='mx-auto my-auto'>
				<Group grow>
					<TextInput
						required
						label='Address line 1'
						placeholder='100 Watson Road'
						{...form.getInputProps('line1')}
					/>
					<TextInput
						label='Address line 2'
						placeholder='Nechells'
						{...form.getInputProps('line2')}
					/>
				</Group>
				<Group grow>
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
				</Group>
				<Group grow>
					<TextInput
						required
						label='County / Region'
						placeholder='West Midlands'
						{...form.getInputProps('region')}
					/>
					<TextInput
						readOnly
						label='Country'
						placeholder='GB'
						{...form.getInputProps('country')}
					/>
				</Group>
				<Checkbox
					required
					label="Use a different shipping address"
				/>
				<Group grow mt='lg'>
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