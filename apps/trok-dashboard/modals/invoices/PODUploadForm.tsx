import React, { FormEvent, useCallback, useMemo, useRef, useState } from 'react';
import { Button, createStyles, Drawer, Image, Group, Space, Stack, Text, Title, SimpleGrid } from '@mantine/core';
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconCloudUpload, IconUpload, IconX, IconCheck } from '@tabler/icons';
import { TEN_MB } from '../../utils/constants';
import { notifyError, notifySuccess } from '@trok-app/shared-utils';
import { uploadFile } from '../../utils/functions';
import { trpc } from '../../utils/clients';
import { useSession } from 'next-auth/react';
import { UseFormReturnType } from '@mantine/form';
import { InvoiceFormValues } from '../../utils/types';

const useStyles = createStyles(theme => ({
	wrapper: {
		position: 'relative',
		marginBottom: 30
	},

	dropzone: {
		borderWidth: 1,
		paddingBottom: 50
	},

	icon: {
		color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[4]
	},

	control: {
		position: 'absolute',
		width: 250,
		left: 'calc(50% - 125px)',
		bottom: -20
	}
}));

function Preview(props: { file: FileWithPath }) {
	const imageUrl = props.file ? URL.createObjectURL(props.file) : null;
	return imageUrl ? (
		<Image src={imageUrl} imageProps={{ onLoad: () => URL.revokeObjectURL(imageUrl) }} />
	) : null;
}

interface PODUploadFormProps {
	opened: boolean,
	onClose: () => void;
	goBack: () => void;
	form: UseFormReturnType<InvoiceFormValues>;
}

const PODUploadForm = ({ opened, onClose, goBack, form }: PODUploadFormProps) => {
	const { data: session } = useSession();
	const [loading, setLoading] = useState(false);
	const [file, setFile] = useState<FileWithPath>(null);
	const { classes, theme } = useStyles();
	const openRef = useRef<() => void>(null);
	const { data: account } = trpc.getAccount.useQuery(
		{
			id: session?.id,
			stripe_account_id: session?.stripe?.account_id
		},
		{ enabled: !!session }
	);

	const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		try {
			if (!file) throw new Error('Please upload a proof of delivery photo before submitting.');
			const filename = encodeURIComponent(file.name);
			const filepath = `${account.business.business_crn}/INVOICES/${form.values.invoice}/POD/${filename}`;
			const url = await uploadFile(file, filename, filepath);
			setLoading(false);
			form.setFieldValue('pod', url)
			notifySuccess('upload-image-success', 'Proof of delivery uploaded successfully.', <IconCheck size={20} />);
			goBack()
		} catch (err) {
			console.error(err);
			setLoading(false);
			notifyError('upload-image-failed', err?.error?.message ?? err.message, <IconX size={20} />);
		}
	}, [file, account, form]);

	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			padding='xl'
			size='xl'
			position='right'
			classNames={{
				drawer: 'flex h-full items-center'
			}}
			transitionDuration={250}
			transitionTimingFunction='ease'
		>
			<form className='flex flex-col' onSubmit={handleSubmit}>
				<Title order={2} weight={500} mb='lg'>
					<span>Upload Proof of Delivery</span>
				</Title>
				<div className={classes.wrapper}>
					<Dropzone
						openRef={openRef}
						onDrop={file => {
							setFile(file[0]);
						}}
						onReject={file => {
							console.log('rejected files', file)
							notifyError('upload-pod-failed', `The file ${file} could not be uploaded. Please make sure your image is < 10Mb`, <IconX size={20}/>)

						}}
						maxSize={TEN_MB}
						className={classes.dropzone}
						accept={IMAGE_MIME_TYPE}
						loading={loading}
					>
						<Group position='center' spacing='xl' style={{ pointerEvents: 'none' }}>
							<Dropzone.Accept>
								<IconUpload
									size={50}
									stroke={1.5}
									color={theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6]}
								/>
							</Dropzone.Accept>
							<Dropzone.Reject>
								<IconX
									size={50}
									stroke={1.5}
									color={theme.colors.red[theme.colorScheme === 'dark' ? 4 : 6]}
								/>
							</Dropzone.Reject>
							<Dropzone.Idle>
								<IconCloudUpload
									size={50}
									color={theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black}
									stroke={1.5}
								/>
							</Dropzone.Idle>
						</Group>
						<Text align='center' weight={700} size='lg' mt='xl'>
							<Dropzone.Accept>Drop Image here</Dropzone.Accept>
							<Dropzone.Reject>Image file more than 10mb</Dropzone.Reject>
							<Dropzone.Idle>Upload Image</Dropzone.Idle>
						</Text>
						<Text align='center' size='sm' mt='xs' color='dimmed'>
							Drag&apos;n&apos;drop files here to upload. We can accept
							only <i>.png</i> and <i>.jpg</i>{' '}
							files that are less than 10mb in size.
						</Text>
					</Dropzone>
					<Button className={classes.control} size='md' radius='xl' onClick={() => openRef.current?.()}>
						Select file
					</Button>
				</div>
				<SimpleGrid py='xl' cols={3} breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
					<div />
					<Preview file={file} />
					<div />
				</SimpleGrid>
				<Space h='xl' />
				<Group position='right'>
					<Button type='button' variant='white' size='md' onClick={goBack}>
						<Text weight='normal'>Go Back</Text>
					</Button>
					<Button type='submit' size='md' disabled={!file} loading={loading}>
						<Text weight='normal'>Upload</Text>
					</Button>
				</Group>
			</form>
		</Drawer>
	);
};

export default PODUploadForm;
