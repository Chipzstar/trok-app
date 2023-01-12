import React, { useState } from 'react';
import classNames from 'classnames';
import { capitalize, GBP, PAYMENT_STATUS, sanitize } from '@trok-app/shared-utils';
import dayjs from 'dayjs';
import { ActionIcon, Group, LoadingOverlay } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons';
import DataGrid from '../components/DataGrid';
import Empty from '../components/Empty';
import { Prisma } from '@prisma/client';

interface InvoiceTableProps {
	loading: boolean;
	data: Prisma.InvoiceUncheckedCreateInput[];
	setOpened: (val: boolean) => void;
	selectInvoice: (i: Prisma.InvoiceUncheckedCreateInput) => void;
}
const InvoiceTable = ({ loading, data, setOpened, selectInvoice } : InvoiceTableProps) => {
	const [activePage, setPage] = useState(1);
	const rows = data.map((i, index) => {
		const statusClass = classNames({
			'py-1': true,
			'w-28': true,
			'rounded-full': true,
			'text-center': true,
			capitalize: true,
			'text-xs': true,
			'tracking-wide': true,
			'font-semibold': true,
			'text-violet-500': i.status === PAYMENT_STATUS.PENDING,
			'text-success': i.status === "paid",
			'text-warning': i.status === PAYMENT_STATUS.IN_PROGRESS,
			'text-danger': i.status === PAYMENT_STATUS.FAILED,
			'text-gray-500': i.status === PAYMENT_STATUS.CANCELLED,
			'bg-violet-500/25': i.status === PAYMENT_STATUS.PENDING,
			'bg-success/25': i.status === "paid",
			'bg-warning/25': i.status === PAYMENT_STATUS.IN_PROGRESS,
			'bg-danger/25': i.status === PAYMENT_STATUS.FAILED,
			'bg-gray-500/25': i.status === PAYMENT_STATUS.CANCELLED
		});
		return (
			<tr
				key={index}
				style={{
					border: 'none'
				}}
			>
				<td colSpan={1}>
					<span>{i.invoice_number}</span>
				</td>
				<td colSpan={1}>
					<span>{capitalize(sanitize(i.customer_name))}</span>
				</td>
				<td colSpan={1}>
					<span>{GBP(i.total_amount).format()}</span>
				</td>
				<td colSpan={1}>
					<span>{dayjs.unix(i.invoice_date).format('MMM DD')}</span>
				</td>
				<td colSpan={1}>
					<span>{dayjs.unix(i.due_date).format('MMM DD')}</span>
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
								{capitalize(sanitize(i?.status))}
							</span>
						</div>
					</Group>
				</td>
				<td
					role='button'
					onClick={() => {
						selectInvoice(i);
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
			offset={220}
			rowHeight={140}
			rows={rows}
			activePage={activePage}
			setPage={setPage}
			spacingY='md'
			headings={[
				{ label: 'Invoice #', key: null },
				{ label: 'Customer', key: null },
				{ label: 'Amount', key: null },
				{ label: 'Invoice Date', key: null },
				{ label: 'Due Date', key: null },
				{ label: 'Status', key: null },
				{ label: '', key: null }
			]}
			emptyContent={
				<Empty
					message={
						<span className='text-center text-2xl'>
							You have no invoices
							<br />
							{"Click the 'New Invoice' button to create your first invoice"}
						</span>
					}
				/>
			}
		/>
	);
};

export default InvoiceTable