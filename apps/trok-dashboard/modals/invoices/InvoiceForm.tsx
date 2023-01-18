import React, { useCallback, useMemo } from 'react';
import {
	Button,
	Drawer,
	Group,
	Image,
	LoadingOverlay,
	Paper,
	SegmentedControl,
	Stack,
	Text,
	Title
} from '@mantine/core';
import { PATHS } from '../../utils/constants';
import { useRouter } from 'next/router';
import { UseFormReturnType } from '@mantine/form';
import { InvoiceFormValues, InvoiceSectionState } from '../../utils/types';
import Prisma from '@prisma/client';
import { INVOICE_STATUS, notifyError, notifySuccess } from '@trok-app/shared-utils';
import { IconCheck, IconX } from '@tabler/icons';
import { useSession } from 'next-auth/react';
import { trpc } from '../../utils/clients';

interface InvoiceFormProps {
	opened: boolean;
	onClose: () => void;
	form: UseFormReturnType<InvoiceFormValues>;
	onSubmit: (values: InvoiceFormValues) => void;
	loading: boolean;
	showPODUploadForm: () => void;
	showInvUploadForm: () => void;
	selectedInvoice?: Prisma.Invoice | null;
}

const InvoiceForm = ({
	opened,
	onClose,
	form,
	onSubmit,
	loading,
	showPODUploadForm,
	showInvUploadForm,
	selectedInvoice = null
}: InvoiceFormProps) => {
	const router = useRouter();
	const { data: session } = useSession();
	const [visible, setVisible] = React.useState(false);
	const utils = trpc.useContext();
	const updateMutation = trpc.invoice.updateInvoice.useMutation({
		onSuccess: function (input) {
			utils.invoice.getInvoices
				.invalidate({ userId: session.id })
				.then(r => console.log(input, 'Invoices refetched'));
		}
	});

	const title = useMemo(() => {
		if (selectedInvoice?.status === INVOICE_STATUS.PROCESSING) {
			return 'We are on it';
		} else if (form.values.invoice) {
			return 'Get paid now';
		}
		return 'Add New Invoice';
	}, [selectedInvoice, form.values]);

	const subtitle = useMemo(() => {
		if (selectedInvoice?.status === INVOICE_STATUS.PROCESSING) {
			return "We are currently verifying your documents to ensure they are eligible for factoring. We'll notify you when the payment has been made";
		} else if (form.values.invoice) {
			return 'Invoicing takes up to one business day. Upload your proof of delivery to receive your money now and improve your cash flow.';
		}
		return 'Add your documents and we’ll transcribe, verify and send your invoice on your behalf when you submit to us.';
	}, [selectedInvoice, form.values]);

	const pod_visible = useMemo(() => {
		return form.values.invoice || form.values.type === 'upload';
	}, [form.values]);

	const requestApproval = useCallback(
		async (invoice: Prisma.Invoice) => {
			try {
				const result = updateMutation.mutateAsync({
					invoice_id: invoice.invoice_id,
					userId: session.id,
					status: INVOICE_STATUS.PROCESSING
				});
				notifySuccess(
					'approval-request-success',
					'Approval request has been sent! We will let you know shortly once this invoice has been approved',
					<IconCheck size={20} />
				);
				return result;
			} catch (err) {
				notifyError('approval-request-error', err.message, <IconX size={20} />);
			}
		},
		[session]
	);

	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			padding='xl'
			size='xl'
			position='right'
			classNames={{
				drawer: 'flex h-full',
				body: 'flex h-full'
			}}
			transitionDuration={250}
			transitionTimingFunction='ease'
		>
			<LoadingOverlay visible={visible} overlayBlur={2} />
			<form onSubmit={form.onSubmit(onSubmit)} className='flex h-full flex-col justify-between space-y-4 pb-6'>
				<Stack>
					<Title order={2} weight={500}>
						<span>{title}</span>
					</Title>
					<Text size='md'>{subtitle}</Text>
					<Text size='xs' color='dark'>
						Accepted file formats are .jpg, .jpeg, .png & .pdf. Files must be smaller than 25 MB
					</Text>
					<SegmentedControl
						disabled={!!form.values.invoice}
						value={form.values.type}
						onChange={(value: InvoiceSectionState) => form.setFieldValue('type', value)}
						transitionTimingFunction='ease'
						fullWidth
						data={[
							{ label: 'Create Invoice', value: 'create' },
							{ label: 'Upload Invoice', value: 'upload' }
						]}
					/>
					{form.values.type === 'create' ? (
						<Paper
							disabled={!!form.values.invoice}
							component='button'
							shadow='xs'
							p='lg'
							withBorder
							onClick={() => {
								setVisible(true);
								router.push(PATHS.CREATE_INVOICE).then(() => setVisible(false));
							}}
						>
							<Group spacing='xl'>
								{form.values.invoice ? (
									<div className='flex flex h-20 w-20 items-center justify-center rounded-xl bg-success/25'>
										<Image
											width={60}
											height={60}
											radius='md'
											src='/static/images/add-button.svg'
											alt='create invoice'
										/>
									</div>
								) : (
									<div className='flex flex h-20 w-20 items-center justify-center rounded-xl bg-primary/25'>
										<Image
											width={60}
											height={60}
											radius='md'
											src='/static/images/add-button.svg'
											alt='create invoice'
										/>
									</div>
								)}
								<Text weight='bold'>
									{form.values.invoice ? 'Invoice submitted' : 'Create Invoice'}
								</Text>
							</Group>
						</Paper>
					) : (
						<Paper component='button' shadow='xs' p='lg' withBorder onClick={showInvUploadForm}>
							<Group spacing='xl'>
								<div className='flex flex h-20 w-20 items-center justify-center rounded-xl bg-primary/25'>
									<Image
										width={60}
										height={60}
										radius='md'
										src='/static/images/add-button.svg'
										alt='Add invoice rate'
									/>
								</div>
								<Text weight='bold'>Add invoice rate confirmation</Text>
							</Group>
						</Paper>
					)}
					{pod_visible && (
						<Paper component='button' shadow='xs' p='lg' withBorder onClick={showPODUploadForm}>
							<Group spacing='xl'>
								{form.values.pod ? (
									<div className='flex flex h-20 w-20 items-center justify-center rounded-xl bg-success/25'>
										<Image
											width={60}
											height={60}
											radius='md'
											src='/static/images/add-button.svg'
											alt='Upload Proof of delivery'
										/>
									</div>
								) : (
									<div className='flex flex h-20 w-20 items-center justify-center rounded-xl bg-primary/25'>
										<Image
											width={60}
											height={60}
											radius='md'
											src='/static/images/add-button.svg'
											alt='Upload Proof of delivery'
										/>
									</div>
								)}
								<Text weight='bold'>
									{form.values.pod || selectedInvoice?.pod
										? 'POD Submitted'
										: 'Upload proof of delivery'}
								</Text>
							</Group>
						</Paper>
					)}
				</Stack>
				{!selectedInvoice && (
					<Group py='xl' position='right'>
						<Button
							onClick={() => {
								if (selectedInvoice) requestApproval(selectedInvoice).then(() => form.reset());
							}}
							disabled={!form.values.invoice || !form.values.pod}
							type='submit'
							styles={{
								root: {
									width: 150
								}
							}}
							loading={loading}
						>
							<Text weight={500}>{form.values.invoice ? 'Get Paid' : 'Add'}</Text>
						</Button>
					</Group>
				)}
			</form>
		</Drawer>
	);
};

export default InvoiceForm;
