import React from 'react';
import { Drawer, SegmentedControl, Image, Stack, Title, Text, Paper, Group, LoadingOverlay } from '@mantine/core';
import { PATHS } from '../../utils/constants';
import { useRouter } from 'next/router';
import { UseFormReturnType } from '@mantine/form';

export type SectionState = 'create' | 'upload';

interface InvoiceFormProps {
	opened: boolean;
	onClose: () => void;
	form: UseFormReturnType<{ pod: boolean; invoice: boolean }>;
	onSubmit: (values: { pod: boolean; invoice: boolean }) => void;
	loading: boolean;
	section: SectionState;
	setSection: (val: SectionState) => void;
	showPODUploadForm: () => void;
	showInvUploadForm: () => void;
	invoiceId: string;
}

const InvoiceForm = ({
	opened,
	onClose,
	form,
	onSubmit,
	loading,
	section,
	setSection,
	showPODUploadForm,
	showInvUploadForm,
	invoiceId
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
				drawer: 'flex h-full'
			}}
			transitionDuration={250}
			transitionTimingFunction='ease'
		>
			<LoadingOverlay visible={visible} overlayBlur={2} />
			<Stack>
				<Title order={2} weight={500}>
					<span>Add New Invoice</span>
				</Title>
				<Text size='md'>
					Add your documents and we’ll transcribe, verify and send your invoice on your behalf when you submit
					to us.
				</Text>
				<Text size='xs' color='dark'>
					Accepted file formats are .jpg, .jpeg, .png & .pdf. Files must be smaller than 25 MB
				</Text>
				<form onSubmit={form.onSubmit(onSubmit)} className='flex flex-col space-y-4'>
					<SegmentedControl
						value={section}
						onChange={(value: 'create' | 'upload') => setSection(value)}
						transitionTimingFunction='ease'
						fullWidth
						data={[
							{ label: 'Create Invoice', value: 'create' },
							{ label: 'Upload Invoice', value: 'upload' }
						]}
					/>
					{section === 'create' ? (
						<Paper
							component='button'
							shadow='xs'
							p='lg'
							withBorder
							onClick={() => {
								setVisible(true);
								router.push(`${PATHS.CREATE_INVOICE}?invoiceId=${invoiceId}`).then(() => setVisible(false));
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
							<Text weight='bold'>{form.values.pod ? 'POD Submitted' : 'Upload proof of delivery'}</Text>
						</Group>
					</Paper>
				</form>
			</Stack>
		</Drawer>
	);
};

export default InvoiceForm;
