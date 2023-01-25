import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { Button, CloseButton, Group, Paper, Stack, Text, Space } from '@mantine/core';
import { IconX } from '@tabler/icons';
import { STORAGE_KEYS } from '../../utils/constants';
import { useLocalStorage } from '@mantine/hooks';
import {
	NewOnboardingAccountStep3,
	NewOnboardingBusinessInfo,
	notifyError, NewOnboardingOwnersInfo, NewOnboardingDirectorsInfo
} from '@trok-app/shared-utils';
import { apiClient } from '../../utils/clients';
import BusinessMemberForm from '../../modals/BusinessMemberForm';

const NewStep4 = ({ prevStep, nextStep }) => {
	const [loading, setLoading] = useState(false);
	const [newDirectorForm, showNewDirectorForm] = useState(false);
	const [account, setAccount] = useLocalStorage<NewOnboardingAccountStep3>({
		key: STORAGE_KEYS.ACCOUNT,
		defaultValue: null
	});
	const [business, setBusiness] = useLocalStorage<NewOnboardingBusinessInfo>({
		key: STORAGE_KEYS.COMPANY_FORM,
		defaultValue: null
	});
	const [directors, setDirectors] = useLocalStorage<NewOnboardingDirectorsInfo[]>({
		key: STORAGE_KEYS.DIRECTORS_FORM,
		defaultValue: []
	});

	const form = useForm<Record<'directors', NewOnboardingDirectorsInfo[]>>({
		initialValues: {
			directors
		}
	});
	const handleSubmit = useCallback(
		async (values: Record<'directors', NewOnboardingDirectorsInfo[]>) => {
			setLoading(true);
			try {
				const result = (
					await apiClient.post('/server/auth/onboarding', values, {
						params: {
							email: account?.email,
							step: 4
						}
					})
				).data;
				console.log('-----------------------------------------------');
				console.log(result);
				console.log('-----------------------------------------------');
				setAccount({ ...account, business: { ...account.business }, ...values });
				setLoading(false);
				nextStep();
			} catch (err) {
				setLoading(false);
				console.error(err);
				notifyError('onboarding-step1-failure', err?.error?.message ?? err.message, <IconX size={20} />);
			}
		},
		[account, business, nextStep, setAccount]
	);

	useEffect(() => {
		const storedValue = window.localStorage.getItem(STORAGE_KEYS.DIRECTORS_FORM);
		if (storedValue) {
			try {
				form.setFieldValue("directors", JSON.parse(window.localStorage.getItem(STORAGE_KEYS.DIRECTORS_FORM)));
			} catch (e) {
				console.log('Failed to parse stored value');
				console.error(e);
			}
		}
	}, []);

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEYS.DIRECTORS_FORM, JSON.stringify(form.values.directors));
	}, [form.values]);

	const addNewDirector = useCallback((values: NewOnboardingDirectorsInfo) => {
        values.full_name = `${values.firstname} ${values.lastname}`
		form.insertListItem('directors', values);
		showNewDirectorForm(false);
	}, [form]);

	const fields = form.values.directors.map((director, index) => {
		return (
			<Paper key={index} p='md' withBorder className='bg-slate-50'>
				<Group position='apart' align='start'>
					<Stack spacing={0}>
						<span className='text-lg font-medium'>{director.full_name}</span>
						<span className='text-sm text-gray-500'>{director.email}</span>
					</Stack>
					<CloseButton aria-label='Close modal' onClick={() => form.removeListItem('directors', index)} sx={{
						display: (!index && account?.representative?.is_director) && "none",
					}}/>
				</Group>
			</Paper>
		)
	});

	return (
		<>
			<BusinessMemberForm
				opened={newDirectorForm}
				onClose={() => showNewDirectorForm(false)}
				onSubmit={addNewDirector}
				loading={loading}
			/>
			<form
				onSubmit={form.onSubmit(handleSubmit)}
				className='flex h-full w-full flex-col'
				data-cy='onboarding-finance-form'
			>
				<h1 className='mb-4 text-2xl font-medium'>Add Business Directors</h1>
				<Text color='dimmed' size='sm'>
					Please list all individuals who are members of the governing board of{' '}
					{account?.business?.legal_name}
				</Text>
				<Space h='md' />
				<Stack>
					{fields}
					<Button variant='outline' size='lg' onClick={() => showNewDirectorForm(true)}>
						<Text>+ Add {form.values.directors.length ? 'another' : 'a'} director</Text>
					</Button>
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
		</>
	);
};

export default NewStep4;
