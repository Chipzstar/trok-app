import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { Button, FileButton, Group, NumberInput, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconCurrencyPound } from '@tabler/icons';
import { useLocalStorage } from '@mantine/hooks';
import { STORAGE_KEYS } from '../../utils/constants';

const Step1 = ({ nextStep }) => {
	const [files, setFiles] = useState<File>(null);
	const [companyForm, setCompanyForm] = useLocalStorage({
		key: STORAGE_KEYS.COMPANY_FORM,
		defaultValue: {
			legal_name: '',
			weekly_fuel_spend: '',
			business_type: '',
			industry_type: '',
			business_crn: '',
			business_url: '',
			num_vehicles: null
		}
	});

	const form = useForm({
		initialValues: {
			...companyForm
		},
		validate: {
			weekly_fuel_spend: val => (Number(val) <= 0 ? 'Value must be at least £100' : null),
			num_vehicles: val => (Number(val) <= 0 ? 'You must have at least 1 vehicle' : null)
		}
	});

	const handleSubmit = useCallback(values => {
		console.log(values);
		nextStep();
	}, []);

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
						{...form.getInputProps('business_type')}
						data={['LLC', 'Private Company', 'Public Company', 'Non Profit Organization', 'LLP', 'Other']}
					/>
					<Select
						required
						label='Type of industry'
						{...form.getInputProps('industry_type')}
						data={[
							'Transportation - Other',
							'Transportation - Motor Freight, Carriers & Trucking',
							'Other'
						]}
					/>
				</Group>
				<Group grow>
					<TextInput
						type='number'
						minLength={8}
						maxLength={8}
						required
						label='Company Reg No.'
						{...form.getInputProps('crn')}
					/>
					<NumberInput
						label='Number of Vehicles'
						min={1}
						max={100}
						required
						{...form.getInputProps('num_vehicles')}
					/>
				</Group>
				<TextInput type='text' label='Business URL' {...form.getInputProps('url')} />
				<div>
					<Text size='md'>{"Upload front of Driver's License"}</Text>
					<FileButton onChange={setFiles} accept='image/png,image/jpeg'>
						{props => (
							<Button variant='outline' fullWidth {...props}>
								Upload picture
							</Button>
						)}
					</FileButton>
				</div>
				{/*<Dropzone
					onDrop={(files) => console.log('accepted files', files)}
					onReject={(files) => console.log('rejected files', files)}
					maxSize={3 * 1024 ** 2}
					accept={[MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.pdf]}
				>
					<Group position='center' spacing='xl' style={{ minHeight: 80, pointerEvents: 'none' }}>
						<Dropzone.Accept>
							<IconUpload
								size={50}
								stroke={1.5}
							/>
						</Dropzone.Accept>
						<Dropzone.Reject>
							<IconX
								size={50}
								stroke={1.5}
							/>
						</Dropzone.Reject>
						<Dropzone.Idle>
							<IconPhoto size={30} stroke={1.5} />
						</Dropzone.Idle>

						<div>
							<Text size='xl' inline>
								Upload picture
							</Text>
						</div>
					</Group>
				</Dropzone>*/}
				<Group position='right'>
					<Button
						type='submit'
						variant='filled'
						size='md'
						style={{
							width: 200
						}}
					>
						Continue
					</Button>
				</Group>
			</Stack>
		</form>
	);
};

export default Step1;
