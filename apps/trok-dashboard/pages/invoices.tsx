import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Page from '../layout/Page';
import { Button, Card, Loader, SimpleGrid, Space, Stack, Tabs } from '@mantine/core';
import InvoiceForm from '../modals/invoices/InvoiceForm';
import { useForm } from '@mantine/form';
import { GBP } from '@trok-app/shared-utils';
import { trpc } from '../utils/clients';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { PATHS, SAMPLE_INVOICES, STORAGE_KEYS } from '../utils/constants';
import InvoiceTable from '../containers/InvoiceTable';
import PODUploadForm from '../modals/invoices/PODUploadForm';
import InvoiceUploadForm from '../modals/invoices/InvoiceUploadForm';
import { InvoiceFormValues, InvoiceSectionState } from '../utils/types';

const Invoices = ({ testMode, session_id, invoice_id }) => {
	const [activeTab, setActiveTab] = useState<string | null>('all');
	const [podOpened, setPODOpened] = useState(false);
	const [invUploadOpened, setInvUploadOpened] = useState(false);
	const [invoiceOpened, setInvoiceOpened] = useState(false);
	const [selectedInvoice, setSelectedInvoice] = useState(null);
	const [loading, setLoading] = useState(false);

	const invoicesQuery = trpc.getInvoices.useQuery({ userId: session_id });

	const data = testMode ? SAMPLE_INVOICES : invoicesQuery.data ? invoicesQuery.data.filter(i => !i.deleted) : [];

	const form = useForm<InvoiceFormValues>({
		initialValues: {
			type: 'create',
			pod: null,
			invoice: null
		}
	});

	const handleSubmit = useCallback(async values => {
		console.log(values);
	}, []);

	const unpaid_approved_invoices = useMemo(() => {
		if (testMode) {
			return GBP(1256576).format();
		} else {
			return GBP(0).format();
		}
	}, [testMode]);

	const unpaid_unapproved_invoices = useMemo(() => {
		if (testMode) {
			return GBP(256576).format();
		} else {
			return GBP(0).format();
		}
	}, [testMode]);

	const unpaid_invoices = useMemo(() => {
		if (testMode) {
			return GBP(1256576 + 256576).format();
		} else {
			return GBP(0).format();
		}
	}, [testMode]);

	/**
	 * On page mount, grab existing values in local storage and update invoice form
	 */
	useEffect(() => {
		const storedValue = window.localStorage.getItem(STORAGE_KEYS.INVOICE_FORM);
		if (storedValue) {
			try {
				form.setValues(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.INVOICE_FORM)));
			} catch (e) {
				console.log('Failed to parse stored value');
			}
		}
	}, []);

	/**
	 * Sync Form changes with local storage form
	 */
	useEffect(() => {
		form.values.invoice && setInvoiceOpened(true);
		window.localStorage.setItem(STORAGE_KEYS.INVOICE_FORM, JSON.stringify(form.values));
	}, [form.values]);

	return (
		<Page.Container
			extraClassNames=''
			header={
				<Page.Header>
					<span className='text-2xl font-medium'>Invoices</span>
					<Button className='' onClick={() => setInvoiceOpened(true)}>
						<span className='text-base font-normal'>New Invoice</span>
					</Button>
				</Page.Header>
			}
		>
			<InvoiceForm
				opened={invoiceOpened}
				onClose={() => setInvoiceOpened(false)}
				form={form}
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
				selectedInvoice={selectedInvoice}
			/>
			<PODUploadForm
				opened={podOpened}
				onClose={() => setPODOpened(false)}
				goBack={() => {
					setPODOpened(false);
					setTimeout(() => setInvoiceOpened(true), 100);
				}}
				form={form}
			/>
			<InvoiceUploadForm
				opened={invUploadOpened}
				onClose={() => setInvUploadOpened(false)}
				form={form}
				onSubmit={handleSubmit}
				loading={loading}
				goBack={() => {
					setInvUploadOpened(false);
					setTimeout(() => setInvoiceOpened(true), 100);
				}}
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
				<div className='h-full flex flex-col'>
					<Tabs
						value={activeTab}
						orientation='horizontal'
						onTabChange={setActiveTab}
						defaultValue='all'
						classNames={{
							root: 'grow',
							tabsList: '',
							tab: 'mx-4',
							panel: ''
						}}
					>
						<Tabs.List>
							<Tabs.Tab value='all'>All Invoices</Tabs.Tab>
							<Tabs.Tab value='awaiting'>Awaiting Payments</Tabs.Tab>
							<Tabs.Tab value='approval'>Needs Approval</Tabs.Tab>
							<Tabs.Tab value='paid'>Paid</Tabs.Tab>
						</Tabs.List>

						<Tabs.Panel value='all'>
							<InvoiceTable
								showPODUpload={setPODOpened}
								data={data}
								loading={loading}
								setOpened={setInvoiceOpened}
								selectInvoice={setSelectedInvoice}
							/>
						</Tabs.Panel>
						<Tabs.Panel value='awaiting'>
							<InvoiceTable
								showPODUpload={setPODOpened}
								data={data}
								loading={loading}
								setOpened={setInvoiceOpened}
								selectInvoice={setSelectedInvoice}
							/>
						</Tabs.Panel>
						<Tabs.Panel value='approval'>
							<InvoiceTable
								showPODUpload={setPODOpened}
								data={data}
								loading={loading}
								setOpened={setInvoiceOpened}
								selectInvoice={setSelectedInvoice}
							/>
						</Tabs.Panel>
						<Tabs.Panel value='paid'>
							<InvoiceTable
								showPODUpload={setPODOpened}
								data={data}
								loading={loading}
								setOpened={setInvoiceOpened}
								selectInvoice={setSelectedInvoice}
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
	console.log(query)
	// check if the user is authenticated, it not, redirect back to login page
	if (!session) {
		return {
			redirect: {
				destination: PATHS.LOGIN,
				permanent: false
			}
		};
	}
	return {
		props: {
			session_id: session.id,
			invoice_id: query['invoice-id'] ?? ""
		}
	};
}

export default Invoices;
