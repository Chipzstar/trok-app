import React, { useMemo } from 'react';
import {
	Button,
	Checkbox,
	Drawer,
	Group,
	NumberInput,
	SegmentedControl,
	Select,
	Stack,
	Text,
	TextInput,
	Title
} from '@mantine/core';
import SortCodeInput from '../components/SortCodeInput';
import { UseFormReturnType } from '@mantine/form';
import dayjs from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import weekday from 'dayjs/plugin/weekday';
import { SelectInput } from '../utils/types';
import { DatePicker } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons';
import { capitalize } from '@trok-app/shared-utils';

dayjs.extend(weekday);
dayjs.extend(updateLocale);

dayjs.updateLocale('en', {
	weekStart: 1
});

const IntervalValues = ['WEEKLY', 'MONTHLY'] as const;

type PlaidPaymentInterval = typeof IntervalValues[number];

export type SectionState = 'topup' | 'account';

type TopUp = {
	amount: number;
	reference: string;
	account_holder_name?: never;
	account_number?: never;
	sort_code?: never;
	is_scheduled: false;
	interval?: never;
	interval_execution_day?: never;
	start_date?: never;
	end_date?: never;
}

type Account = {
	amount: number;
	reference: string;
	account_holder_name: string;
	account_number: string;
	sort_code: string;
	is_scheduled: false;
	interval?: never;
	interval_execution_day?: never;
	start_date?: never;
	end_date?: never;
}

type DirectDebit = {
	amount: number;
	reference: string;
	account_holder_name?: string;
	account_number?: string;
	sort_code?: string;
	is_scheduled: true;
	interval: PlaidPaymentInterval;
	interval_execution_day: number | null;
	start_date: Date | null;
	end_date?: Date | null;
}

export type PaymentFormValues = TopUp | Account | DirectDebit

interface PaymentFormProps {
	opened: boolean;
	onClose: () => void;
	onSubmit: (values: PaymentFormValues) => Promise<void>;
	form: UseFormReturnType<PaymentFormValues>;
	section: string;
	setSection: (val: SectionState) => void;
	loading: boolean;
}

const PaymentForm = ({ opened, onClose, onSubmit, form, section, setSection, loading }: PaymentFormProps) => {
	const is_weekly = useMemo(() => form.values?.interval === 'WEEKLY', [form.values?.interval]);
	const execution_days = useMemo(() => {
		let values: SelectInput[];
		if (form.values.interval === 'WEEKLY') {
			values = [...Array(7).keys()].map(item => ({
				label: dayjs().weekday(item).format('dddd'),
				value: item + 1 // +1 Because interval_execution_day should be an integer from 1 (Monday) to 7 (Sunday).
			}));
		} else {
			values = [...Array(28).keys()].map(item => ({
				label: dayjs()
					.date(item + 1)
					.format('D'), // +1 because date of the month accepts numbers from 1 to 28
				value: item + 1,
				group: 'Specific date'
			}));
			values.shift();
			values.unshift({
				label: 'First day of the month',
				value: 1,
				group: 'Common'
			}, {
				label: 'Last day of the month',
				value: -1,
				group: 'Common'
			});
		}
		form.setFieldValue('interval_execution_day', Number.NaN);
		return values;
	}, [form.values.interval]);

	return (
		<Drawer
			opened={opened}
			onClose={onClose}
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
				<form onSubmit={form.onSubmit(onSubmit)} className='flex flex-col space-y-4'>
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
					{section === 'account' && (
						<>
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
						</>
					)}

					<NumberInput
						required
						precision={2}
						label='Amount'
						min={1}
						max={1000000}
						step={5}
						parser={value => value.replace(/£\s?|(,*)/g, '')}
						formatter={value =>
							!Number.isNaN(parseFloat(value)) ? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '£ '
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
					<Checkbox
						size='sm'
						label='Make Direct Debit'
						{...form.getInputProps('is_scheduled', { type: 'checkbox' })}
					/>
					{form.values.is_scheduled && (
						<>
							<Group>
								<Select
									required
									label='Interval'
									data={IntervalValues.map(item => ({
										label: capitalize(item.toLowerCase()),
										value: item
									}))}
									{...form.getInputProps('interval')}
								/>
								<Select
									required
									label={is_weekly ? 'Day of the Week' : 'Day of the Month'}
									data={execution_days}
									{...form.getInputProps('interval_execution_day')}
								/>
							</Group>
							<Group grow>
								<DatePicker
									icon={<IconCalendar size={16} />}
									required
									label='Start Date'
									inputFormat="MMM, DD YYYY"
									value={form.values.start_date}
									onChange={(date) => form.setFieldValue("start_date", date)}
									error={form.errors.start_date}
									minDate={dayjs().add(1, 'd').toDate()}
								/>
								<DatePicker
									icon={<IconCalendar size={16} />}
									label='End Date'
									inputFormat="MMM, DD YYYY"
									value={form.values.end_date}
									onChange={(date) => form.setFieldValue("end_date", date)}
									error={form.errors.end_date}
									minDate={dayjs(form.values.start_date).startOf('day').add(1, 'week').toDate()}
								/>
							</Group>
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
							loading={loading}
						>
							<Text weight={500}>Send</Text>
						</Button>
					</Group>
				</form>
			</Stack>
		</Drawer>
	);
};

export default PaymentForm;
