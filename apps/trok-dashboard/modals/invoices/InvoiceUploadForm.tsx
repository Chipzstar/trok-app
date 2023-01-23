import React, { useCallback, useRef, useState } from 'react';
import { Dropzone, FileWithPath, MS_WORD_MIME_TYPE, PDF_MIME_TYPE } from '@mantine/dropzone';

import {
	ActionIcon,
	Button,
	Center,
	createStyles,
	Drawer,
	Group,
	Space,
	Text,
	TextInput,
	Title,
	Tooltip
} from '@mantine/core';
import { UNDER_TWENTY_FIVE_MB } from '../../utils/constants';
import { IconCheck, IconCloudUpload, IconUpload, IconWand, IconX } from '@tabler/icons';
import DocumentInfo from '../../components/DocumentInfo';
import { useForm, UseFormReturnType } from '@mantine/form';
import { generateUniqueInvoiceNumber, uploadFile } from '../../utils/functions';
import { InvoiceFormValues } from '../../utils/types';
import { trpc } from '../../utils/clients';
import { genInvoiceId, notifyError, notifySuccess } from '@trok-app/shared-utils';

const useStyles = createStyles(theme => ({
	wrapper: {
		position: 'relative',
		marginBottom: 30
	},

	dropzone: {
		borderWidth: 1,
		paddingBottom: 50
	},

	invoiceInput: {
		margin: '30px 0',
		position: 'relative'
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

interface Props {
	opened: boolean;
	onClose: () => void;
	goBack: () => void;
	invoiceNumberList: string[];
	crn: string;
	globalForm: UseFormReturnType<InvoiceFormValues>;
	sessionId: string;
}

const InvoiceUploadForm = ({ opened, onClose, goBack, invoiceNumberList, crn, globalForm, sessionId }: Props) => {
	const [loading, setLoading] = useState(false);
	const [file, setFile] = useState<FileWithPath>(null);
	const { classes, theme } = useStyles();
	const openRef = useRef<() => void>(null);
	const utils = trpc.useContext()

	const createInvoiceMutation = trpc.invoice.createInvoice.useMutation({
		onSuccess: function (input) {
			utils.invoice.getInvoices.invalidate({ userId: sessionId });
		}
	});

	const form = useForm({
		initialValues: {
			invNumber: ''
		},
		validate: {
			invNumber: value => (invoiceNumberList.includes(value) ? 'This invoice number already exists' : null)
		}
	});

	const handleSubmit = useCallback(async (values) => {
		const invoice_id = genInvoiceId();
		setLoading(true)
		try {
			const filename = values.invNumber;
			const filepath = `${crn}/INVOICES/${invoice_id}/${filename}.pdf`;
			const invoiceUploaded = await uploadFile(file, filename, filepath);

			if (invoiceUploaded) {
				await createInvoiceMutation.mutateAsync({
					userId: sessionId,
					invoice_id,
					invoice_number: values.invNumber,
					invoice_date: 0,
					due_date: 0,
					line_items: [],
					notes: '-',
					subtotal: 0,
					total: 0,
					invoice_Upload_Filepath: filepath
				})
				globalForm.setFieldValue('invoice_id', invoice_id)
				setLoading(false);
				notifySuccess(
					'invoice-upload-success',
					'Invoice has been uploaded successfully and saved as a draft',
					<IconCheck size={20} />
				);
				goBack();
			} else {
				throw new Error('Error uploading file');
			}
		} catch (error) {
			setLoading(false);
			notifyError('invoice-upload-error', error.message, <IconX size={20}/>)
		}
	}, [file, sessionId]);

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
			<form className='flex flex-col' onSubmit={form.onSubmit(handleSubmit)}>
				<Title order={2} weight={500}>
					<span>Upload Invoice</span>
				</Title>

				<div className={classes.invoiceInput}>
					<TextInput
						{...form.getInputProps('invNumber')}
						withAsterisk
						label='Invoice Number'
						placeholder='INV-##########'
						rightSection={
							<Tooltip label='Generate invoice number'>
								<ActionIcon
									variant='transparent'
									onClick={() => {
										const invoice_number = generateUniqueInvoiceNumber(invoiceNumberList)
										form.setFieldValue(
											'invNumber',
											invoice_number
										)
									}}
								>
									<IconWand size={18} />
								</ActionIcon>
							</Tooltip>
						}
					/>
				</div>
				<div className={classes.wrapper}>
					<Dropzone
						openRef={openRef}
						onDrop={file => setFile(file[0])}
						onReject={files => console.log('rejected files', files)}
						maxSize={UNDER_TWENTY_FIVE_MB}
						className={classes.dropzone}
						accept={[...PDF_MIME_TYPE, ...MS_WORD_MIME_TYPE]}
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
							<Dropzone.Idle>Upload PDF</Dropzone.Idle>
						</Text>
						<Text align='center' size='sm' mt='xs' color='dimmed'>
							Drag&apos;n&apos;drop files here to upload. We can accept only <i>.pdf</i> and <i>.docx</i>
							&nbsp;files that are less than 25mb in size.
						</Text>
					</Dropzone>
					<Button className={classes.control} size='md' radius='xl' onClick={() => openRef.current?.()}>
						{file ? 'Change file' : 'Select file'}
					</Button>
				</div>
				{file && (
					<Center>
						<DocumentInfo fileInfo={file} />
					</Center>
				)}
				<Space h='xl' />
				<Group position='right'>
					<Button type='button' variant='white' size='md' onClick={goBack}>
						<Text weight='normal'>Go Back</Text>
					</Button>
					<Button type='submit' size='md' disabled={!file || (form.values.invNumber == '')}>
						<Text weight='normal'>Upload</Text>
					</Button>
				</Group>
			</form>
		</Drawer>
	);
};

export default InvoiceUploadForm;
