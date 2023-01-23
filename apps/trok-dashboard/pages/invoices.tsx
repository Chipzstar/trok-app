import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Page from '../layout/Page';
import { Button, Card, Loader, SimpleGrid, Space, Stack, Tabs } from '@mantine/core';
import InvoiceForm from '../modals/invoices/InvoiceForm';
import { isEmail, useForm } from '@mantine/form';
import { GBP } from '@trok-app/shared-utils';
import { trpc } from '../utils/clients';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { PATHS, SAMPLE_INVOICES, STORAGE_KEYS } from '../utils/constants';
import InvoiceTable from '../containers/InvoiceTable';
import PODUploadForm from '../modals/invoices/PODUploadForm';
import InvoiceUploadForm from '../modals/invoices/InvoiceUploadForm';
import { InvoiceFormValues } from '../utils/types';
import SendInvoiceForm, { SendInvoiceFormValues } from '../modals/invoices/SendInvoiceForm';
import useWindowSize from '../hooks/useWindowSize';
import PreviewInvoice from '../modals/invoices/PreviewInvoice';
import prisma from '../prisma';

const Invoices = ({ testMode, session_id, invoice_id, business_CRN }) => {
	const { height } = useWindowSize();
	const [activeTab, setActiveTab] = useState<string | null>('all');
	const [podOpened, setPODOpened] = useState(false);
	const [invUploadOpened, setInvUploadOpened] = useState(false);
	const [invoiceOpened, setInvoiceOpened] = useState(false);
	const [invSendOpened, setInvSendOpened] = useState(false);
	const [invoicePreviewOpened, setInvoicePreviewOpened] = useState(false);
	const [loading, setLoading] = useState(false);

	const invoicesQuery = trpc.invoice.getInvoices.useQuery({ userId: session_id });

	const data = testMode ? SAMPLE_INVOICES : invoicesQuery.data ? invoicesQuery.data.filter(i => !i.deleted) : [];

	const allInvoiceNumber = data.map(invoice => {
		return invoice.invoice_number;
	});

	const invoice_form = useForm<InvoiceFormValues>({
		initialValues: {
			// indicator on whether the invoice was created using the form or was uploaded by the user
			type: 'create',
			// represents the invoice_id of a created / uploaded invoice
			invoice_id: null,
			// stores the storage url of proof of delivery of photo(s)
			pod: null,
			// represents the current invoice object stored in the backend,
			invoice: null,
			// indicates that the user clicked the "New Invoice" button and is not expanding an existing invoice
			new: true
		}
	});

	const send_invoice_form = useForm<SendInvoiceFormValues>({
		initialValues: {
			to: '',
			from: '',
			subject: '',
			bodyText: '',
			bodyHTML:
				`<p>Hello [recipient name],</p><p>We hope that you are well. The invoice for [your product/service] is attached. ` +
				"If you have any comments or questions, please feel free to contact us when it's more convenient for you at:" +
				'</p><p>[your contact information]</p><p>We really appreciate choosing to do business with us at [your business name]' +
				'</p><p>Best regards,</p><p>[Your name]</p><p>[Your title]</p><p>[Your business name]</p>'
		},
		validate: {
			to: isEmail('Invalid email'),
			from: isEmail('Invalid email'),
			subject: value => (!value ? 'Required' : null)
		}
	});

	/*
	 * TODO - Omar ignore this handler, this handler will be for sending a notification to the team that a new invoice
	 *  has been submitted (for uploaded and created invoices). The one you have to complete is inside the InvoiceUploadForm.tsx file
	 */
	const handleSubmit = useCallback(async values => {
		console.log(values);
	}, []);

	const unpaid_approved_invoices = useMemo(() => {
		if (testMode) {
			return GBP(1256576).format();
		} else {
			const sum = invoicesQuery.data?.reduce((prev, curr) => {
				if (curr.paid_status === 'unpaid' && curr.approved) {
					return prev + curr.amount_due;
				} else {
					return prev;
				}
			}, 0);
			return GBP(sum).format();
		}
	}, [invoicesQuery.data, testMode]);

	const unpaid_unapproved_invoices = useMemo(() => {
		if (testMode) {
			return GBP(256576).format();
		} else {
			const sum = invoicesQuery.data?.reduce((prev, curr) => {
				if (curr.paid_status === 'unpaid' && !curr.approved) {
					return prev + curr.amount_due;
				} else {
					return prev;
				}
			}, 0);
			return GBP(sum).format();
		}
	}, [invoicesQuery.data, testMode]);

	const unpaid_invoices = useMemo(() => {
		if (testMode) {
			return GBP(1256576 + 256576).format();
		} else {
			const sum = invoicesQuery.data?.reduce((prev, curr) => {
				if (curr.paid_status === 'unpaid') {
					return prev + curr.amount_due;
				} else {
					return prev;
				}
			}, 0);
			return GBP(sum).format();
		}
	}, [invoicesQuery.data, testMode]);

	/**
	 * On page mount, grab existing values in local storage and update invoice form
	 */
	useEffect(() => {
		const storedValue = window.localStorage.getItem(STORAGE_KEYS.INVOICE_FORM);
		if (storedValue) {
			try {
				invoice_form.setValues(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.INVOICE_FORM)));
			} catch (e) {
				console.log('Failed to parse stored value');
			}
		}
	}, []);

	/**
	 * Sync Form changes with local storage form
	 */
	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEYS.INVOICE_FORM, JSON.stringify(invoice_form.values));
	}, [invoice_form.values]);

	/**
	 * "Auto-opens" the invoice form after user has created a fresh new invoice from the create-invoice page
	 */
	useEffect(() => {
		if (invoice_form.values.new && invoice_form.values.invoice_id) setInvoiceOpened(true);
	}, [invoice_form.values.invoice_id, invoice_form.values.new]);

	return (
		<Page.Container
			extraClassNames=''
			header={
				<Page.Header>
					<span className='text-2xl font-medium'>Invoices</span>
					<Button
						className=''
						onClick={() => {
							invoice_form.reset();
							setInvoiceOpened(true);
						}}
					>
						<span className='text-base font-normal'>New Invoice</span>
					</Button>
				</Page.Header>
			}
		>
			<InvoiceForm
				opened={invoiceOpened}
				onClose={() => setInvoiceOpened(false)}
				form={invoice_form}
				onSubmit={handleSubmit}
				loading={loading}
				showPODUploadForm={() => {
					setInvoiceOpened(false);
					setTimeout(() => setPODOpened(true), 100);
				}}
				showInvUploadForm={() => {
					setInvoiceOpened(false);
					setTimeout(() => setInvUploadOpened(true), 100);
				}}
			/>
			<PODUploadForm
				opened={podOpened}
				onClose={() => setPODOpened(false)}
				goBack={() => {
					setPODOpened(false);
					setTimeout(() => setInvoiceOpened(true), 100);
				}}
				form={invoice_form}
			/>
			<InvoiceUploadForm
				opened={invUploadOpened}
				onClose={() => setInvUploadOpened(false)}
				globalForm={invoice_form}
				goBack={() => {
					setInvUploadOpened(false);
					setTimeout(() => setInvoiceOpened(true), 100);
				}}
				invoiceNumberList={allInvoiceNumber}
				crn={business_CRN}
				sessionId={session_id}
			/>
			<SendInvoiceForm
				opened={invSendOpened}
				onClose={() => setInvSendOpened(false)}
				form={send_invoice_form}
				FORM={invoice_form}
			/>
			<PreviewInvoice
				opened={invoicePreviewOpened}
				onClose={() => setInvoicePreviewOpened(false)}
				form={send_invoice_form}
				FORM={invoice_form}
			/>
			<Page.Body>
				<SimpleGrid cols={3} spacing='lg' breakpoints={[{ maxWidth: 600, cols: 1, spacing: 'sm' }]}>
					<Card shadow='sm' py={0} radius='xs'>
						<Stack px='md' py='md' spacing='xs'>
							<span className='text-base'>Unpaid Approved Invoices</span>
							{!testMode && invoicesQuery.isLoading ? (
								<Loader size='sm' />
							) : (
								<span className='heading-1'>
									{unpaid_approved_invoices.split('.')[0]}.
									<span className='text-base'>{unpaid_approved_invoices.split('.')[1]}</span>
								</span>
							)}
						</Stack>
					</Card>
					<Card shadow='sm' py={0} radius='xs'>
						<Stack px='md' py='md' spacing='xs'>
							<span className='text-base'>Unpaid Unapproved Invoices</span>
							{!testMode && invoicesQuery.isLoading ? (
								<Loader size='sm' />
							) : (
								<span className='heading-1'>
									{unpaid_unapproved_invoices.split('.')[0]}.
									<span className='text-base'>{unpaid_unapproved_invoices.split('.')[1]}</span>
								</span>
							)}
						</Stack>
					</Card>
					<Card shadow='sm' py={0} radius='xs'>
						<Stack px='md' py='md' spacing='xs'>
							<span className='text-base'>Unpaid Invoices</span>
							{!testMode && invoicesQuery.isLoading ? (
								<Loader size='sm' />
							) : (
								<span className='heading-1'>
									{unpaid_invoices.split('.')[0]}.
									<span className='text-base'>{unpaid_invoices.split('.')[1]}</span>
								</span>
							)}
						</Stack>
					</Card>
				</SimpleGrid>
				<Space py='md' />
				<div className='flex h-full flex-col'>
					<Tabs
						value={activeTab}
						orientation='horizontal'
						onTabChange={setActiveTab}
						defaultValue='all'
						classNames={{
							root: 'grow',
							tabsList: '',
							tab: 'mx-4'
						}}
						styles={{
							panel: {
								height: height - 256
							}
						}}
					>
						<Tabs.List>
							<Tabs.Tab value='all'>All Invoices</Tabs.Tab>
							<Tabs.Tab value='approval'>Needs Approval</Tabs.Tab>
							<Tabs.Tab value='awaiting'>Awaiting Payments</Tabs.Tab>
							<Tabs.Tab value='paid'>Paid</Tabs.Tab>
						</Tabs.List>

						<Tabs.Panel value='all'>
							<InvoiceTable
								showPODUpload={setPODOpened}
								data={data}
								form={invoice_form}
								loading={loading}
								setOpened={setInvoiceOpened}
								showSendInvoice={setInvSendOpened}
							/>
						</Tabs.Panel>
						<Tabs.Panel value='approval'>
							<InvoiceTable
								showPODUpload={setPODOpened}
								data={data}
								form={invoice_form}
								loading={loading}
								setOpened={setInvoiceOpened}
								showSendInvoice={setInvSendOpened}
							/>
						</Tabs.Panel>
						<Tabs.Panel value='awaiting'>
							<InvoiceTable
								showPODUpload={setPODOpened}
								data={data}
								form={invoice_form}
								loading={loading}
								setOpened={setInvoiceOpened}
								showSendInvoice={setInvSendOpened}
							/>
						</Tabs.Panel>
						<Tabs.Panel value='paid'>
							<InvoiceTable
								showPODUpload={setPODOpened}
								data={data}
								form={invoice_form}
								loading={loading}
								setOpened={setInvoiceOpened}
								showSendInvoice={setInvSendOpened}
							/>
						</Tabs.Panel>
					</Tabs>
				</div>
			</Page.Body>
		</Page.Container>
	);
};

export async function getServerSideProps({ req, res, query }) {
	const session = await unstable_getServerSession(req, res, authOptions);
	// check if the user is authenticated, it not, redirect back to login page
	if (!session) {
		return {
			redirect: {
				destination: PATHS.LOGIN,
				permanent: false
			}
		};
	}
	const userCRN = await prisma.user.findFirst({
		where: {
			id: session.id
		}
	});

	return {
		props: {
			session_id: session.id,
			invoice_id: query['invoice-id'] ?? '',
			business_CRN: userCRN.business.business_crn
		}
	};
}

export default Invoices;
