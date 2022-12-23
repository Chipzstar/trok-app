import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { Button, Group, NumberInput, Stack, Text } from '@mantine/core';
import { IconCheck, IconCurrencyPound, IconInfoCircle, IconX } from '@tabler/icons';
import { isProd, STORAGE_KEYS } from '../../utils/constants';
import { useLocalStorage } from '@mantine/hooks';
import { notifyError, notifyInfo, OnboardingAccountStep3, OnboardingBusinessInfo } from '@trok-app/shared-utils';
import { apiClient, trpc } from '../../utils/clients';
import {
	PlaidLinkOnExit,
	PlaidLinkOnExitMetadata,
	PlaidLinkOnSuccess,
	PlaidLinkOnSuccessMetadata,
	usePlaidLink
} from 'react-plaid-link';

const Step3 = ({ prevStep, nextStep }) => {
	const [link_token, setLinkToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [link_loading, setLinkLoading] = useState(false);
	const [account, setAccount] = useLocalStorage<OnboardingAccountStep3>({
		key: STORAGE_KEYS.ACCOUNT,
		defaultValue: null
	});
	const [business, setBusiness] = useLocalStorage<OnboardingBusinessInfo>({
		key: STORAGE_KEYS.COMPANY_FORM,
		defaultValue: null
	});
	const [financialForm, setFinancialForm] = useLocalStorage({
		key: STORAGE_KEYS.FINANCIAL_FORM,
		defaultValue: {
			average_monthly_revenue: null
		}
	});
	const utils = trpc.useContext();
	const linkSessionMutation = trpc.linkBusinessBankAccount.useMutation();
	const { data: plaid_access_token } = trpc.checkAccountLinked.useQuery(account.email, {
		enabled: !!account?.email
	});
	const onSuccess = useCallback<PlaidLinkOnSuccess>(
		(public_token: string, metadata: PlaidLinkOnSuccessMetadata) => {
			// log and save metadata
			// exchange public token
			apiClient
				.post('/server/plaid/set_access_token', {
					email: account?.email,
					public_token
				})
				.then(({ data }) => {
					console.log(data);
					utils.checkAccountLinked.invalidate(account.email);
				})
				.catch(err => console.error(err));
		},
		[account]
	);
	const onExit = useCallback<PlaidLinkOnExit>(async (error, metadata: PlaidLinkOnExitMetadata) => {
		try {
			notifyInfo(
				'link-bank-account-session-cancelled',
				'Plaid session was closed unexpectedly. No bank account has been linked',
				<IconInfoCircle size={20} />
			);
		} catch (err) {
			console.error(err);
		}
	}, []);
	const config: Parameters<typeof usePlaidLink>[0] = {
		env: String(process.env.NEXT_PUBLIC_PLAID_ENVIRONMENT),
		clientName: String(process.env.NEXT_PUBLIC_PLAID_CLIENT_NAME),
		token: link_token,
		onSuccess,
		onExit,
		onLoad: () => console.log('loading...')
	};
	const { open, ready } = usePlaidLink(config);
	const form = useForm({
		initialValues: {
			...financialForm
		}
	});
	const handleSubmit = useCallback(
		async values => {
			setLoading(true);
			try {
				/*if (!isProd && !isAccountLinked?.data?.access_token) {
					throw new Error("Please link your bank account before continuing")
				}*/
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
				setAccount({ ...account, business: { ...account.business, ...values } });
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
		const storedValue = window.localStorage.getItem(STORAGE_KEYS.FINANCIAL_FORM);
		if (storedValue) {
			try {
				form.setValues(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.FINANCIAL_FORM)));
			} catch (e) {
				console.log('Failed to parse stored value');
				console.error(e);
			}
		}
	}, []);

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEYS.FINANCIAL_FORM, JSON.stringify(form.values));
	}, [form.values]);

	useEffect(() => {
		ready && open();
	}, [ready, open, link_token]);

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className='flex h-full w-full flex-col' data-cy="onboarding-finance-form">
			<h1 className='mb-4 text-2xl font-medium'>Your finances</h1>
			<Stack>
				<NumberInput
					required
					label='What is your average monthly revenue?'
					min={100}
					max={1000000}
					step={100}
					icon={<IconCurrencyPound size={16} />}
					{...form.getInputProps('average_monthly_revenue')}
					data-cy="onboarding-average-monthly-revenue"
				/>
				<span>Get the best out of the credit limit by linking your business’s primary bank account</span>
				{!isProd && (
					<div className='flex flex-row flex-col items-center justify-center space-y-4'>
						{plaid_access_token ? (
							<Button
								px='xl'
								leftIcon={<IconCheck size={18} />}
								fullWidth
								loading={link_loading}
								disabled
							>
								<Text weight='normal'>Bank Account Linked</Text>
							</Button>
						) : (
							<Button
								px='xl'
								fullWidth
								loading={link_loading}
								onClick={() => {
									setLinkLoading(true);
									linkSessionMutation
										.mutateAsync(account.email)
										.then(res => {
											setLinkLoading(false);
											setLinkToken(res.link_token);
										})
										.catch(err => {
											setLinkLoading(false);
											console.error(err);
										});
								}}
							>
								<Text weight='normal'>Link Business Bank Account</Text>
							</Button>
						)}
						<Text align='center' size='xs' color='dimmed'>
							Trok uses Plaid for a safe & secure connection
							<br />
							Recommended for instant approval
						</Text>
					</div>
				)}
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

export default Step3;
