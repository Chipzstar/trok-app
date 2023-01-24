import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { Button, Center, FileButton, Group, NumberInput, Select, Stack, Text, TextInput, Tooltip } from '@mantine/core';
import { IconCurrencyPound, IconInfoCircle, IconX } from '@tabler/icons';
import { useLocalStorage } from '@mantine/hooks';
import { INDUSTRY_TYPES, STORAGE_KEYS } from '../../utils/constants';
import { notifyError, OnboardingAccountStep1, OnboardingBusinessInfo } from '@trok-app/shared-utils';
import { apiClient } from '../../utils/clients';
import { uploadFile, validateCompanyInfo } from '../../utils/functions';
import DocumentInfo from '../../components/DocumentInfo';

const Step1 = ({ nextStep }) => {
	const [loading, setLoading] = useState(false);
	const [file, setFile] = useState<File>(null);
	const [account, setAccount] = useLocalStorage<Partial<OnboardingAccountStep1>>({
		key: STORAGE_KEYS.ACCOUNT,
		defaultValue: null
	});
	const [companyForm, setCompanyForm] = useLocalStorage<OnboardingBusinessInfo>({
		key: STORAGE_KEYS.COMPANY_FORM,
		defaultValue: {
			legal_name: '',
			weekly_fuel_spend: null,
			business_type: null,
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
			business_crn: val =>
				val.length > 8 || val.length < 7 ? 'Company registration number must be 7-8 digits' : null,
			business_type: val => (!val ? 'Required' : null),
			merchant_category_code: val => (!val ? 'Required' : null),
			weekly_fuel_spend: val => (Number(val) <= 0 ? 'Value must be at least £100' : null),
			num_vehicles: val => (Number(val) <= 0 ? 'You must have at least 1 vehicle' : null)
		}
	});

	const handleSubmit = useCallback(
		async (values: OnboardingBusinessInfo) => {
			setLoading(true);
			try {
				const { is_valid, reason } = await validateCompanyInfo(values.business_crn, values.legal_name);
				if (!is_valid) throw new Error(reason);
				if (!file) throw new Error("Please upload a picture of your driver's license before submitting");
				const filename = encodeURIComponent(file.name);
				const filepath = `${values.business_crn}/DRIVING_LICENCE/${filename}`;
				await uploadFile(file, filename, filepath);
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
		[account, file, nextStep, setAccount]
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
		<form
			onSubmit={form.onSubmit(handleSubmit)}
			className='flex h-full w-full flex-col'
			data-cy='onboarding-company-form'
		>
			<h1 className='mb-4 text-2xl font-medium'>Your company</h1>
			<Stack>
				<TextInput
					required
					label='Company legal name'
					{...form.getInputProps('legal_name')}
					data-cy='onboarding-legal-name'
				/>
				<NumberInput
					type='number'
					min={100}
					max={999999}
					step={100}
					required
					label='Weekly fuel and maintenance spend'
					icon={<IconCurrencyPound size={16} />}
					{...form.getInputProps('weekly_fuel_spend')}
					data-cy='onboarding-weekly-fuel-spend'
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
						data-cy='onboarding-business-type'
					/>
					<Select
						required
						label='Type of industry'
						data={INDUSTRY_TYPES}
						{...form.getInputProps('merchant_category_code')}
						data-cy='onboarding-merchant-category-code'
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
						data-cy='onboarding-business-crn'
					/>
					<NumberInput
						type='number'
						label='Number of Vehicles'
						min={1}
						max={100}
						required
						{...form.getInputProps('num_vehicles')}
						data-cy='onboarding-num-vehicles'
					/>
				</Group>
				<TextInput
					required
					type='text'
					label='Business URL'
					description='If you do not have a website, please enter a short description of your business'
					{...form.getInputProps('business_url')}
					data-cy='onboarding-business-url'
				/>
				<Stack spacing={5}>
					<Group spacing='xs'>
						<Text size='md'>
							Upload front of Driver's License
							<span className='text-danger'>*</span>
						</Text>
						<Tooltip
							color='black'
							label='To confirm that your details match your companies house registration'
							position='right-end'
							transition='fade'
							multiline
							width={220}
							openDelay={300}
						>
							<Text color='dimmed' sx={{ cursor: 'help' }}>
								<Center>
									<IconInfoCircle size={18} stroke={1.5} />
								</Center>
							</Text>
						</Tooltip>
					</Group>
					<FileButton onChange={setFile} accept='image/png,image/jpeg' data-cy='onboarding-driving-license'>
						{props => (
							<Button variant='outline' fullWidth {...props}>
								Upload picture
							</Button>
						)}
					</FileButton>
					{file && <DocumentInfo fileInfo={file} />}
				</Stack>
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

export default Step1;
