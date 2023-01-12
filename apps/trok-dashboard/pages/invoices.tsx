import React, { useCallback, useMemo, useState } from 'react';
import Page from '../layout/Page';
import { Button, Card, Loader, SimpleGrid, Space, Stack, Tabs } from '@mantine/core';
import InvoiceForm, { SectionState } from '../modals/invoices/InvoiceForm';
import { useForm } from '@mantine/form';
import { GBP, genInvoiceId } from '@trok-app/shared-utils';
import { trpc } from '../utils/clients';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { PATHS, SAMPLE_INVOICES } from '../utils/constants';
import InvoiceTable from '../containers/InvoiceTable';
import PODUploadForm from '../modals/invoices/PODUploadForm';
import InvoiceUploadForm from '../modals/invoices/InvoiceUploadForm';

const Invoices = ({ testMode, session_id, invoice_id }) => {
	const [activeTab, setActiveTab] = useState<string | null>('all');
	const [opened, setOpened] = useState(false);
	const [podOpened, setPODOpened] = useState(false);
	const [invUploadOpened, setInvUploadOpened] = useState(false);
	const [newInvoiceOpened, setNewInvoiceOpened] = useState(false);
	const [selectedInvoice, setSelectedInvoice] = useState(null);
	const [section, setSection] = useState<SectionState>('create');
	const [loading, setLoading] = useState(false);

	const invoicesQuery = trpc.getInvoices.useQuery({ userId: session_id }, { placeholderData: [] });

	const data = testMode ? SAMPLE_INVOICES : invoicesQuery.data;

	const form = useForm<{ pod: boolean; invoice: boolean }>({
		initialValues: {
			pod: false,
			invoice: false
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

	return (
		<Page.Container
			extraClassNames="overflow-hidden"
			header={
				<Page.Header>
					<span className='text-2xl font-medium'>Invoices</span>
					<Button className='' onClick={() => setNewInvoiceOpened(true)}>
						<span className='text-base font-normal'>New Invoice</span>
					</Button>
				</Page.Header>
			}
		>
			<InvoiceForm
				opened={newInvoiceOpened}
				onClose={() => setNewInvoiceOpened(false)}
				form={form}
				onSubmit={handleSubmit}
				loading={loading}
				section={section}
				setSection={setSection}
				showPODUploadForm={() => {
					setNewInvoiceOpened(false);
					setTimeout(() => setPODOpened(true), 100);
				}}
				showInvUploadForm={() => {
					setNewInvoiceOpened(false);
					setTimeout(() => setInvUploadOpened(true), 100);
				}}
				invoiceId={invoice_id}
			/>
			<PODUploadForm
				opened={podOpened}
				onClose={() => setPODOpened(false)}
				goBack={() => {
					setPODOpened(false);
					setTimeout(() => setNewInvoiceOpened(true), 100);
				}}
				form={form}
				invoiceId={invoice_id}
			/>
			<InvoiceUploadForm
				opened={invUploadOpened}
				onClose={() => setInvUploadOpened(false)}
				form={form}
				onSubmit={handleSubmit}
				loading={loading}
				goBack={() => {
					setInvUploadOpened(false);
					setTimeout(() => setNewInvoiceOpened(true), 100);
				}}
				invoiceId={invoice_id}
			/>
			<Page.Body extraClassNames=''>
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
				<div className="h-full">
					<Tabs
						value={activeTab}
						orientation='horizontal'
						onTabChange={setActiveTab}
						defaultValue='all'
						classNames={{
							root: 'h-full',
							tabsList: '',
							tab: 'mx-4',
							panel: 'h-full'
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
								data={data}
								loading={loading}
								setOpened={setOpened}
								selectInvoice={setSelectedInvoice}
							/>
						</Tabs.Panel>
						<Tabs.Panel value='awaiting'>
							<InvoiceTable
								data={data}
								loading={loading}
								setOpened={setOpened}
								selectInvoice={setSelectedInvoice}
							/>
						</Tabs.Panel>
						<Tabs.Panel value='approval'>
							<InvoiceTable
								data={data}
								loading={loading}
								setOpened={setOpened}
								selectInvoice={setSelectedInvoice}
							/>
						</Tabs.Panel>
						<Tabs.Panel value='paid'>
							<InvoiceTable
								data={data}
								loading={loading}
								setOpened={setOpened}
								selectInvoice={setSelectedInvoice}
							/>
						</Tabs.Panel>
					</Tabs>
				</div>
			</Page.Body>
		</Page.Container>
	);
};

export async function getServerSideProps({ req, res }) {
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
	const invoice_id = genInvoiceId();
	return {
		props: {
			session_id: session.id,
			invoice_id
		}
	};
}

export default Invoices;
