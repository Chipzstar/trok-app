import React, { useState } from 'react';
import Empty from '../components/Empty';
import DataGrid from '../components/DataGrid';
import { ActionIcon, Divider, Group, LoadingOverlay, MantineNumberSize, Text } from '@mantine/core';
import dayjs from 'dayjs';
import { GBP, sanitize, TRANSACTION_STATUS } from '@trok-app/shared-utils';
import { Prisma } from '@prisma/client';
import { IconChevronRight } from '@tabler/icons';
import classNames from 'classnames';

export interface TransactionTableProps {
	loading: boolean;
	data: Prisma.TransactionUncheckedCreateInput[];
	setOpened?: (val: boolean) => void;
	selectTransaction?: (t: Prisma.TransactionUncheckedCreateInput) => void;
	spacingY?: MantineNumberSize;
	withPagination?: boolean;
	expandable?: boolean;
}

const TransactionTable = ({
							  loading,
							  data,
							  spacingY = 'md',
							  withPagination = true,
							  setOpened,
							  selectTransaction,
							  expandable = false
						  }: TransactionTableProps) => {
	const [activePage, setPage] = useState(1);
	const rows = data.map((t, index) => {
		const statusClass = classNames({
			'py-1': true,
			'w-28': true,
			rounded: true,
			'text-center': true,
			'capitalize': true,
			'text-xs': true,
			'tracking-wide': true,
			'font-semibold': true,
			'text-success': t.status === TRANSACTION_STATUS.APPROVED,
			'text-danger': t.status === TRANSACTION_STATUS.DECLINED,
			'bg-success/25': t.status === TRANSACTION_STATUS.APPROVED,
			'bg-danger/25': t.status === TRANSACTION_STATUS.DECLINED
		});
		return (
			<tr key={index}>
				<td colSpan={1}>
					<div className='flex flex-shrink items-center'>
						<span className='ml-2'>{dayjs(t.created_at).format('MMM DD HH:mma')}</span>
					</div>
				</td>
				<td colSpan={1}>
					<div className={statusClass}>
						<span>{sanitize(t.status)}</span>
					</div>
				</td>
				<td colSpan={1}>
					<span>{t.merchant_data.name}</span>
				</td>
				<td colSpan={1}>
					<div className='flex flex-shrink flex-col'>
						<span>
							{t.merchant_data.city} {t.merchant_data.postcode}
						</span>
					</div>
				</td>
				<td colSpan={1}>
					<span>{t.last4}</span>
				</td>
				<td colSpan={1}>
					<Text weight={500}>{t.cardholder_name}</Text>
				</td>
				<td colSpan={1}>
					<span className='text-base font-normal'>{GBP(t.transaction_amount).format()}</span>
				</td>
				{expandable && (
					<td
						role='button'
						onClick={() => {
							selectTransaction(t);
							setOpened(true);
						}}
					>
						<Group grow position='left'>
							<ActionIcon size='sm'>
								<IconChevronRight />
							</ActionIcon>
						</Group>
					</td>
				)}
			</tr>
		);
	});

	return (
		loading ? <div className='relative h-full'><LoadingOverlay visible={loading} transitionDuration={500} overlayBlur={2} /></div> :
			<DataGrid
				rows={rows}
				activePage={activePage}
				setPage={setPage}
				spacingY={spacingY as MantineNumberSize}
				headings={[
					{ label: 'Transacted', key: null },
					{ label: 'Status', key: null },
					{ label: 'Merchant', key: null },
					{ label: 'Location', key: null },
					{ label: 'Card', key: null },
					{
						label: 'Driver',
						key: null
					},
					{ label: 'Amount', key: null },
					...expandable ? [{ label: '', key: null }] : []
				]}
				withPagination={withPagination}
				emptyContent={
					<Empty
						message={
							<span className='text-center text-2xl'>
							You have no transactions
							<br />
							Your transaction will appear once your drivers start using their fuel cards
						</span>
						}
					/>
				}
			/>
	);
};

export default TransactionTable;
