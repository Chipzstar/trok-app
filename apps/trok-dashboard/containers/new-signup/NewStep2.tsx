import React, { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../../utils/constants';
import {
	NewOnboardingAccountStep2, NewOnboardingRepresentativeInfo,
	notifyError,
    NewOnboardingOwnersInfo
} from '@trok-app/shared-utils';
import { useLocalStorage } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { apiClient } from '../../utils/clients';
import { IconX } from '@tabler/icons';
import { Button, Text, Group, Stack, TextInput, Anchor, Checkbox } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import dayjs from 'dayjs';
import { validateDirectorInfo } from '../../utils/functions';

const NewStep2 = ({ prevStep, nextStep }) => {
	const [loading, setLoading] = useState(false);
	const [account, setAccount] = useLocalStorage<NewOnboardingAccountStep2>({
		key: STORAGE_KEYS.ACCOUNT,
		defaultValue: null
	});
	const [griffin, setGriffin] = useLocalStorage<{legal_person_url: string | null}>({
		key: STORAGE_KEYS.GRIFFIN,
		defaultValue: null
	});
	const [representative, setRepresentative] = useLocalStorage<NewOnboardingRepresentativeInfo>({
		key: STORAGE_KEYS.REPRESENTATIVE_FORM,
		defaultValue: {
			firstname: '',
			lastname: '',
			email: '',
			dob: '',
			line1: '',
			city: '',
			postcode: '',
			region: '',
			country: 'GB',
			is_owner: false,
			is_director: false
		}
	});
    const [owners, setOwners] = useLocalStorage<NewOnboardingOwnersInfo[]>({
        key: STORAGE_KEYS.OWNERS_FORM,
        defaultValue: []
    });
	const form = useForm<NewOnboardingRepresentativeInfo>({
		initialValues: {
			...representative,
			firstname: account?.firstname ?? '',
			lastname: account?.lastname ?? '',
			email: account?.email ?? '',
		},
		validate: {
			dob: (value) => !value ? "Required" : null
		}
	});
	const handleSubmit = useCallback(
		async (values: NewOnboardingRepresentativeInfo) => {
            console.log(values);
			setLoading(true);
			try {
				const { is_valid, reason } = await validateDirectorInfo(values);
				if (!is_valid) throw new Error(reason);
				setGriffin({legal_person_url: reason});
                // check if the rep is an owner
                if (values.is_owner) {
                    setOwners([{
                        dob: values.dob,
                        email: values.email,
                        firstname: values.firstname,
                        lastname: values.lastname,
                        full_name: `${values.firstname} ${values.lastname}`
                    }])
                }
				values.dob = dayjs(values.dob).format("DD-MM-YYYY")
				const result = (
					await apiClient.post('/server/auth/onboarding', values, {
						params: {
							email: account?.email,
							step: 3
						}
					})
				).data;
				setAccount({ ...account, representative: { ...account.representative, ...values } });
				setLoading(false);
				nextStep();
			} catch (err) {
				setLoading(false);
				console.error(err);
				notifyError('onboarding-step1-failure', err?.error?.message ?? err.message, <IconX size={20} />);
			}
		},
		[account, representative, nextStep, setAccount]
	);

	useEffect(() => {
		const storedValue = window.localStorage.getItem(STORAGE_KEYS.REPRESENTATIVE_FORM);
		if (storedValue) {
			try {
				form.setValues(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.REPRESENTATIVE_FORM)));
			} catch (e) {
				console.log('Failed to parse stored value');
				console.error(e);
			}
		}
	}, []);

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEYS.REPRESENTATIVE_FORM, JSON.stringify(form.values));
	}, [form.values]);

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className='flex h-full w-full flex-col' data-cy="onboarding-director-form">
			<h1 className='mb-4 text-2xl font-medium'>Legal Representative</h1>
			<Stack>
				<Group grow>
					<TextInput required label='First name' {...form.getInputProps('firstname')} data-cy="onboarding-director-firstname"/>
					<TextInput required label='Last name' {...form.getInputProps('lastname')} data-cy="onboarding-director-lastname"/>
				</Group>
				<Group grow>
					<TextInput required label='Email' {...form.getInputProps('email')} data-cy="onboarding-director-email"/>
					<DatePicker
						required
						placeholder={'Pick a date'}
						label='Date of Birth'
						maxDate={dayjs().subtract(13, "years").toDate()}
						inputFormat='DD-MM-YYYY'
						value={dayjs(form.values.dob).isValid() ? dayjs(form.values.dob).toDate() : null}
						onChange={date => form.setFieldValue('dob', date)}
						error={form.errors.dob}
						initialLevel="year"
						data-cy="onboarding-director-dob"
					/>
				</Group>
				<Group grow>
					<TextInput required label='Address line 1' {...form.getInputProps('line1')} data-cy="onboarding-director-line1"/>
					<TextInput label='Address line 2' {...form.getInputProps('line2')} data-cy="onboarding-director-line2"/>
				</Group>
				<Group grow>
					<TextInput required label='City' {...form.getInputProps('city')} data-cy="onboarding-director-city"/>
					<TextInput required label='Postal Code' {...form.getInputProps('postcode')} data-cy="onboarding-director-postcode"/>
				</Group>
				<Group grow>
					<TextInput required label='County / Region' {...form.getInputProps('region')} data-cy="onboarding-director-region"/>
					<TextInput readOnly label='Country' {...form.getInputProps('country')} />
				</Group>
				<Checkbox
					data-cy="onboarding-representative-is-owner"
					label="I own 25% or more of the company"
					checked={form.values.is_owner}
					size='sm'
					{...form.getInputProps('is_owner', { type: 'checkbox', withError: true })}
				/>
				<Checkbox
					data-cy="onboarding-representative-is-director"
					label="I am a member of the company's governing body"
					checked={form.values.is_director}
					size='sm'
					{...form.getInputProps('is_director', { type: 'checkbox', withError: true })}
				/>
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

export default NewStep2;
