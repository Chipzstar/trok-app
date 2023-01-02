import React from 'react';
import { Drawer, SegmentedControl, Image, Stack, Title, Text, Paper, Group } from '@mantine/core';
import { PATHS } from '../../utils/constants';
import { useRouter } from 'next/router';

export type SectionState = 'create' | 'upload';
const InvoiceForm = ({
	opened,
	onClose,
	form,
	onSubmit,
	loading,
	section,
	setSection,
	showPODUploadForm,
	showInvUploadForm
}) => {
	const router = useRouter();
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
				<form
					onSubmit={form.onSubmit(onSubmit)}
					className='flex flex-col space-y-4'
					onClick={() => console.log(typeof form.values.interval_execution_day)}
				>
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
							onClick={() => router.push(PATHS.CREATE_INVOICE)}
						>
							<Group spacing='xl'>
								<div className='flex rounded-xl bg-primary/25'>
									<Image
										width={75}
										height={75}
										radius='md'
										src='/static/images/add-button.svg'
										alt='create invoice'
									/>
								</div>
								<Text weight='bold'>Create Invoice</Text>
							</Group>
						</Paper>
					) : (
						<Paper component='button' shadow='xs' p='lg' withBorder onClick={showInvUploadForm}>
							<Group spacing='xl'>
								<div className='flex rounded-xl bg-primary/25'>
									<Image
										width={75}
										height={75}
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
							<div className='flex rounded-xl bg-primary/25'>
								<Image
									width={75}
									height={75}
									radius='md'
									src='/static/images/add-button.svg'
									alt='Add invoice rate'
								/>
							</div>
							<Text weight='bold'>Upload proof of delivery</Text>
						</Group>
					</Paper>
				</form>
			</Stack>
		</Drawer>
	);
};

export default InvoiceForm;
