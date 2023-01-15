import React from 'react';
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

interface InvoiceFormProps {
	opened: boolean;
	onClose: () => void;
	form: UseFormReturnType<InvoiceFormValues>;
	onSubmit: (values: InvoiceFormValues) => void;
	loading: boolean;
	showPODUploadForm: () => void;
	showInvUploadForm: () => void;
}

const InvoiceForm = ({
	opened,
	onClose,
	form,
	onSubmit,
	loading,
	showPODUploadForm,
	showInvUploadForm
}: InvoiceFormProps) => {
	const router = useRouter();
	const [visible, setVisible] = React.useState(false);
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
						<span>{form.values.invoice ? 'Get paid now' : 'Add New Invoice'}</span>
					</Title>
					<Text size='md'>
						{form.values.invoice
							? 'Invoicing takes up to one business day. Upload your proof of delivery to receive you money now and improve your cash flow.'
							: 'Add your documents and we’ll transcribe, verify and send your invoice on your behalf when you submit to us.'}
					</Text>
					<Text size='xs' color='dark'>
						Accepted file formats are .jpg, .jpeg, .png & .pdf. Files must be smaller than 25 MB
					</Text>
					<SegmentedControl
						disabled={!!form.values.invoice}
						value={form.values.type}
						onChange={(value: InvoiceSectionState) => form.setFieldValue("type", value)}
						transitionTimingFunction='ease'
						fullWidth
						data={[
							{ label: 'Create Invoice', value: 'create' },
							{ label: 'Upload Invoice', value: 'upload' }
						]}
					/>
					{form.values.type === 'create' ? (
						<Paper
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
					<Paper
						component='button'
						shadow='xs'
						p='lg'
						withBorder
						onClick={showPODUploadForm}
						disabled={!form.values.invoice}
						sx={{
							backgroundColor: !form.values.invoice ? 'rgba(200,200,200, 0.4)' : undefined
						}}
					>
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
							<Text weight='bold' color={!form.values.invoice ? 'dimmed' : undefined}>
								{form.values.pod ? 'POD Submitted' : 'Upload proof of delivery'}
							</Text>
						</Group>
					</Paper>
				</Stack>
				<Group py='xl' position='right'>
					<Button
						disabled={!form.values.invoice || !form.values.pod}
						type='submit'
						styles={{
							root: {
								width: 150
							}
						}}
						loading={loading}
					>
						<Text weight={500}>Add</Text>
					</Button>
				</Group>
			</form>
		</Drawer>
	);
};

export default InvoiceForm;
