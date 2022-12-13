import React, { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../../utils/constants';
import {
	notifyError,
	OnboardingAccountStep2,
	OnboardingDirectorInfo
} from '@trok-app/shared-utils';
import { useLocalStorage } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { apiClient } from '../../utils/clients';
import { IconX } from '@tabler/icons';
import { Button, Text, Group, Stack, TextInput } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import dayjs from 'dayjs';
import { validateDirectorInfo } from '../../utils/functions';

const Step2 = ({ prevStep, nextStep }) => {
	const [loading, setLoading] = useState(false);
	const [account, setAccount] = useLocalStorage<OnboardingAccountStep2>({
		key: STORAGE_KEYS.ACCOUNT,
		defaultValue: null
	});
	const [griffin, setGriffin] = useLocalStorage<{legal_person_url: string | null}>({
		key: STORAGE_KEYS.GRIFFIN,
		defaultValue: null
	});
	const [director, setDirector] = useLocalStorage<OnboardingDirectorInfo>({
		key: STORAGE_KEYS.DIRECTORS_FORM,
		defaultValue: {
			firstname: '',
			lastname: '',
			email: '',
			dob: '',
			line1: '',
			city: '',
			postcode: '',
			region: '',
			country: 'GB'
		}
	});
	const form = useForm<OnboardingDirectorInfo>({
		initialValues: {
			...director,
			firstname: account?.firstname ?? '',
			lastname: account?.lastname ?? '',
			email: account?.email ?? ''
		},
		validate: {
			dob: (value) => !value ? "Required" : null
		}
	});
	const handleSubmit = useCallback(
		async (values:OnboardingDirectorInfo) => {
			setLoading(true);
			try {
				const { is_valid, reason } = await validateDirectorInfo(values);
				if (!is_valid) throw new Error(reason);
				setGriffin({legal_person_url: reason})
				values.dob = dayjs(values.dob).format("DD-MM-YYYY")
				console.log(values.dob)
				const result = (
					await apiClient.post('/server/auth/onboarding', values, {
						params: {
							email: account?.email,
							step: 3
						}
					})
				).data;
				console.log('-----------------------------------------------');
				console.log(result);
				console.log('-----------------------------------------------');
				setAccount({ ...account, director: { ...account.director, ...values } });
				setLoading(false);
				nextStep();
			} catch (err) {
				setLoading(false);
				console.error(err);
				notifyError('onboarding-step1-failure', err?.error?.message ?? err.message, <IconX size={20} />);
			}
		},
		[account, director, nextStep, setAccount]
	);
	useEffect(() => {
		const storedValue = window.localStorage.getItem(STORAGE_KEYS.DIRECTORS_FORM);
		if (storedValue) {
			try {
				form.setValues(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.DIRECTORS_FORM)));
			} catch (e) {
				console.log('Failed to parse stored value');
				console.error(e);
			}
		}
	}, []);

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEYS.DIRECTORS_FORM, JSON.stringify(form.values));
	}, [form.values]);

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className='flex h-full w-full flex-col' data-cy="onboarding-director-form">
			<h1 className='mb-4 text-2xl font-medium'>Add Director</h1>
			<Stack>
				<Group grow>
					<TextInput required label='First name' {...form.getInputProps('firstname')} data-cy="onboarding-firstname"/>
					<TextInput required label='Last name' {...form.getInputProps('lastname')} data-cy="onboarding-lastname"/>
				</Group>
				<Group grow>
					<TextInput required label='Email' {...form.getInputProps('email')} data-cy="onboarding-email"/>
					<DatePicker
						required
						placeholder={'Pick a date'}
						label='Date of Birth'
						maxDate={dayjs().subtract(13, "years").toDate()}
						inputFormat='DD-MM-YYYY'
						value={dayjs(form.values.dob).isValid() ? dayjs(form.values.dob).toDate() : null}
						onChange={date => form.setFieldValue('dob', date)}
						error={form.errors.dob}
					/>
				</Group>
				<Group grow>
					<TextInput required label='Address line 1' {...form.getInputProps('line1')} data-cy="onboarding-line1"/>
					<TextInput label='Address line 2' {...form.getInputProps('line2')} data-cy="onboarding-line2"/>
				</Group>
				<Group grow>
					<TextInput required label='City' {...form.getInputProps('city')} data-cy="onboarding-city"/>
					<TextInput required label='Postal Code' {...form.getInputProps('postcode')} data-cy="onboarding-postcode"/>
				</Group>
				<Group grow>
					<TextInput required label='County / Region' {...form.getInputProps('region')} data-cy="onboarding-region"/>
					<TextInput readOnly label='Country' {...form.getInputProps('country')} />
				</Group>
				<Group mt='md' position='apart'>
					<Button type='button' variant='white' size='md' onClick={prevStep}>
						<Text weight='normal'>Go Back</Text>
					</Button>
					<Button
						type='submit'
						variant='filled'
						size='md'
						style={{
							width: 200
						}}
						loading={loading}
					>
						<Text weight='normal'>Continue</Text>
					</Button>
				</Group>
			</Stack>
		</form>
	);
};

export default Step2;
