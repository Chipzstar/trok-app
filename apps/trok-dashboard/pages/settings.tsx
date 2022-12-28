import React, { useCallback, useState } from 'react';
import Page from '../layout/Page';
import { Button, Tabs } from '@mantine/core';
import Personal from '../containers/settings/Personal';
import Company from '../containers/settings/Company';
import { getToken } from 'next-auth/jwt';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import ChangePassword from '../containers/settings/ChangePassword';
import BankAccountsTable from '../containers/BankAccountsTable';
import { trpc } from '../utils/clients';
import { SAMPLE_BANK_ACCOUNTS } from '../utils/constants';
import BankAccountForm from '../modals/BankAccountForm';
import { notifyError, notifySuccess } from '@trok-app/shared-utils';
import { IconCheck, IconX } from '@tabler/icons';
import { useForm } from '@mantine/form';

const Settings = ({ testMode, user, session_id, stripe }) => {
	const [activeTab, setActiveTab] = useState<string | null>('personal');
	const [loading, setLoading] = useState(false);
	const [bankAccountOpened, setBankAccountOpened] = useState(false);
	const utils = trpc.useContext();
	const query = trpc.getBankAccounts.useQuery({ userId: session_id });
	const mutation = trpc.addBankAccount.useMutation({
		onSuccess: function (input) {
			utils.invalidate({ userId: session_id }).then(r => console.log(input, 'Bank Accounts refetched'));
		}
	});
	const data = testMode ? SAMPLE_BANK_ACCOUNTS : !query.isLoading ? query?.data : [];

	const form = useForm({
		initialValues: {
			account_holder_name: '',
			account_number: '',
			sort_code: '',
			institution_id: '',
			is_default: Boolean(!query?.data?.length)
		},
		validate: {
			institution_id: val => (!val ? "Please select your bank's institution" : null)
		}
	});

	const handleSubmit = useCallback(async values => {
		setLoading(true);
		console.log(values);
		try {
			await mutation.mutateAsync({
				userId: session_id,
				stripeId: stripe.account_id,
				account_holder_name: values.account_holder_name,
				account_number: values.account_number,
				sort_code: values.sort_code,
				institution_id: values.institution_id,
				is_default: values.is_default,
				currency: 'gbp',
				country: 'GB'
			});
			setLoading(false);
			setBankAccountOpened(false);
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
				<Page.Header>
					<span className='heading-1 capitalize'>Settings</span>
					{activeTab === 'financial' && (
						<Button className='' onClick={() => setBankAccountOpened(true)}>
							<span className='text-base font-normal'>Add Bank Account</span>
						</Button>
					)}
				</Page.Header>
			}
		>
			<Page.Body>
				<Tabs
					value={activeTab}
					onTabChange={setActiveTab}
					defaultValue='personal'
					classNames={{
						root: 'flex flex-col grow',
						tabsList: '',
						tab: 'mr-8'
					}}
				>
					<Tabs.List>
						<Tabs.Tab value='personal'>Personal</Tabs.Tab>
						<Tabs.Tab value='financial'>Bank Account</Tabs.Tab>
						<Tabs.Tab value='company'>Company</Tabs.Tab>
						<Tabs.Tab value='password'>Change Password</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel value='personal' pt='xs' className='h-full'>
						<Personal stripe={stripe} account={user} />
					</Tabs.Panel>
					<Tabs.Panel value='financial' pt='xs' className='h-full'>
						<BankAccountForm
							opened={bankAccountOpened}
							onClose={() => setBankAccountOpened(false)}
							form={form}
							onSubmit={handleSubmit}
							loading={loading}
							numBankAccounts={query?.data?.length}
						/>
						<BankAccountsTable loading={!testMode && query.isLoading} data={data} />
					</Tabs.Panel>
					<Tabs.Panel value='company' pt='xs' className='h-full'>
						<Company user_id={session_id} stripe={stripe} business={user?.business} />
					</Tabs.Panel>
					<Tabs.Panel value='password' pt='xs' className='h-full'>
						<ChangePassword user_id={session_id} />
					</Tabs.Panel>
				</Tabs>
			</Page.Body>
		</Page.Container>
	);
};

export async function getServerSideProps({ req, res }) {
	// @ts-ignore
	const session = await unstable_getServerSession(req, res, authOptions);
	const token = await getToken({ req });
	return {
		props: {
			session_id: session.id,
			user: token.user,
			stripe: session?.stripe
		}
	};
}

export default Settings;
