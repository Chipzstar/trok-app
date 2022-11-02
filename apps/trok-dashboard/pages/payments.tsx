import React, { useCallback, useEffect, useState } from 'react';
import Page from '../layout/Page';
import {
	ActionIcon,
	Button,
	Drawer,
	Group,
	Loader,
	NumberInput,
	SegmentedControl,
	Stack,
	Text,
	TextInput,
	Title
} from '@mantine/core';
import { IconCalendar, IconCheck, IconChevronRight, IconSearch, IconX } from '@tabler/icons';
import PaymentsTable from '../containers/PaymentsTable';
import { GBP, SAMPLE_PAYMENTS } from '../utils/constants';
import { DateRangePicker, DateRangePickerValue } from '@mantine/dates';
import dayjs from 'dayjs';
import { capitalize, sanitize } from '../utils/functions';
import classNames from 'classnames';
import PaymentDetails from '../modals/PaymentDetails';
import SortCodeInput from '../components/SortCodeInput';
import { useForm } from '@mantine/form';
import { PlaidLinkOnSuccess, PlaidLinkOnSuccessMetadata, usePlaidLink } from 'react-plaid-link';
import { apiClient, trpc } from '../utils/clients';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { notifyError, notifySuccess, PAYMENT_STATUS } from '@trok-app/shared-utils';

