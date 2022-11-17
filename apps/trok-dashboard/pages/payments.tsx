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
import {
	PlaidLinkOnEvent,
	PlaidLinkOnExit,
	PlaidLinkOnExitMetadata,
	PlaidLinkOnSuccess,
	PlaidLinkOnSuccessMetadata,
	usePlaidLink
} from 'react-plaid-link';
import { trpc } from '../utils/clients';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { GBP, notifyError, notifySuccess, PAYMENT_STATUS } from '@trok-app/shared-utils';
import PaymentForm, { PaymentFormValues, SectionState } from '../components/forms/PaymentForm';
import { useDebouncedState } from '@mantine/hooks';
import isBetween from 'dayjs/plugin/isBetween';
import SuccessModal from '../components/SuccessModal';

dayjs.extend(isBetween);

const Payments = ({ testMode, session_id, stripe_account_id }) => {
	const [show, openModal] = useState(false);
	const [opened, setOpened] = useState(false);
	const [loading, setLoading] = useState(false);
	const [payment_id, setPlaidPaymentId] = useState(null);
	const [link_token, setLinkToken] = useState(null);
	const [paymentOpened, setPaymentOpened] = useState(false);
	const [range, setRange] = useState<DateRangePickerValue>([
		dayjs().startOf('week').toDate(),
		dayjs().endOf('week').toDate()
	]);
	const [selectedPayment, setSelectedPayment] = useState(null);
	const [section, setSection] = useState<SectionState>('topup');
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
	const linkSessionMutation = trpc.updateLinkSession.useMutation({
		onSuccess(input) {
			utils.getPayments.invalidate({ userId: session_id });
		}
	});
	const updateStatusMutation = trpc.cancelPayment.useMutation({
		onSuccess(input) {
			utils.getPayments.invalidate({ userId: session_id });
		}
	});
	const onSuccess = useCallback<PlaidLinkOnSuccess>((public_token: string, metadata: PlaidLinkOnSuccessMetadata) => {
		// log and save metadata
		// exchange public token
		openModal(true);
		setTimeout(() => openModal(false), 3000);
	}, []);
	const onExit = useCallback<PlaidLinkOnExit>(async (error, metadata: PlaidLinkOnExitMetadata) => {
		try {
			const result = await updateStatusMutation.mutateAsync({
				userId: session_id,
				plaid_payment_id: payment_id
			});
			console.log(result);
			notifyError(
				'plaid-cancelled',
				'Plaid session was closed unexpectedly. No funds were transferred from your bank account',
				<IconX size={20} />
			);
		} catch (err) {
			console.error(err);
		}
	}, []);
	const onEvent = useCallback<PlaidLinkOnEvent>((eventName, metadata) => {
		if (eventName === 'SELECT_INSTITUTION') {
			linkSessionMutation.mutate({
				userId: session_id,
				plaid_link_token: link_token,
				link_session_id: metadata.link_session_id
			});
		}
		console.table(metadata);
	}, []);

	const config: Parameters<typeof usePlaidLink>[0] = {
		env: String(process.env.NEXT_PUBLIC_PLAID_ENVIRONMENT),
		clientName: String(process.env.NEXT_PUBLIC_PLAID_CLIENT_NAME),
		token: link_token,
		onSuccess,
		onExit,
		onEvent,
		onLoad: () => console.log('loading...')
	};
	const { open, ready } = usePlaidLink(config);
	const data = testMode
		? SAMPLE_PAYMENTS
		: !query?.isLoading
		? query?.data?.filter(p => {
				const in_range = dayjs(p.created_at).isBetween(dayjs(range[0]), dayjs(range[1]).endOf('d'), 'h');
				const is_not_cancelled = p.status !== PAYMENT_STATUS.CANCELLED;
				return (
					in_range &&
					is_not_cancelled &&
					(p.recipient_name.contains(search) ||
						p.payment_type.contains(search) ||
						GBP(p.amount).format().contains(search) ||
						p.reference.contains(search))
				);
		  })
		: [];

	const form = useForm<PaymentFormValues>({
		initialValues: {
			amount: 0,
			reference: '',
			is_scheduled: false
		},
		validate: {
			amount: val => (val > 1000000 ? 'Amount must not be greater then £1,000,000' : null),
			reference: val =>
				val.search(/[^a-zA-Z0-9 ]/g) !== -1 ? 'Reference must not contain special characters' : null,
			interval: (val, values) => (values.is_scheduled && !val ? 'Required for direct debit' : null),
			interval_execution_day: (val, values) =>
				values.is_scheduled && isNaN(val) ? 'Required for direct debit' : null,
			start_date: (val, values) => (values.is_scheduled && !val ? 'Required for direct debit' : null)
		}
	});

	const handleSubmit = async (values: PaymentFormValues) => {
		setLoading(true);
		try {
			let token;
			if (section === 'topup') {
				token = await topUpMutation.mutateAsync({
					user_id: String(session_id),
					stripe_account_id: stripe_account_id,
					amount: values.amount,
					reference: values.reference,
					is_scheduled: values.is_scheduled,
					...(values.is_scheduled && {
						schedule: {
							interval: values.interval,
							interval_execution_day: values.interval_execution_day,
							start_date: values.start_date.toISOString(),
							end_date: values?.end_date.toISOString()
						}
					})
				});
			} else {
				token = await payAccountMutation.mutateAsync({
					user_id: String(session_id),
					account_holder_name: values.account_holder_name,
					account_number: values.account_number,
					amount: values.amount,
					sort_code: values.sort_code,
					reference: values.reference,
					is_scheduled: values.is_scheduled,
					...(values.is_scheduled && {
						schedule: {
							interval: values?.interval,
							interval_execution_day: values?.interval_execution_day,
							start_date: values?.start_date.toISOString(),
							end_date: values?.end_date.toISOString()
						}
					})
				});
			}
			setLinkToken(token.link_token);
			setPlaidPaymentId(token.payment_id);
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
	}, [ready, open, link_token]);

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
			<SuccessModal opened={show} onClose={() => openModal(false)} />
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
