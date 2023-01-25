import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { Button, CloseButton, Group, Paper, Stack, Text, Space } from '@mantine/core';
import { IconX } from '@tabler/icons';
import { STORAGE_KEYS } from '../../utils/constants';
import { useLocalStorage } from '@mantine/hooks';
import {
	NewOnboardingAccountStep3,
	NewOnboardingBusinessInfo,
	notifyError, NewOnboardingOwnersInfo
} from '@trok-app/shared-utils';
import { apiClient } from '../../utils/clients';
import BusinessMemberForm from '../../modals/BusinessMemberForm';

const NewStep3 = ({ prevStep, nextStep }) => {
	const [loading, setLoading] = useState(false);
	const [newOwnerForm, showNewOwnerForm] = useState(false);
	const [account, setAccount] = useLocalStorage<NewOnboardingAccountStep3>({
		key: STORAGE_KEYS.ACCOUNT,
		defaultValue: null
	});
	const [business, setBusiness] = useLocalStorage<NewOnboardingBusinessInfo>({
		key: STORAGE_KEYS.COMPANY_FORM,
		defaultValue: null
	});
	const [owners, setOwners] = useLocalStorage<NewOnboardingOwnersInfo[]>({
		key: STORAGE_KEYS.OWNERS_FORM,
		defaultValue: []
	});

	const form = useForm<Record<'owners', NewOnboardingOwnersInfo[]>>({
		initialValues: {
			owners
		}
	});
	const handleSubmit = useCallback(
		async (values: Record<'owners', NewOnboardingOwnersInfo[]>) => {
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
		const storedValue = window.localStorage.getItem(STORAGE_KEYS.OWNERS_FORM);
		if (storedValue) {
			try {
				form.setFieldValue("owners", JSON.parse(window.localStorage.getItem(STORAGE_KEYS.OWNERS_FORM)));
			} catch (e) {
				console.log('Failed to parse stored value');
				console.error(e);
			}
		}
	}, []);

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEYS.OWNERS_FORM, JSON.stringify(form.values.owners));
	}, [form.values]);

	const addNewOwner = useCallback((values: NewOnboardingOwnersInfo) => {
        values.full_name = `${values.firstname} ${values.lastname}`
		form.insertListItem('owners', values);
		showNewOwnerForm(false);
	}, [form]);

	const fields = form.values.owners.map((owner, index) => {
		return (
			<Paper key={index} p='md' withBorder className='bg-slate-50'>
				<Group position='apart' align='start'>
					<Stack spacing={0}>
						<span className='text-lg font-medium'>{owner.full_name}</span>
						<span className='text-sm text-gray-500'>{owner.email}</span>
					</Stack>
					<CloseButton aria-label='Close modal' onClick={() => form.removeListItem('owners', index)} sx={{
						display: (!index && account?.representative?.is_owner) && "none",
					}}/>
				</Group>
			</Paper>
		)
	});

	return (
		<>
			<BusinessMemberForm
				opened={newOwnerForm}
				onClose={() => showNewOwnerForm(false)}
				onSubmit={addNewOwner}
				loading={loading}
			/>
			<form
				onSubmit={form.onSubmit(handleSubmit)}
				className='flex h-full w-full flex-col'
				data-cy='onboarding-finance-form'
			>
				<h1 className='mb-4 text-2xl font-medium'>Add Beneficial Owners</h1>
				<Text color='dimmed' size='sm'>Please add any individual who owns 25% or more
					of {account?.business?.legal_name}</Text>
				<Space h='md' />
				<Stack>
					{fields}
					<Button
						variant='outline'
						size='lg'
						onClick={() => showNewOwnerForm(true)}
					>
						<Text>+ Add {form.values.owners.length ? 'another' : 'a'} owner</Text>
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

export default NewStep3;