const Payments = ({ testMode, session_id, stripe_account_id }) => {
	const [opened, setOpened] = useState(false);
	const [loading, setLoading] = useState(false);
	const [linkToken, setLinkToken] = useState(null);
	const [paymentOpened, setPaymentOpened] = useState(false);
	const [value, setValue] = useState<DateRangePickerValue>([dayjs().subtract(1, 'day').toDate(), dayjs().toDate()]);
	const [selectedPayment, setSelectedPayment] = useState(null);
	const [section, setSection] = useState<'topup' | 'account'>('topup');
	const query = trpc.getPayments.useQuery({
		userId: session_id
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
		env: 'sandbox',
		clientName: process.env.NEXT_PUBLIC_PLAID_CLIENT_NAME,
		token: linkToken,
		onSuccess,
		onLoad: () => console.log('loading...')
	};

	const { open, ready } = usePlaidLink(config);
	const rows = testMode
		? SAMPLE_PAYMENTS.map((element, index) => {
				const statusClass = classNames({
					'py-1': true,
					'w-28': true,
					'rounded-full': true,
					'text-center': true,
					capitalize: true,
					'text-xs': true,
					'tracking-wide': true,
					'font-semibold': true,
					'text-success': element.status === PAYMENT_STATUS.COMPLETE,
					'text-warning': element.status === PAYMENT_STATUS.IN_PROGRESS,
					'text-danger': element.status === PAYMENT_STATUS.FAILED,
					'bg-success/25': element.status === PAYMENT_STATUS.COMPLETE,
					'bg-warning/25': element.status === PAYMENT_STATUS.IN_PROGRESS,
					'bg-danger/25': element.status === PAYMENT_STATUS.FAILED
				});
				return (
					<tr
						key={index}
						style={{
							border: 'none'
						}}
					>
						<td colSpan={1}>
							<span>{dayjs.unix(element.created_at).format('MMM DD')}</span>
						</td>
						<td colSpan={1}>
							<span>{element.recipient_name}</span>
						</td>
						<td colSpan={1}>
							<span>{element.payment_type}</span>
						</td>
						<td colSpan={1}>
							<span>{GBP(element.amount).format()}</span>
						</td>
						<td colSpan={1}>
							<div className={statusClass}>
								<span>
									<span
										style={{
											fontSize: 9
										}}
									>
										●
									</span>
									&nbsp;
									{capitalize(sanitize(element?.status))}
								</span>
							</div>
						</td>
						<td
							role='button'
							onClick={() => {
								setSelectedPayment(element);
								setOpened(true);
							}}
						>
							<Group grow position='left'>
								<ActionIcon size='sm'>
									<IconChevronRight />
								</ActionIcon>
							</Group>
						</td>
					</tr>
				);
		  })
		: !query?.isLoading
		? query?.data?.map((p, index) => {
				const statusClass = classNames({
					'py-1': true,
					'w-28': true,
					'rounded-full': true,
					'text-center': true,
					capitalize: true,
					'text-xs': true,
					'tracking-wide': true,
					'font-semibold': true,
					'text-violet-500': p.status === PAYMENT_STATUS.PENDING,
					'text-success': p.status === PAYMENT_STATUS.COMPLETE,
					'text-warning': p.status === PAYMENT_STATUS.IN_PROGRESS,
					'text-danger': p.status === PAYMENT_STATUS.FAILED,
					'text-gray-500': p.status === PAYMENT_STATUS.CANCELLED,
					'bg-violet-500/25': p.status === PAYMENT_STATUS.PENDING,
					'bg-success/25': p.status === PAYMENT_STATUS.COMPLETE,
					'bg-warning/25': p.status === PAYMENT_STATUS.IN_PROGRESS,
					'bg-danger/25': p.status === PAYMENT_STATUS.FAILED,
					'bg-gray-500/25': p.status === PAYMENT_STATUS.CANCELLED
				});
				return (
					<tr
						key={index}
						style={{
							border: 'none'
						}}
					>
						<td colSpan={1}>
							<span>{dayjs(p.created_at).format('MMM DD')}</span>
						</td>
						<td colSpan={1}>
							<span>{p.recipient_name}</span>
						</td>
						<td colSpan={1}>
							<span>{capitalize(sanitize(p.payment_type))}</span>
						</td>
						<td colSpan={1}>
							<span>{GBP(p.amount).format()}</span>
						</td>
						<td colSpan={1}>
							<div className={statusClass}>
								<span>
									<span
										style={{
											fontSize: 9
										}}
									>
										●
									</span>
									&nbsp;
									{capitalize(sanitize(p?.status))}
								</span>
							</div>
						</td>
						<td
							role='button'
							onClick={() => {
								setSelectedPayment(p);
								setOpened(true);
							}}
						>
							<Group grow position='left'>
								<ActionIcon size='sm'>
									<IconChevronRight />
								</ActionIcon>
							</Group>
						</td>
					</tr>
				);
		  })
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
			const token = (
				await apiClient.post('/server/plaid/create_link_token_for_payment', {
					user_id: String(session_id),
					stripe_account_id: stripe_account_id,
					amount: values.amount,
					reference: values.reference
				})
			).data;
			setLinkToken(token.link_token);
			setLoading(false);
			setOpened(false);
			notifySuccess('plaid-payment-success', 'Plaid Link Token Success!', <IconCheck size={20} />);
		} catch (err) {
			console.error(err);
			setLoading(false);
			notifyError('plaid-payment-failed', err.message, <IconX size={20} />);
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
			<Drawer
				opened={paymentOpened}
				onClose={() => setPaymentOpened(false)}
				padding='xl'
				size='xl'
				position='right'
				classNames={{
					drawer: 'flex h-full'
				}}
			>
				<Stack>
					<Title order={2} weight={500}>
						<span>Send Payment</span>
					</Title>
					<form onSubmit={form.onSubmit(handleSubmit)} className='flex flex-col space-y-4'>
						<SegmentedControl
							value={section}
							onChange={(value: 'topup' | 'account') => setSection(value)}
							transitionTimingFunction='ease'
							fullWidth
							data={[
								{ label: 'Top Up', value: 'topup' },
								{ label: 'Account', value: 'account' }
							]}
						/>
						{section === 'account' ? (
							<>
								<TextInput required label='Send To' {...form.getInputProps('account_holder_name')} />
								<Group grow spacing='xl'>
									<TextInput
										required
										label='Account Number'
										{...form.getInputProps('account_number')}
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
								<NumberInput
									precision={2}
									label='Amount'
									min={100}
									max={1000000}
									step={100}
									parser={(value: string) => value.replace(/\£\s?|(,*)/g, '')}
									formatter={value =>
										!Number.isNaN(parseFloat(value))
											? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
											: '£ '
									}
									{...form.getInputProps('amount')}
								/>
							</>
						) : (
							<>
								<NumberInput
									label='Amount'
									min={100}
									max={1000000}
									parser={(value: string) => value.replace(/\£\s?|(,*)/g, '')}
									formatter={value =>
										!Number.isNaN(parseFloat(value))
											? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
											: '£ '
									}
									{...form.getInputProps('amount')}
								/>
								<TextInput
									required
									minLength={1}
									maxLength={18}
									label='Reference'
									{...form.getInputProps('reference')}
								/>
							</>
						)}
						<Group py='xl' position='right'>
							<Button
								type='submit'
								styles={{
									root: {
										width: 120
									}
								}}
							>
								<Loader size='sm' className={`mr-3 ${!loading && 'hidden'}`} color='white' />
								<Text weight={500}>Send</Text>
							</Button>
						</Group>
					</form>
				</Stack>
			</Drawer>
			<Page.Body>
				<div className='flex items-center justify-between'>
					<TextInput
						className='w-96'
						size='sm'
						radius={0}
						icon={<IconSearch size={18} />}
						onChange={e => console.log(e.target.value)}
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
						value={value}
						inputFormat='DD/MM/YYYY'
						labelSeparator=' → '
						labelFormat='MMM YYYY'
						onChange={setValue}
					/>
				</div>
				<PaymentsTable rows={rows} />
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
