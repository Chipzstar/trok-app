import React, { useCallback, useMemo, useRef, useState } from 'react';
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
import { UNDER_TWENTYFIVE_MB } from '../../utils/constants';
import { IconCloudUpload, IconUpload, IconWand, IconX } from '@tabler/icons';
import DocumentInfo from '../../components/DocumentInfo';
import { UseFormReturnType, useForm } from '@mantine/form';
import { uploadFile } from '../../utils/functions';
import { uuid4 } from '@sentry/utils';
import { InvoiceFormValues } from '../../utils/types';
import { trpc } from '../../utils/clients';
import { INVOICE_STATUS } from '../../../../libs/shared-utils/src';
import { generateDownloadUrl } from '../../../trok-backend/src/app/helpers/gcp';

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
	loading: boolean;
	goBack: () => void;
	invoiceNumberList: string[];
	crn: string;
	globalForm: UseFormReturnType<InvoiceFormValues>;
	sessionId: string;
}

const InvoiceUploadForm = ({ opened, onClose, loading, goBack, invoiceNumberList, crn, globalForm, sessionId }: Props) => {
	const [file, setFile] = useState<FileWithPath>(null);
	const { classes, theme } = useStyles();
	const openRef = useRef<() => void>(null);
	const utils = trpc.useContext()

	console.log('upload comp', invoiceNumberList);

	const createInvoiceMutation = trpc.invoice.createInvoice.useMutation({
		onSuccess: function (input) {
			utils.invoice.getInvoices.invalidate({ userId: sessionId });
		}
	});

	const updateMutation = trpc.invoice.updateInvoice.useMutation({
		onSuccess: function (input) {
			utils.invoice.getInvoices
				.invalidate({ userId: sessionId })
				.then(r => console.log(input, 'Invoices refetched'));
		}
	});

	const form = useForm({
		initialValues: {
			invNumber: ''
		},

		validate: {
			invNumber: value => (checkInvoiceNumberExits(value) ? 'This invoice number already exists' : null)
		}
	});

	const handleSubmit = useCallback(async () => {
		const invocieId = uuid4();
		// TODO - Omar complete logic for uploading invoice
		try {
			const filename = form.values.invNumber;
			const filepath = `${crn}/INVOICES/${filename}`;
			const invoiceUploaded = await uploadFile(file, filename, filepath);

			if (invoiceUploaded) {
				await createInvoiceMutation.mutateAsync({
					userId: sessionId,
					invoice_id: '-',
					invoice_number: form.values.invNumber,
					invoice_date: 0,
					due_date: 0,
					line_items: [],
					notes: '-',
					subtotal: 0,
					total: 0,
				})
				
				globalForm.setFieldValue('invoice_id', invocieId)
				updateMutation.mutateAsync({
					invoice_id: invocieId,
					userId: sessionId,
					status: INVOICE_STATUS.PROCESSING
				})
				goBack();
			}
		} catch (error) {
			throw new Error('Error uploading file');
		}
	}, [file, sessionId]);

	const checkInvoiceNumberExits = (invNumber: string) => {
		return invoiceNumberList.includes(invNumber);
	};

	const generateUniqueInvoiceNumber = () => {
		const numInvoices = invoiceNumberList.length;
		if (invoiceNumberList.length == 0) {
			form.setFieldValue(
				'invNumber',
				`INV-${String(numInvoices + 1).padStart(6, '0')}`
			)
			return `INV-${String(numInvoices + 1).padStart(6, '0')}`;
		} else {
			let count = 1;
			let generatedInvoiceNum = `INV-${String(numInvoices + count).padStart(6, '0')}`;
			while (checkInvoiceNumberExits(generatedInvoiceNum)) {
				count++;
				generatedInvoiceNum = `INV-${String(numInvoices + count).padStart(6, '0')}`;
			}

			form.setFieldValue(
				'invNumber',
				`INV-${String(numInvoices + 1).padStart(6, '0')}`
			)
		}
	};

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
			<form className='flex flex-col' onSubmit={form.onSubmit(values => handleSubmit())}>
				<Title order={2} weight={500}>
					<span>Upload Invoice</span>
				</Title>

				<div className={classes.invoiceInput}>
					<TextInput
						{...form.getInputProps('invNumber')}
						withAsterisk
						// value={invNumber}
						label='Invoice Number'
						placeholder='INV-##########'
						rightSection={
							<Tooltip label='Generate invoice number'>
								<ActionIcon
									variant='transparent'
									onClick={() => {
										generateUniqueInvoiceNumber()
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
						maxSize={UNDER_TWENTYFIVE_MB}
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
