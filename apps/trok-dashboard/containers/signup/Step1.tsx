import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { Button, FileButton, Group, NumberInput, Select, Stack, Text, TextInput, Loader } from '@mantine/core';
import { IconCurrencyPound, IconX } from '@tabler/icons';
import { useLocalStorage } from '@mantine/hooks';
import { STORAGE_KEYS } from '../../utils/constants';
import axios from 'axios';
import { notifyError, OnboardingBusinessInfo } from '@trok-app/shared-utils';

const Step1 = ({ nextStep }) => {
	const [loading, setLoading] = useState(false);
	const [files, setFile] = useState<File>(null);
	const [account, setAccount] = useLocalStorage({ key: STORAGE_KEYS.ACCOUNT, defaultValue: null });
	const [companyForm, setCompanyForm] = useLocalStorage<OnboardingBusinessInfo>({
		key: STORAGE_KEYS.COMPANY_FORM,
		defaultValue: {
			legal_name: '',
			weekly_fuel_spend: '',
			business_type: undefined,
			merchant_category_code: null,
			business_crn: '',
			business_url: '',
			num_vehicles: null
		}
	});

	const form = useForm<OnboardingBusinessInfo>({
		initialValues: {
			...companyForm
		},
		validate: {
			weekly_fuel_spend: val => (Number(val) <= 0 ? 'Value must be at least £100' : null),
			num_vehicles: val => (Number(val) <= 0 ? 'You must have at least 1 vehicle' : null)
		}
	});

	const handleSubmit = useCallback(
		async values => {
			setLoading(true);
			console.log(values);
			try {
				const result = (
					await axios.post('/api/auth/onboarding', values, {
						params: {
							email: account?.email,
							step: 2
						}
					})
				).data;
				console.log('-----------------------------------------------');
				console.log(result);
				console.log('-----------------------------------------------');
				setAccount({...account, business: values})
				setLoading(false);
				nextStep();
			} catch (err) {
				setLoading(false);
				console.error(err);
				notifyError('onboarding-step1-failure', err.error.message, <IconX size={20} />);
			}
		},
		[account?.email, nextStep]
	);

	useEffect(() => {
		const storedValue = window.localStorage.getItem(STORAGE_KEYS.COMPANY_FORM);
		if (storedValue) {
			try {
				form.setValues(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.COMPANY_FORM)));
			} catch (e) {
				console.log('Failed to parse stored value');
				console.error(e);
			}
		}
	}, []);

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEYS.COMPANY_FORM, JSON.stringify(form.values));
	}, [form.values]);

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className='flex h-full w-full flex-col'>
			<h1 className='mb-4 text-2xl font-medium'>Your company</h1>
			<Stack>
				<TextInput required label='Company legal name' {...form.getInputProps('legal_name')} />
				<TextInput
					required
					label='Weekly fuel and maintenance spend'
					icon={<IconCurrencyPound size={16} />}
					{...form.getInputProps('weekly_fuel_spend')}
				/>
				<Group grow>
					<Select
						required
						label='Type of business'
						data={[
							{
								label: 'Public Company',
								value: 'public_corporation'
							},
							{
								label: 'Private Company',
								value: 'private_corporation'
							}
						]}
						{...form.getInputProps('business_type')}
					/>
					<Select
						required
						label='Type of industry'
						data={[
							{
								label: 'Transportation - Other',
								value: '4789'
							},
							{ label: 'Transportation - Motor Freight, Carriers & Trucking', value: '4214' },
							{ label: 'Motor Vehicle Supplies and New Parts', value: '5013' }
						]}
						{...form.getInputProps('merchant_category_code')}
					/>
				</Group>
				<Group grow>
					<TextInput
						type='number'
						minLength={8}
						maxLength={8}
						required
						label='Company Reg No.'
						{...form.getInputProps('business_crn')}
					/>
					<NumberInput
						label='Number of Vehicles'
						min={1}
						max={100}
						required
						{...form.getInputProps('num_vehicles')}
					/>
				</Group>
				<TextInput
					required
					type='text'
					label='Business URL'
					{...form.getInputProps('business_url')}
					description='If you do not have a website, please enter a short description of your business'
				/>
				<div>
					<Text size='md'>{"Upload front of Driver's License"}</Text>
					<FileButton onChange={setFile} accept='image/png,image/jpeg'>
						{props => (
							<Button variant='outline' fullWidth {...props}>
								Upload picture
							</Button>
						)}
					</FileButton>
				</div>
				<Group position='right'>
					<Button
						type='submit'
						variant='filled'
						size='md'
						style={{
							width: 200
						}}
					>
						<Loader size='sm' className={`mr-3 ${!loading && 'hidden'}`} color="white" />
						Continue
					</Button>
				</Group>
			</Stack>
		</form>
	);
};

export default Step1;
