import React, { useState } from 'react';
import DataGrid from '../components/DataGrid';
import Empty from '../components/Empty';
import classNames from 'classnames';
import { GBP, PAYMENT_STATUS } from '@trok-app/shared-utils';
import dayjs from 'dayjs';
import { capitalize, sanitize } from '../utils/functions';
import { ActionIcon, Group } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons';

const PaymentsTable = ({data, setOpened, selectPayment}) => {
	const [activePage, setPage] = useState(1)
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
	})

	return (
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
