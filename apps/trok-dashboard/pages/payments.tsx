import React, { useCallback, useEffect, useState } from 'react';
import Page from '../layout/Page';
import { Button, TextInput } from '@mantine/core';
import { IconCalendar, IconCheck, IconSearch, IconX } from '@tabler/icons';
import PaymentsTable from '../containers/PaymentsTable';
import { SAMPLE_PAYMENTS } from '../utils/constants';
import { DateRangePicker, DateRangePickerValue } from '@mantine/dates';
import dayjs from 'dayjs';
import PaymentDetails from '../modals/PaymentDetails';
import { useForm } from '@mantine/form';
import { PlaidLinkOnSuccess, PlaidLinkOnSuccessMetadata, usePlaidLink } from 'react-plaid-link';
import { apiClient, trpc } from '../utils/clients';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { GBP, notifyError, notifySuccess } from '@trok-app/shared-utils';
import PaymentForm from '../components/forms/PaymentForm';
import { useDebouncedState } from '@mantine/hooks';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

const Payments = ({ testMode, session_id, stripe_account_id }) => {
	const [opened, setOpened] = useState(false);
	const [loading, setLoading] = useState(false);
	const [linkToken, setLinkToken] = useState(null);
	const [paymentOpened, setPaymentOpened] = useState(false);
	const [range, setRange] = useState<DateRangePickerValue>([dayjs().startOf("week").toDate(), dayjs().endOf("week").toDate()]);
	const [selectedPayment, setSelectedPayment] = useState(null);
	const [section, setSection] = useState<'topup' | 'account'>('topup');
	const [search, setSearch] = useDebouncedState('', 250);
	const utils = trpc.useContext();
	const query = trpc.getPayments.useQuery({ userId: session_id });
	const topUpMutation = trpc.topUpBalance.useMutation({
		onSuccess(input) {
			utils.getPayments.invalidate({ userId: session_id });
		}
	});
	const payAccountMutation = trpc.payExternalAccount.useMutation({
		onSuccess(input) {
			utils.getPayments.invalidate({ userId: session_id });
		}
	});

	const onSuccess = useCallback<PlaidLinkOnSuccess>((public_token: string, metadata: PlaidLinkOnSuccessMetadata) => {
		// log and save metadata
		// exchange public token
		apiClient
			.post('/server/plaid/set_access_token', {
				public_token
			})
			.then(({ data }) => {
				console.log(data);
			})
			.catch(err => console.error(err));
	}, []);

	const config: Parameters<typeof usePlaidLink>[0] = {
		env: String(process.env.NEXT_PUBLIC_PLAID_ENVIRONMENT),
		clientName: String(process.env.NEXT_PUBLIC_PLAID_CLIENT_NAME),
		token: linkToken,
		onSuccess,
		onLoad: () => console.log('loading...')
	};

	const { open, ready } = usePlaidLink(config);
	const data = testMode
		? SAMPLE_PAYMENTS
		: !query?.isLoading
		? query?.data?.filter(
				p =>
					dayjs(p.created_at).isBetween(dayjs(range[0]), dayjs(range[1]).endOf('d'), 'h') &&
					(p.recipient_name.contains(search) ||
						p.payment_type.contains(search) ||
						GBP(p.amount).format().contains(search) ||
						p.reference.contains(search))
		  )
		: [];

	const form = useForm({
		initialValues: {
			account_holder_name: '',
			account_number: '',
			sort_code: '',
			amount: 0,
			reference: ''
		},
		validate: {
			reference: val =>
				val.search(/[^a-zA-Z0-9 ]/g) !== -1 ? 'Reference must not contain special characters' : null
		}
	});

	const handleSubmit = async values => {
		setLoading(true);
		try {
			let token;
			if (section === 'topup') {
				token = await topUpMutation.mutateAsync({
					user_id: String(session_id),
					stripe_account_id: stripe_account_id,
					amount: values.amount,
					reference: values.reference
				});
			} else {
				token = await payAccountMutation.mutateAsync({
					user_id: String(session_id),
					account_holder_name: values.account_holder_name,
					account_number: values.account_number,
					amount: values.amount,
					sort_code: values.sort_code,
					reference: values.reference
				});
			}
			setLinkToken(token.link_token);
			setLoading(false);
			setPaymentOpened(false);
			notifySuccess('plaid-payment-success', 'Starting Plaid session...', <IconCheck size={20} />);
		} catch (err) {
			console.error(err);
			setLoading(false);
			notifyError('plaid-payment-failed', err?.error?.message ?? err.message, <IconX size={20} />);
		}
	};

	useEffect(() => {
		ready && open();
	}, [ready]);

	return (
		<Page.Container
			header={
				<Page.Header>
					<span className='text-2xl font-medium'>Payments</span>
					<Button className='' onClick={() => setPaymentOpened(true)}>
						<span className='text-base font-normal'>Send Payment</span>
					</Button>
				</Page.Header>
			}
		>
			<PaymentDetails opened={opened} setOpened={setOpened} payment={selectedPayment} />
			<PaymentForm
				opened={paymentOpened}
				onClose={() => setPaymentOpened(false)}
				form={form}
				onSubmit={handleSubmit}
				loading={loading}
				section={section}
				setSection={setSection}
			/>
			<Page.Body>
				<div className='flex items-center justify-between'>
					<TextInput
						defaultValue={search}
						className='w-96'
						size='sm'
						radius={0}
						icon={<IconSearch size={18} />}
						onChange={e => setSearch(e.currentTarget.value)}
						placeholder='Search'
					/>
					<DateRangePicker
						icon={<IconCalendar size={18} />}
						fullWidth
						size='sm'
						radius={0}
						className='w-80'
						label='Viewing payments between:'
						placeholder='Pick dates range'
						value={range}
						inputFormat='DD/MM/YYYY'
						labelSeparator=' → '
						labelFormat='MMM YYYY'
						onChange={setRange}
					/>
				</div>
				<PaymentsTable data={data} setOpened={setOpened} selectPayment={setSelectedPayment} />
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

export default Payments;
