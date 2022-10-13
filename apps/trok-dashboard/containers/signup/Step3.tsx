import React, { useCallback, useEffect } from 'react';
import { useForm } from '@mantine/form';
import { Button, Checkbox, Group, NumberInput, Radio, Text, Stack, TextInput } from '@mantine/core';
import { STORAGE_KEYS } from '../../utils/constants';
import { useLocalStorage } from '@mantine/hooks';

const Step3 = ({ finish }) => {
	const [locationForm, setLocationForm] = useLocalStorage({
		key: STORAGE_KEYS.COMPANY_FORM,
		defaultValue: {
			line1: '',
			line2: '',
			city: '',
			postcode: '',
			region: '',
			country: 'GB',
			card_business_name: '',
			num_cards: null,
			shipping_speed: 'standard',
			same_shipping_address: false,
			shipping_address: {
				line1: '',
				line2: '',
				city: '',
				postcode: '',
				region: '',
				country: 'GB'
			}
		}
	});
	const form = useForm({
		initialValues: {
			...locationForm
		}
	});

	const handleSubmit = useCallback(values => {
		console.log(values);
		finish(true);
	}, []);

	useEffect(() => {
		const storedValue = window.localStorage.getItem(STORAGE_KEYS.LOCATION_FORM);
		if (storedValue) {
			try {
				form.setValues(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.LOCATION_FORM)));
			} catch (e) {
				console.log('Failed to parse stored value');
				console.error(e);
			}
		}
	}, []);

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEYS.LOCATION_FORM, JSON.stringify(form.values));
	}, [form.values]);

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className='flex h-full w-full flex-col'>
			<h1 className='mb-4 text-2xl font-medium'>Your location</h1>
			<Stack>
				<Group grow>
					<TextInput required label='Address line 1' {...form.getInputProps('line1')} />
					<TextInput label='Address line 2' {...form.getInputProps('line2')} />
				</Group>
				<Group grow>
					<TextInput required label='City' {...form.getInputProps('city')} />
					<TextInput required label='Postal Code' {...form.getInputProps('postcode')} />
				</Group>
				<Group grow>
					<TextInput required label='County / Region' {...form.getInputProps('region')} />
					<TextInput readOnly label='Country' {...form.getInputProps('country')} />
				</Group>
				<Checkbox
					label='Use a different shipping address'
					{...form.getInputProps('same_shipping_address', { type: 'checkbox' })}
				/>
				{form.values.same_shipping_address && (
					<>
						<h1 className='text-2xl font-medium'>Shipping address</h1>
						<Group grow>
							<TextInput required label='Address line 1' {...form.getInputProps('shipping_address.line1')} />
							<TextInput label='Address line 2' {...form.getInputProps('shipping_address.line2')} />
						</Group>
						<Group grow>
							<TextInput required label='City' {...form.getInputProps('shipping_address.city')} />
							<TextInput required label='Postal code' {...form.getInputProps('shipping_address.postcode')} />
						</Group>
						<Group grow>
							<TextInput required label='County/Region' {...form.getInputProps('shipping_address.region')} />
							<TextInput readOnly label='Country' {...form.getInputProps('shipping_address.country')} />
						</Group>
					</>
				)}
				<h1 className='text-2xl font-medium'>Configure card details</h1>
				<TextInput required label='Business name on card' {...form.getInputProps('card_business_name')} />
				<NumberInput min={1} max={50} required label='Number of cards' {...form.getInputProps('num_cards')} />
				<Radio.Group
					spacing='xs'
					name='Shipping Speed'
					orientation='vertical'
					label='Select shipping speed'
					withAsterisk
					{...form.getInputProps('shipping_speed')}
				>
					<Radio value='standard' label='3-8 days. Cards left at address' />
					<Radio value='express' label='2-3 days. Cards left at address' />
					<Radio value='signature' label='2-3 days. Signature required at delivery' />
				</Radio.Group>
				<Group mt='lg' position='right'>
					<Button type='submit' variant='filled' size='md' px='xl'>
						<Text weight='normal'>Complete Application</Text>
					</Button>
				</Group>
			</Stack>
		</form>
	);
};

export default Step3;