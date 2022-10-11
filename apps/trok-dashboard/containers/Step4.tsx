import React, { useCallback } from 'react';
import { useForm } from '@mantine/form';
import { Button, Checkbox, Group, NumberInput, Radio, Space, Stack, TextInput } from '@mantine/core';

const Step4 = ({ nextStep }) => {
	const form = useForm({
		initialValues: {
			line1: '',
			line2: '',
			city: '',
			postcode: '',
			region: '',
			country: 'GB',
			card_business_name: '',
			num_cards: null,
			shipping_speed: 'standard',
			shipping_address: {
				line1: '',
				line2: '',
				city: '',
				postcode: '',
				region: '',
				country: 'GB',
			}
		}
	});

	const handleSubmit = useCallback((values) => {
			console.log(values);
			nextStep();
		},
		[]
	);

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className='h-full w-full flex flex-col'>
			<h1 className='text-2xl text-center font-semibold mb-4'>Tell us where you are located</h1>
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
					label='Use a different shipping address'
				/>
				<h1 className='text-2xl text-center font-semibold mb-4'>Configure Card Details</h1>
				<TextInput
					required
					label='Business Name on card'
					placeholder='<COMPANY NAME>'
					{...form.getInputProps('card_business_name')}
				/>
				<NumberInput
					min={1}
					max={50}
					label='Number of Cards'
					placeholder='0'
					{...form.getInputProps('num_cards')}
				/>
				<Radio.Group
					spacing="xs"
					name='Shipping Speed'
					orientation='vertical'
					label='Select shipping speed'
					withAsterisk
				>
					<Radio value='standard' label='3-8 days. Cards left at address' />
					<Radio value='express' label='2-3 days. Cards left at address' />
					<Radio value='signature' label='2-3 days. Signature required at delivery' />
				</Radio.Group>
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