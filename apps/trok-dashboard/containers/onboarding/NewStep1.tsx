import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { Button, Group, NumberInput, Select, Stack, TextInput, Space } from '@mantine/core';
import { IconX } from '@tabler/icons';
import { useLocalStorage } from '@mantine/hooks';
import { INDUSTRY_TYPES, STORAGE_KEYS } from '../../utils/constants';
import { NewOnboardingAccountStep1, NewOnboardingBusinessInfo, notifyError } from '@trok-app/shared-utils';
import { apiClient } from '../../utils/clients';
import { validateCompanyInfo } from '../../utils/functions';

const NewStep1 = ({ nextStep }) => {
	const [loading, setLoading] = useState(false);
	const [account, setAccount] = useLocalStorage<Partial<NewOnboardingAccountStep1>>({ key: STORAGE_KEYS.ACCOUNT, defaultValue: null });
	const [companyForm, setCompanyForm] = useLocalStorage<NewOnboardingBusinessInfo>({
		key: STORAGE_KEYS.COMPANY_FORM,
		defaultValue: {
			legal_name: '',
			num_monthly_invoices: null,
			business_type: null,
			merchant_category_code: null,
			business_crn: '',
			business_url: '',
			num_vehicles: null
		}
	});

	const form = useForm<NewOnboardingBusinessInfo>({
		initialValues: {
			...companyForm
		},
		validate: {
			business_crn: val =>
				val.length > 8 || val.length < 7 ? 'Company registration number must be 7-8 digits' : null,
			business_type: val => (!val ? 'Required' : null),
			merchant_category_code: val => (!val ? 'Required' : null),
			num_monthly_invoices: val => (Number(val) <= 0 ? 'Required' : null),
			num_vehicles: val => (Number(val) <= 0 ? 'You must have at least 1 vehicle' : null)
		}
	});

	const handleSubmit = useCallback(
		async (values: NewOnboardingBusinessInfo) => {
			setLoading(true);
			try {
				const { is_valid, reason } = await validateCompanyInfo(values.business_crn, values.legal_name);
				if (!is_valid) throw new Error(reason);
				const result = (
					await apiClient.post('/server/auth/onboarding', values, {
						params: {
							email: account?.email,
							step: 2
						}
					})
				).data;
				console.log('-----------------------------------------------');
				console.log(result);
				console.log('-----------------------------------------------');
				setAccount({ ...account, business: values });
				setLoading(false);
				nextStep();
			} catch (err) {
				setLoading(false);
				console.error(err);
				notifyError('onboarding-step1-failure', err?.error?.message ?? err.message, <IconX size={20} />);
			}
		},
		[account, nextStep, setAccount]
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
		<form onSubmit={form.onSubmit(handleSubmit)} className='flex h-full w-full flex-col' data-cy="onboarding-company-form">
			<h1 className='mb-4 text-2xl font-medium'>Your company</h1>
			<Stack>
				<TextInput required label='Company legal name' {...form.getInputProps('legal_name')} data-cy="onboarding-legal-name" />
				<NumberInput
					type='number'
					min={0}
					max={999999}
					required
					label='Number of monthly invoices'
					{...form.getInputProps('num_monthly_invoices')}
					data-cy="onboarding-num-monthly-invoices"
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
						data-cy="onboarding-business-type"
					/>
					<Select
						required
						label='Type of industry'
						data={INDUSTRY_TYPES}
						{...form.getInputProps('merchant_category_code')}
						data-cy="onboarding-merchant-category-code"
					/>
				</Group>
				<Group grow>
					<TextInput
						type='number'
						minLength={7}
						maxLength={8}
						required
						label='Company Reg No.'
						{...form.getInputProps('business_crn')}
						data-cy="onboarding-business-crn"
					/>
					<NumberInput
						type='number'
						label='Number of Vehicles'
						min={1}
						max={100}
						required
						{...form.getInputProps('num_vehicles')}
						data-cy="onboarding-num-vehicles"
					/>
				</Group>
				<TextInput
					required
					type='text'
					label='Business URL'
					description='If you do not have a website, please enter a short description of your business'
					{...form.getInputProps('business_url')}
					data-cy="onboarding-business-url"
				/>
				<Space h="xs"/>
				<Group position='right'>
					<Button
						type='submit'
						variant='filled'
						size='md'
						style={{
							width: 200
						}}
						loading={loading}
					>
						Continue
					</Button>
				</Group>
			</Stack>
		</form>
	);
};

export default NewStep1;
