import React, { useCallback, useState } from 'react';
import Page from '../layout/Page';
import { ActionIcon, Button, Drawer, Group, NumberInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconCalendar, IconChevronRight, IconSearch } from '@tabler/icons';
import PaymentsTable from '../containers/PaymentsTable';
import { GBP, SAMPLE_PAYMENTS } from '../utils/constants';
import { DateRangePicker, DateRangePickerValue } from '@mantine/dates';
import dayjs from 'dayjs';
import { capitalize, sanitize } from '../utils/functions';
import classNames from 'classnames';
import { PAYMENT_STATUS } from '../utils/types';
import PaymentDetails from '../modals/PaymentDetails';
import SortCodeInput from '../components/SortCodeInput';
import { useForm } from '@mantine/form';

const Payments = () => {
	const [opened, setOpened] = useState(false);
	const [paymentOpened, setPaymentOpened] = useState(false);
	const [value, setValue] = useState<DateRangePickerValue>([dayjs().subtract(1, 'day').toDate(), dayjs().toDate()]);
	const [selectedPayment, setSelectedPayment] = useState(null);

	const rows = SAMPLE_PAYMENTS.map((element, index) => {
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
					<span>{dayjs.unix(element.finish_date).format('MMM DD')}</span>
				</td>
				<td colSpan={1}>
					<span>{element.recipient.name}</span>
				</td>
				<td colSpan={1}>
					<span>{element.type}</span>
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
	});

	const form = useForm({
		initialValues: {
			account_holder_name: '',
			account_number: '',
			sort_code: ''
		}
	});

	const handleSubmit = useCallback(values => {
		alert(JSON.stringify(values));
		console.log(values);
	}, []);

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
						<TextInput required label='Send To' {...form.getInputProps('account_holder_name')} />
						<Group grow spacing='xl'>
							<TextInput required label='Account Number' {...form.getInputProps('account_number')} />
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
							label='Amount'
							min={100}
							max={1000000}
							formatter={value =>
								!Number.isNaN(parseFloat(value))
									? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
									: '£ '
							}
							{...form.getInputProps('spending_limit')}
						/>
						<Group py='xl' position='right'>
							<Button
								type='submit'
								styles={{
									root: {
										width: 120
									}
								}}
							>
								<Text weight={500}>Send</Text>
							</Button>
						</Group>
					</form>
				</Stack>
			</Drawer>
			<Page.Body>
				<div className='mb-4 flex items-center justify-between'>
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

export default Payments;
