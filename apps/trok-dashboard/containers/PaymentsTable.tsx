import React, { useState } from 'react';
import DataGrid from '../components/DataGrid';
import Empty from '../components/Empty';
import classNames from 'classnames';
import { capitalize, GBP, PAYMENT_STATUS, sanitize } from '@trok-app/shared-utils';
import dayjs from 'dayjs';
import { ActionIcon, Group, LoadingOverlay, MantineNumberSize } from '@mantine/core';
import { IconChevronRight, IconRotateClockwise2 } from '@tabler/icons';
import { Prisma } from '@prisma/client';

export interface PaymentTableProps {
	loading: boolean;
	data: Prisma.PaymentUncheckedCreateInput[];
	setOpened?: (val: boolean) => void;
	selectPayment?: (p: Prisma.PaymentUncheckedCreateInput) => void;
}

const PaymentsTable = ({ loading, data, setOpened, selectPayment }: PaymentTableProps) => {
	const [activePage, setPage] = useState(1);
	const rows = data.map((p, index) => {
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
					<span>{p.reference}</span>
				</td>
				<td colSpan={1}>
					<Group align='center'>
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
						{p.recurring && <IconRotateClockwise2 size={20} />}
					</Group>
				</td>
				<td
					role='button'
					onClick={() => {
						selectPayment(p);
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

	return loading ? (
		<div className='relative h-full'>
			<LoadingOverlay visible={loading} transitionDuration={500} overlayBlur={2} />
		</div>
	) : (
		<DataGrid
			rows={rows}
			activePage={activePage}
			setPage={setPage}
			spacingY='md'
			headings={[
				{ label: 'Sent Date', key: null },
				{ label: 'Sent To', key: null },
				{ label: 'Type', key: null },
				{ label: 'Amount', key: null },
				{ label: 'Reference', key: null },
				{ label: 'Status', key: null },
				{ label: '', key: null }
			]}
			emptyContent={
				<Empty
					message={
						<span className='text-center text-2xl'>
							You have no payments
							<br />
							{"Click the 'Send Payment' button to top-up your driver's card"}
						</span>
					}
				/>
			}
		/>
	);
};

export default PaymentsTable;
