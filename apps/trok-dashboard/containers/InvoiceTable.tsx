import React, { useState } from 'react';
import classNames from 'classnames';
import {
	capitalize,
	GBP,
	INVOICE_PAID_STATUS,
	INVOICE_STATUS,
	notifyError,
	notifySuccess,
	sanitize
} from '@trok-app/shared-utils';
import dayjs from 'dayjs';
import { ActionIcon, Group, LoadingOverlay, Menu, Text } from '@mantine/core';
import {
	IconCheck,
	IconChevronRight,
	IconCircleCheck,
	IconDots,
	IconEye,
	IconPhoto,
	IconSend,
	IconTrash,
	IconX
} from '@tabler/icons';
import DataGrid from '../components/DataGrid';
import Empty from '../components/Empty';
import { Prisma } from '@prisma/client';
import { trpc } from '../utils/clients';
import { useSession } from 'next-auth/react';
import { openConfirmModal } from '@mantine/modals';

interface InvoiceTableProps {
	loading: boolean;
	data: Prisma.InvoiceUncheckedCreateInput[];
	setOpened: (val: boolean) => void;
	selectInvoice: (i: Prisma.InvoiceUncheckedCreateInput) => void;
	showPODUpload: (val: boolean) => void;
}

const InvoiceTable = ({ loading, data, setOpened, selectInvoice, showPODUpload }: InvoiceTableProps) => {
	const { data: session } = useSession();
	const [activePage, setPage] = useState(1);
	const utils = trpc.useContext();
	const deleteMutation = trpc.invoice.deleteInvoice.useMutation({
		onSuccess: function (input) {
			utils.invoice.getInvoices.invalidate({ userId: session.id }).then(r => console.log(input, 'Invoices refetched'));
		}
	});
	const rows = data.map((i, index) => {
		const statusClass = classNames({
			'py-1': true,
			'w-28': true,
			'rounded-full': true,
			'text-center': true,
			uppercase: true,
			'text-xs': true,
			'tracking-wide': true,
			'font-semibold': true,
			'text-violet-500': i.status === INVOICE_STATUS.DRAFT,
			'text-success': i.status === INVOICE_STATUS.COMPLETE,
			'text-warning': i.status === INVOICE_STATUS.SENT,
			'text-danger': i.status === INVOICE_STATUS.UNAPPROVED,
			'bg-violet-500/25': i.status === INVOICE_STATUS.DRAFT,
			'bg-success/25': i.status === INVOICE_STATUS.COMPLETE,
			'bg-warning/25': i.status === INVOICE_STATUS.SENT,
			'bg-danger/25': i.status === INVOICE_STATUS.UNAPPROVED
		});
		const paidStatusClass = classNames({
			'py-1': true,
			'w-16': true,
			'rounded-sm': true,
			'text-center': true,
			uppercase: true,
			'text-xs': true,
			'tracking-wide': true,
			'font-medium': true,
			'text-success': i.paid_status === INVOICE_PAID_STATUS.PAID,
			'text-warning': i.paid_status === INVOICE_PAID_STATUS.PARTIAL,
			'text-yellow-500': i.paid_status === INVOICE_PAID_STATUS.UNPAID,
			'bg-success/25': i.paid_status === INVOICE_PAID_STATUS.PAID,
			'bg-warning/25': i.paid_status === INVOICE_PAID_STATUS.PARTIAL,
			'bg-yellow-500/25': i.paid_status === INVOICE_PAID_STATUS.UNPAID
		});
		return (
			<tr
				key={index}
				style={{
					border: 'none'
				}}
			>
				<td colSpan={1}>
					<span>{dayjs.unix(i.invoice_date).format('DD/MM/YYYY')}</span>
				</td>
				<td colSpan={1}>
					<span>{i.invoice_number}</span>
				</td>
				<td colSpan={1}>
					<span>{capitalize(sanitize(i.customer_name))}</span>
				</td>
				<td colSpan={1}>
					<div className={statusClass}>
						<span>{sanitize(i?.status)}</span>
					</div>
				</td>
				<td colSpan={1}>
					<Group align='center'>
						<span className='w-18'>{GBP(i.total_amount).format()}</span>
						<div className={paidStatusClass}>
							<span>{sanitize(i?.paid_status)}</span>
						</div>
					</Group>
				</td>
				<td colSpan={1}>
					<span>{dayjs.unix(i.due_date).format('MMM DD')}</span>
				</td>
				<td>
					<Group align='center'>
						<ActionIcon
							size='sm'
							onClick={() => {
								selectInvoice(i);
								setOpened(true);
							}}
						>
							<IconChevronRight />
						</ActionIcon>
						<Menu transition='pop' withArrow position='bottom-end'>
							<Menu.Target>
								<ActionIcon size='sm'>
									<IconDots size={16} />
								</ActionIcon>
							</Menu.Target>
							<Menu.Dropdown>
								<Menu.Item
									icon={<IconEye size={16} stroke={1.5} />}
									onClick={() => window.open(i.download_url, '_blank').focus()}
								>
									View Invoice
								</Menu.Item>
								{!i.pod && (
									<Menu.Item icon={<IconPhoto size={16} stroke={1.5} />} onClick={() => showPODUpload(true)}>
										Add Proof of Delivery
									</Menu.Item>
								)}
								<Menu.Item icon={<IconSend size={16} stroke={1.5} />}>Send Invoice</Menu.Item>
								<Menu.Item icon={<IconCircleCheck size={16} stroke={1.5} />}>Mark as Sent</Menu.Item>
								<Menu.Item
									icon={<IconTrash size={16} stroke={1.5} />}
									color='red'
									onClick={() => openModal(i)}
								>
									Delete
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
					</Group>
				</td>
			</tr>
		);
	});

	const openModal = (invoice: Prisma.InvoiceUncheckedCreateInput) =>
		openConfirmModal({
			title: `Deleting Invoice: ${invoice.invoice_number}\n`,
			children: (
				<Text size='sm'>
					Please confirm that you'd like to archive this invoice?
					<br />
					<strong>This action cannot be reversed!</strong>
				</Text>
			),
			centered: true,
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: {
				color: 'red'
			},
			onCancel: () => console.log('Cancel'),
			onConfirm: async () => {
				try {
					const res = await deleteMutation.mutateAsync({
						userId: session.id,
						id: invoice.id
					});
					console.log(res);
					notifySuccess(
						'invoice-deleted-success',
						'Invoice has been successfully archived!',
						<IconCheck size={20} />
					);
				} catch (err) {
					console.error(err);
					notifyError('invoice-deleted-failed', err.message, <IconX size={20} />);
				}
			}
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
				{ label: 'Date', key: null },
				{ label: 'Invoice #', key: null },
				{ label: 'Customer', key: null },
				{ label: 'Status', key: null },
				{ label: 'Amount Due', key: null },
				{ label: 'Due Date', key: null },
				{ label: 'Action', key: null }
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

export default InvoiceTable;
