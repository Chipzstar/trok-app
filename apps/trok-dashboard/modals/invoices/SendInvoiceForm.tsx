import React, { useCallback, useEffect, useState } from 'react';
import { Button, Group, Input, Modal, Stack, Text, TextInput } from '@mantine/core';
import { isEmail, useForm, UseFormReturnType } from '@mantine/form';
import { InvoiceFormValues } from '../../utils/types';
import { Link, RichTextEditor } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { trpc } from '../../utils/clients';
import { IconCheck, IconX } from '@tabler/icons';
import { notifyError, notifySuccess } from '@trok-app/shared-utils';
import dayjs from 'dayjs';
import { useSession } from 'next-auth/react';

export interface SendInvoiceFormValues {
	from: string;
	to: string;
	subject: string;
	bodyText: string;
	bodyHTML: string;
}

interface Props {
	opened: boolean;
	onClose: () => void;
	FORM: UseFormReturnType<InvoiceFormValues>;
}

const SendInvoiceForm = ({ opened, onClose, FORM }: Props) => {
	const { data: session } = useSession();
	const [loading, setLoading] = useState(false);
	const sendInvoiceMutation = trpc.invoice.sendInvoice.useMutation();

	const form = useForm<SendInvoiceFormValues>({
		initialValues: {
			to: '',
			from: '',
			subject: '',
			bodyText: '',
			bodyHTML:
				`<p>Hello [recipient name],</p><p>We hope that you are well. The invoice for [your product/service] is attached. ` +
				"If you have any comments or questions, please feel free to contact us when it's more convenient for you at:" +
				"</p><p>[your contact information]</p><p>We really appreciate choosing to do business with us at [your business name]" +
				"</p><p>Best regards,</p><p>[Your name]</p><p>[Your title]</p><p>[Your business name]</p>"
		},
		validate: {
			to: isEmail('Invalid email'),
			from: isEmail('Invalid email'),
			subject: value => (!value ? 'Required' : null)
		}
	});

	const handleSubmit = useCallback(
		async values => {
			setLoading(true);
			console.log(values);
			try {
				await sendInvoiceMutation.mutateAsync({
					userId: session?.id,
					invoice_id: FORM.values.invoice_id,
					to: values.to,
					from: values.from,
					subject: values.subject,
					bodyText: values.bodyText,
					bodyHTML: values.bodyHTML
				});
				setLoading(false);
				notifySuccess('send-invoice-success', 'Invoice sent successfully!', <IconCheck size={20} />);
				onClose();
			} catch (err) {
				setLoading(false);
				console.error(err);
				notifyError('send-invoice-failed', err.message, <IconX size={20} />);
			}
		},
		[session, FORM.values]
	);

	const editor = useEditor({
		extensions: [StarterKit, Underline, Link, TextAlign.configure({ types: ['heading', 'paragraph'] })],
		content: form.values.bodyHTML,
		onUpdate: e => {
			console.log(e.editor.getText());
			console.log(e.editor.getHTML());
			form.setFieldValue('bodyText', e.editor.getText());
			form.setFieldValue('bodyHTML', e.editor.getHTML());
		}
	});

	useEffect(() => {
		form.setFieldValue('from', session?.user?.email);
		form.setFieldValue(
			'subject',
			`Invoice ${FORM.values.invoice?.invoice_number} for ${FORM.values.invoice?.customer_name} due ${dayjs
				.unix(FORM.values.invoice?.due_date)
				.format('DD-MM-YYYY')}`
		);
	}, [session, FORM.values]);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			centered
			padding='lg'
			size='xl'
			title='Send Invoice'
			styles={{
				title: {
					fontSize: 24,
					fontWeight: 500
				},
				header: {
					paddingBottom: 8,
					borderBottom: '1px solid #E5E5E5'
				}
			}}
		>
			<form onSubmit={form.onSubmit(handleSubmit)} className='flex flex-col space-y-4'>
				<Stack>
					<Group grow align='center'>
						<TextInput label='To' maxLength={50} withAsterisk {...form.getInputProps('to')} />
						<TextInput
							styles={{
								input: {
									backgroundColor: 'rgba(230,230,230)'
								}
							}}
							readOnly
							label='From'
							maxLength={50}
							withAsterisk
							{...form.getInputProps('from')}
						/>
					</Group>
					<TextInput label='Subject' maxLength={100} withAsterisk {...form.getInputProps('subject')} />
					<div>
						<Input.Label required>Body</Input.Label>
						<RichTextEditor editor={editor}>
							<RichTextEditor.Toolbar sticky stickyOffset={60}>
								<RichTextEditor.ControlsGroup>
									<RichTextEditor.Bold />
									<RichTextEditor.Italic />
									<RichTextEditor.Underline />
									<RichTextEditor.Strikethrough />
									<RichTextEditor.ClearFormatting />
									<RichTextEditor.Code />
								</RichTextEditor.ControlsGroup>

								<RichTextEditor.ControlsGroup>
									<RichTextEditor.H1 />
									<RichTextEditor.H2 />
									<RichTextEditor.H3 />
									<RichTextEditor.H4 />
								</RichTextEditor.ControlsGroup>

								<RichTextEditor.ControlsGroup>
									<RichTextEditor.Blockquote />
									<RichTextEditor.Hr />
									<RichTextEditor.BulletList />
									<RichTextEditor.OrderedList />
								</RichTextEditor.ControlsGroup>

								<RichTextEditor.ControlsGroup>
									<RichTextEditor.Link />
									<RichTextEditor.Unlink />
								</RichTextEditor.ControlsGroup>

								<RichTextEditor.ControlsGroup>
									<RichTextEditor.AlignLeft />
									<RichTextEditor.AlignCenter />
									<RichTextEditor.AlignJustify />
									<RichTextEditor.AlignRight />
								</RichTextEditor.ControlsGroup>
							</RichTextEditor.Toolbar>

							<RichTextEditor.Content />
						</RichTextEditor>
					</div>
				</Stack>
				<Group position='right'>
					<Button
						variant='outline'
						type='button'
						onClick={onClose}
						styles={{
							root: {
								width: 90
							}
						}}
					>
						<Text weight={500}>Cancel</Text>
					</Button>
					<Button
						disabled
						type='submit'
						loading={loading}
						styles={{
							root: {
								width: 90
							}
						}}
					>
						<Text weight={500}>Preview</Text>
					</Button>
					<Button
						disabled={!form.isDirty()}
						type='submit'
						loading={loading}
						styles={{
							root: {
								width: 90
							}
						}}
					>
						<Text weight={500}>Send</Text>
					</Button>
				</Group>
			</form>
		</Modal>
	);
};

export default SendInvoiceForm;
