import React, { useCallback, useRef, useState } from 'react';
import { Dropzone, FileWithPath, MS_WORD_MIME_TYPE, PDF_MIME_TYPE } from '@mantine/dropzone';

import {
	ActionIcon,
	Button,
	Center,
	createStyles,
	Drawer,
	Group, NumberInput,
	Space,
	Text,
	TextInput,
	Title,
	Tooltip
} from '@mantine/core';
import { UNDER_TWENTY_FIVE_MB } from '../../utils/constants';
import { IconCalendar, IconCheck, IconCloudUpload, IconUpload, IconWand, IconX } from '@tabler/icons';
import DocumentInfo from '../../components/DocumentInfo';
import { TransformedValues, useForm, UseFormReturnType } from '@mantine/form';
import { generateUniqueInvoiceNumber, uploadFile } from '../../utils/functions';
import { InvoiceFormValues } from '../../utils/types';
import { trpc } from '../../utils/clients';
import { genInvoiceId, notifyError, notifySuccess } from '@trok-app/shared-utils';
import { DatePicker } from '@mantine/dates';
import dayjs from 'dayjs';

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
		margin: '30px 20px',
		position: 'relative',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center'
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

interface UploadFormValues {
	inv_number: string;
	invoice_date: string | Date | number;
	due_date: string | Date | number;
	customer_name: string;
	customer_email: string;
    total_amount: number;
}

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
	const utils = trpc.useContext();

	const createInvoiceMutation = trpc.invoice.createInvoice.useMutation({
		onSuccess: function(input) {
			utils.invoice.getInvoices.invalidate({ userId: sessionId });
		}
	});

	const form = useForm<UploadFormValues>({
		initialValues: {
			inv_number: '',
			invoice_date: '',
			due_date: '',
			customer_name: '',
            customer_email: '',
			total_amount: 0
		},
		validate: {
			inv_number: value => (invoiceNumberList.includes(value) ? 'This invoice number already exists' : null),
			invoice_date: value => !value ? 'Required' : null,
			due_date: value => !value ? 'Required' : null,
			customer_email: value => !value ? 'Required' : null,
			customer_name: value => !value ? 'Required' : null,
			total_amount: value => !value ? 'Required' : null,
		},
		transformValues: values => ({
			...values,
			invoice_date: dayjs(values.invoice_date).unix(),
			due_date: dayjs(values.due_date).unix(),
		})
	});

	type Transformed = TransformedValues<typeof form>;

	const handleSubmit = useCallback(
		async (values: Transformed) => {
			const invoice_id = genInvoiceId();
			console.log(values)
			setLoading(true);
			try {
				const filename = values.inv_number;
				const filepath = `${crn}/INVOICES/${invoice_id}/${filename}.pdf`;
				const invoiceUploaded = await uploadFile(file, filename, filepath);

				if (invoiceUploaded) {
					await createInvoiceMutation.mutateAsync({
						userId: sessionId,
						invoice_id,
						customer_name: values.customer_name,
						customer_email: values.customer_email,
						invoice_number: values.inv_number,
						invoice_date: Number(values.invoice_date),
						due_date: Number(values.due_date),
						line_items: [],
						notes: '-',
						subtotal: 0,
						total: 0,
						invoice_Upload_Filepath: filepath
					});
					globalForm.setFieldValue('invoice_id', invoice_id);
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
				notifyError('invoice-upload-error', error.message, <IconX size={20} />);
			}
		},
		[file, sessionId]
	);

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
				<div className='relative flex flex-col my-6 space-y-4'>
					<Group position='center' grow>
						<TextInput
							{...form.getInputProps('inv_number')}
							withAsterisk
							label='Invoice Number'
							placeholder='INV-##########'
							rightSection={
								<Tooltip label='Generate invoice number'>
									<ActionIcon
										variant='transparent'
										onClick={() => {
											const invoice_number = generateUniqueInvoiceNumber(invoiceNumberList);
											form.setFieldValue('inv_number', invoice_number);
										}}
									>
										<IconWand size={18} />
									</ActionIcon>
								</Tooltip>
							}
						/>
						<NumberInput
							hideControls
							precision={2}
							withAsterisk
							label="Amount Due"
							min={0}
							max={100000}
							parser={value => value.replace(/£\s?|(,*)/g, '')}
							formatter={value =>
								!Number.isNaN(parseFloat(value))
									? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
									: '£ '
							}
							{...form.getInputProps('total_amount')}
						/>
					</Group>
					<Group position='center' grow>
						<DatePicker
							withAsterisk
							label='Invoice Date'
							inputFormat='DD-MM-YYYY'
							placeholder='Pick a date'
							icon={<IconCalendar size={16} />}
							value={
								dayjs(form.values.invoice_date).isValid()
									? dayjs(form.values.invoice_date).toDate()
									: null
							}
							onChange={date => form.setFieldValue('invoice_date', date)}
							error={form.errors.invoice_date}
							allowLevelChange={false}
						/>
						<DatePicker
							withAsterisk
							label='Due Date'
							placeholder='Pick a date'
							icon={<IconCalendar size={16} />}
							value={dayjs(form.values.due_date).isValid() ? dayjs(form.values.due_date).toDate() : null}
							onChange={date => form.setFieldValue('due_date', date)}
							error={form.errors.due_date}
							inputFormat='DD-MM-YYYY'
							allowLevelChange={false}
							minDate={dayjs(form.values.invoice_date).add(1, 'd').toDate()}
						/>
					</Group>

					<Group position='center' grow>
						<TextInput
							withAsterisk
							label='Customer Name'
							{...form.getInputProps('customer_name')}
						/>
						<TextInput
							withAsterisk
							label='Customer Email'
							type="email"
							{...form.getInputProps('customer_email')}
						/>
					</Group>
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
					<Button type='submit' size='md' disabled={!file || form.values.inv_number == ''}>
						<Text weight='normal'>Upload</Text>
					</Button>
				</Group>
			</form>
		</Drawer>
	);
};

export default InvoiceUploadForm;
