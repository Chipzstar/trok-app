import React, { useState } from 'react';
import PageContainer from '../layout/PageContainer';
import { ActionIcon, Button, Divider, Drawer, Group, Stack, Textarea, TextInput } from '@mantine/core';
import { IconCalendar, IconChevronRight, IconPencil, IconSearch } from '@tabler/icons';
import PaymentsTable from '../containers/PaymentsTable';
import { GBP, SAMPLE_PAYMENTS } from '../utils/constants';
import { DateRangePicker, DateRangePickerValue } from '@mantine/dates';
import dayjs from 'dayjs';
import { capitalize, sanitize } from '../utils/functions';
import classNames from 'classnames';
import { PAYMENT_STATUS } from '../utils/types';

const Payments = () => {
	const [opened, setOpened] = useState(false);
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
				<td role='button' onClick={() => {
					setSelectedPayment(element)
					setOpened(true)
				}}>
					<Group grow position='left'>
						<ActionIcon size='sm'>
							<IconChevronRight />
						</ActionIcon>
					</Group>
				</td>
			</tr>
		);
	});

	return (
		<PageContainer
			header={
				<PageContainer.Header>
					<span className='text-2xl font-medium'>Payments</span>
					<Button className='' onClick={() => null}>
						<span className='text-base font-normal'>Send Payment</span>
					</Button>
				</PageContainer.Header>
			}
		>
			<Drawer opened={opened} onClose={() => setOpened(false)} padding="xl" size='xl' position='right' classNames={{
				drawer: 'flex h-full'
			}}>
				<Stack justify="center">
					<Stack spacing='xs'>
						<span>Payment <span className="font-semibold">{sanitize(selectedPayment?.status ?? "in progress")}</span> to {selectedPayment?.recipient?.name}</span>
						<span className='heading-1'>-{GBP(selectedPayment?.amount).format()}</span>
					</Stack>
					<Divider />
					<div className='flex flex-col space-y-12'>
						<Stack spacing='xs'>
							<span className="font-semibold">Payment Type</span>
							<span>{selectedPayment?.type}</span>
						</Stack>
						<Stack spacing='xs'>
							<span className="font-semibold">Payment Date</span>
							<span>{dayjs.unix(selectedPayment?.created_at).format("MMM D")}</span>
						</Stack>
						<Stack spacing='xs'>
							<span className="font-semibold">Payroll Period</span>
							<span>Sept 15 - Sept 30</span>
						</Stack>
					</div>
					<Divider />
					<div className='flex flex-col space-y-12'>
						<span>Add Memo</span>
					</div>
					<Textarea
						rightSection={<IconPencil size={16} color={"gray"}/>}
						px={0}
						cols={1}
						radius={0}
						styles={{
							input: {
								border: 'none',
								borderBottom: '2px solid lightgray'
							}
						}}
					/>
				</Stack>
			</Drawer>
			<PageContainer.Body>
				<div className='mb-4 flex items-center justify-between'>
					<TextInput
						className='w-96'
						size='md'
						radius={0}
						icon={<IconSearch size={18} />}
						onChange={e => console.log(e.target.value)}
						placeholder='Search'
					/>
					<DateRangePicker
						icon={<IconCalendar size={18} />}
						fullWidth
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
			</PageContainer.Body>
		</PageContainer>
	);
};

export default Payments;
