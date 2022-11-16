import {
	ActionIcon,
	Badge,
	Button,
	Checkbox,
	Drawer,
	Group,
	Select,
	Stack,
	Text,
	TextInput,
	Title
} from '@mantine/core';
import React, { useCallback, useState } from 'react';
import Page from '../layout/Page';
import { SAMPLE_BANK_ACCOUNTS } from '../utils/constants';
import BankAccountsTable from '../containers/BankAccountsTable';
import { useForm } from '@mantine/form';
import SortCodeInput from '../components/SortCodeInput';
import { IconCheck, IconX } from '@tabler/icons';
import { trpc } from '../utils/clients';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { notifyError, notifySuccess, PLAID_INSTITUTIONS } from '@trok-app/shared-utils';

const formatAccNumber = (accNumber: string): string => (accNumber ? '****' + accNumber : undefined);

const formatCode = codeText => {
	return codeText
		.replace(' ', '')
		.replace('-', '')
		.match(/.{1,2}/g)
		.join('-');
};

const PaymentMethod = ({ testMode, session_id, stripe_account_id }) => {
	const [loading, setLoading] = useState(false);
	const [opened, setOpened] = useState(false);
	const utils = trpc.useContext();
	const query = trpc.getBankAccounts.useQuery({ userId: session_id });
	const mutation = trpc.addBankAccount.useMutation({
		onSuccess: function (input) {
			utils.invalidate({ userId: session_id }).then(r => console.log(input, 'Bank Accounts refetched'));
		}
	});

	const data = testMode
		? SAMPLE_BANK_ACCOUNTS
		: !query.isLoading
		? query?.data : [];

	const form = useForm({
		initialValues: {
			account_holder_name: '',
			account_number: '',
			sort_code: '',
			institution_id: '',
			is_default: Boolean(!query?.data?.length)
		},
		validate: {
			institution_id: val => !val ? "Please select your bank's institution" : null
		}
	});

	const handleSubmit = useCallback(async values => {
		setLoading(true);
		console.log(values);
		try {
			await mutation.mutateAsync({
				userId: session_id,
				stripeId: stripe_account_id,
				account_holder_name: values.account_holder_name,
				account_number: values.account_number,
				sort_code: values.sort_code,
				institution_id: values.institution_id,
				is_default: values.is_default,
				currency: 'gbp',
				country: 'GB'
			});
			setLoading(false);
			setOpened(false);
			notifySuccess('add-bank-account-success', `New Bank Account added successfully!`, <IconCheck size={20} />);
		} catch (err) {
			console.error(err);
			setLoading(false);
			notifyError('add-bank-account-failed', err?.error?.message ?? err.message, <IconX size={20} />);
		}
	}, []);

	return (
		<Page.Container
			header={
				<Page.Header extraClassNames='mb-3'>
					<span className='text-2xl font-medium capitalize'>Payment Method</span>
					<Button className='' onClick={() => setOpened(true)}>
						<span className='text-base font-normal'>Add Bank Account</span>
					</Button>
				</Page.Header>
			}
		>
			<Drawer
				opened={opened}
				onClose={() => setOpened(false)}
				padding='xl'
				size='xl'
				position='right'
				classNames={{
					drawer: 'flex h-full'
				}}
			>
				<Stack justify='center'>
					<Title order={2} weight={500}>
						<span>Add new bank account</span>
					</Title>
					<form onSubmit={form.onSubmit(handleSubmit)} className='flex flex-col space-y-4'>
						<TextInput
							required
							label='Business Account Name'
							{...form.getInputProps('account_holder_name')}
						/>
						<Group grow spacing='xl'>
							<TextInput
								type='number'
								required
								label='Account Number'
								{...form.getInputProps('account_number')}
								minLength={8}
							/>
							<SortCodeInput
								onChange={event => {
									console.log(event.currentTarget.value);
									form.setFieldValue('sort_code', event.currentTarget.value);
								}}
								value={form.values.sort_code}
								required
							/>
						</Group>
						<Select
							required
							label='Institution'
							data={process.env.NEXT_PUBLIC_ENVIRONMENT === "production" ? PLAID_INSTITUTIONS : PLAID_INSTITUTIONS.concat({
								label: 'STRIPE TEST BANK',
                                value: "ins_117181",
							})}
							{...form.getInputProps('institution_id')}
						/>
						{Boolean(query?.data?.length) && (
							<Group py='xs'>
								<Checkbox
									size='sm'
									label='Set as default'
									{...form.getInputProps('is_default', { type: 'checkbox' })}
								/>
							</Group>
						)}
						<Group py='xl' position='right'>
							<Button type='submit' loading={loading}>
								<Text weight={500}>Add bank account</Text>
							</Button>
						</Group>
					</form>
				</Stack>
			</Drawer>
			<Page.Body>
				<BankAccountsTable data={data} />
			</Page.Body>
		</Page.Container>
	);
};

export const getServerSideProps = async ({ req, res }) => {
	// @ts-ignore
	const session = await unstable_getServerSession(req, res, authOptions);
	return {
		props: {
			session_id: session.id,
			stripe_account_id: session?.stripe.account_id
		}
	};
};

export default PaymentMethod;
