import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import Page from '../layout/Page';
import {
	ActionIcon,
	Anchor,
	Avatar,
	Breadcrumbs,
	Button,
	Card,
	Center,
	createStyles,
	Divider,
	Group,
	MantineColor,
	Menu,
	NumberInput,
	Select,
	SelectItemProps,
	SimpleGrid,
	Space,
	Stack,
	Table,
	Text,
	Textarea,
	TextInput
} from '@mantine/core';
import { PATHS } from '../utils/constants';
import { useRouter } from 'next/router';
import { DatePicker } from '@mantine/dates';
import {
	IconCalendar,
	IconCheck,
	IconCirclePlus,
	IconGripVertical,
	IconPencil,
	IconSearch,
	IconTrash,
	IconUserPlus,
	IconX
} from '@tabler/icons';
import Prisma from '@prisma/client';
import dayjs from 'dayjs';
import { useForm } from '@mantine/form';
import { LineItem } from '../utils/types';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { GBP, notifyError, notifySuccess } from '@trok-app/shared-utils';
import NewCustomerForm, { CustomerFormValues } from '../modals/invoices/NewCustomerForm';
import NewLineItemForm, { LineItemFormValues } from '../modals/invoices/NewLineItemForm';
import { trpc } from '../utils/clients';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import NewTaxRateForm, { TaxRateFormValues } from '../modals/invoices/NewTaxRateForm';

interface CreateInvoiceForm {
	customer: string;
	invoice_date: string | Date;
	due_date: string | Date;
	invoice_number: string;
	line_items: LineItem[];
	tax_rate: Prisma.TaxRate;
}

interface ItemProps extends SelectItemProps {
	color: MantineColor;
	name: string;
	company: string;
	email: string;
}

const AutoCompleteItem = forwardRef<HTMLDivElement, ItemProps>(
	({ company, label, value, ...others }: ItemProps, ref) => (
		<div ref={ref} {...others}>
			<Group noWrap>
				<Avatar
					size={30}
					radius={40}
					classNames={{
						placeholder: 'bg-transparent'
					}}
				/>
				<div>
					<Text>{value}</Text>
					<Text size='xs' color='dimmed'>
						{company}
					</Text>
				</div>
			</Group>
		</div>
	)
);

AutoCompleteItem.displayName = 'AuoCompleteItem';

const useStyles = createStyles(theme => ({
	header: {
		position: 'sticky',
		top: 0,
		backgroundColor: theme.white,
		transition: 'box-shadow 150ms ease',
		zIndex: 100,

		'&::after': {
			content: '""',
			position: 'absolute',
			left: 0,
			right: 0,
			bottom: 0,
			borderBottom: `1px solid ${theme.colors.gray[2]}`
		}
	},
	scrolled: {
		boxShadow: theme.shadows.sm
	}
}));

const default_line_item: LineItem = {
	id: '',
	name: '',
	quantity: 1,
	price: 0,
	description: '',
	editing: true
};

const CreateInvoice = ({ session_id }) => {
	const router = useRouter();
	const { classes, cx } = useStyles();
	const [loading, setLoading] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [opened, setOpened] = useState(false);
	const [visible, setVisible] = useState(false);
	const [newCustomer, showNewCustomerForm] = useState({ query: '', show: false });
	const [newItem, showNewItemForm] = useState({ query: '', show: false });
	const [newTax, showNewTaxForm] = useState(false);
	const items = [
		{ title: 'Home', href: PATHS.HOME },
		{ title: 'Invoices', href: PATHS.INVOICES },
		{ title: 'Create Invoice', href: PATHS.CREATE_INVOICE }
	].map((item, index) => (
		<Anchor href={item.href} key={index} weight={router.pathname === item.href ? 'bold' : 'normal'}>
			{item.title}
		</Anchor>
	));
	const utils = trpc.useContext();
	const customerQuery = trpc.getCustomers.useQuery(
		{
			userId: session_id
		},
		{
			placeholderData: []
		}
	);
	const lineItemQuery = trpc.getLineItems.useQuery(
		{
			userId: session_id
		},
		{
			placeholderData: []
		}
	);
	const taxItemQuery = trpc.getTaxRates.useQuery(
		{
			userId: session_id
		},
		{
			placeholderData: []
		}
	);
	const createCustomerMutation = trpc.createCustomer.useMutation({
		onSuccess: function (input) {
			utils.getCustomers.invalidate({ userId: session_id });
		}
	});
	const createLineItemMutation = trpc.createLineItem.useMutation({
		onSuccess: function (input) {
			utils.getLineItems.invalidate({ userId: session_id });
		}
	});
	const createTaxRateMutation = trpc.createTaxRate.useMutation({
		onSuccess: function (input) {
			utils.getTaxRates.invalidate({ userId: session_id });
		}
	});

	const form = useForm<CreateInvoiceForm>({
		initialValues: {
			customer: '',
			invoice_date: '',
			due_date: '',
			invoice_number: '',
			line_items: [default_line_item],
			tax_rate: null
		}
	});

	const total = useMemo(() => {
		const sum = form.values.line_items.reduce((prev, curr) => prev + curr.quantity * curr.price, 0);
		if (form.values.tax_rate) {
			return sum + (sum * form.values.tax_rate.percentage) / 100;
		} else {
			return sum;
		}
	}, [form.values.line_items, form.values.tax_rate]);

	const subtotal = useMemo(() => {
		return form.values.line_items.reduce((prev, curr) => prev + curr.quantity * curr.price, 0);
	}, [form.values.line_items]);

	const createNewCustomer = useCallback(
		async (values: CustomerFormValues) => {
			setLoading(true);
			try {
				await createCustomerMutation.mutateAsync({
					userId: session_id,
					...values
				});
				setLoading(false);
				showNewCustomerForm(prevState => ({ ...prevState, show: false }));
				notifySuccess('create-customer-success', 'New customer has been created', <IconCheck size={20} />);
			} catch (err) {
				console.error(err);
				setLoading(false);
				notifyError('create-customer-failed', err.message, <IconX size={20} />);
			}
		},
		[session_id]
	);

	const createNewItem = useCallback(
		async (values: LineItemFormValues) => {
			values.price *= 100;
			setLoading(true);
			try {
				await createLineItemMutation.mutateAsync({
					userId: session_id,
					...values
				});
				setLoading(false);
				showNewItemForm(prevState => ({ ...prevState, show: false }));
				notifySuccess('create-line-item-success', 'New invoice item created', <IconCheck size={20} />);
			} catch (err) {
				console.error(err);
				setLoading(false);
				notifyError('create-line-item-failed', err.message, <IconX size={20} />);
			}
		},
		[session_id]
	);

	const createNewTax = useCallback(
		async (values: TaxRateFormValues) => {
			setLoading(true);
			try {
				await createTaxRateMutation.mutateAsync({
					userId: session_id,
					name: values.name,
					description: values.description,
					percentage: values.percentage,
					calculation: values.calculation
				});
				setLoading(false);
				showNewTaxForm(false);
				notifySuccess('create-tax-rate-success', 'New tax rate created', <IconCheck size={20} />);
			} catch (err) {
				console.error(err);
				setLoading(false);
				notifyError('create-tax-rate-failed', err.message, <IconX size={20} />);
			}
		},
		[session_id]
	);

	const fields = form.values.line_items.map((item, index) => (
		<Draggable key={index} index={index} draggableId={index.toString()}>
			{provided => (
				<tr
					key={index}
					className='bg-white'
					ref={provided.innerRef}
					{...provided.draggableProps}
					style={{
						border: 'none'
					}}
				>
					<td>
						<Center {...provided.dragHandleProps}>
							<IconGripVertical size={18} />
						</Center>
					</td>
					<td
						style={{
							width: 600
						}}
					>
						{item.editing ? (
							<Select
								placeholder='Enter item name'
								withAsterisk
								dropdownPosition='bottom'
								maxDropdownHeight={400}
								searchable
								creatable
								clearable
								radius='sm'
								withinPortal={false}
								getCreateLabel={query => `+ Create ${query}`}
								onCreate={query => {
									showNewItemForm(prevState => ({ show: true, query }));
									return null;
								}}
								data={lineItemQuery.data?.map(cus => ({
									value: cus.id,
									label: cus.name
								}))}
								value={form.values.line_items[index].name}
								onChange={value => {
									form.removeListItem('line_items', index);
									form.insertListItem(
										'line_items',
										{
											id: value,
											name: lineItemQuery.data?.find(item => item.id === value)?.name || '',
											price: lineItemQuery.data?.find(item => item.id === value)?.price || 0,
											description:
												lineItemQuery.data?.find(item => item.id === value)?.description ||
												undefined,
											quantity: item.quantity,
											editing: false
										},
										index
									);
								}}
								error={form.errors.line_items}
							/>
						) : (
							<div className='flex flex-col'>
								<Text size='md' weight={600}>
									{form.values.line_items[index].name}
								</Text>
								<Text color='dimmed' size='sm'>
									{form.values.line_items[index].description}
								</Text>
							</div>
						)}
					</td>
					<td>
						<NumberInput
							required
							value={item.quantity}
							min={1}
							max={10}
							{...form.getInputProps(`line_items.${index}.quantity`)}
						/>
					</td>
					<td>
						<NumberInput
							value={item.price}
							hideControls
							precision={2}
							min={0}
							max={100000}
							parser={value => value.replace(/£\s?|(,*)/g, '')}
							formatter={value =>
								!Number.isNaN(parseFloat(value))
									? `£ ${GBP(parseFloat(value))}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
									: '£ '
							}
							{...form.getInputProps(`line_items.${index}.price`)}
						/>
					</td>
					<td>{GBP(item.quantity * item.price).format()}</td>
					<td>
						<div className='flex flex-shrink'>
							<ActionIcon
								color='gray'
								onClick={() => {
									form.removeListItem('line_items', index);
									form.insertListItem('line_items', { ...item, editing: true }, index);
								}}
							>
								<IconPencil size={16} stroke={1.5} />
							</ActionIcon>
							<ActionIcon color='red' onClick={() => form.removeListItem('line_items', index)}>
								<IconTrash size={16} stroke={1.5} />
							</ActionIcon>
						</div>
					</td>
				</tr>
			)}
		</Draggable>
	));

	return (
		<Page.Container
			classNames='h-screen flex flex-col overflow-x-hidden'
			header={
				<Page.Header>
					<span className='text-2xl font-medium'>Create Invoice</span>
					<Button className='' onClick={() => setOpened(true)}>
						<span className='text-base font-normal'>Save Invoice</span>
					</Button>
				</Page.Header>
			}
		>
			<NewCustomerForm
				opened={newCustomer.show}
				onClose={() => showNewCustomerForm(prevState => ({ show: false, query: '' }))}
				loading={loading}
				onSubmit={createNewCustomer}
				query={newCustomer.query}
			/>
			<NewLineItemForm
				opened={newItem.show}
				onClose={() => showNewItemForm(prevState => ({ show: false, query: '' }))}
				loading={loading}
				onSubmit={createNewItem}
				query={newItem.query}
			/>
			<NewTaxRateForm
				opened={newTax}
				onClose={() => showNewTaxForm(false)}
				loading={loading}
				onSubmit={createNewTax}
			/>
			<Page.Body extraClassNames=''>
				<Breadcrumbs mb='lg'>{items}</Breadcrumbs>
				<form action=''>
					<SimpleGrid
						cols={2}
						breakpoints={[
							{ maxWidth: 755, cols: 2, spacing: 'sm' },
							{ maxWidth: 600, cols: 1, spacing: 'sm' }
						]}
					>
						{!visible ? (
							<Card withBorder py='xs' radius='xs'>
								<Stack
									justify='center'
									align='center'
									className='h-full'
									role='button'
									onClick={() => setVisible(true)}
								>
									<Group>
										<Avatar
											size={40}
											radius={40}
											classNames={{
												placeholder: 'bg-transparent'
											}}
										/>
										<Text weight={500} size='xl'>
											Add Customer
										</Text>
									</Group>
								</Stack>
							</Card>
						) : (
							<Stack align='center' className='h-full'>
								<Select
									withAsterisk
									label='Add customer'
									dropdownPosition='bottom'
									maxDropdownHeight={1000}
									searchable
									creatable
									radius='sm'
									placeholder='Search'
									withinPortal={false}
									icon={<IconSearch size={14} stroke={1.5} />}
									getCreateLabel={query => `+ Create ${query}`}
									onCreate={query => {
										showNewCustomerForm(prevState => ({ show: true, query }));
										return null;
									}}
									classNames={{
										root: 'w-full'
									}}
									itemComponent={AutoCompleteItem}
									data={customerQuery?.data?.map(cus => ({
										value: cus.display_name,
										label: cus.display_name,
										name: cus.display_name,
										company: cus.company
									}))}
									filter={(value, item) =>
										item.value.toLowerCase().includes(value.toLowerCase().trim()) ||
										item.company.toLowerCase().includes(value.toLowerCase().trim())
									}
								/>
								<Button
									variant='outline'
									mt='sm'
									leftIcon={<IconUserPlus size={24} />}
									size='lg'
									fullWidth
									onClick={() => showNewCustomerForm(prevState => ({ show: true, query: '' }))}
								>
									Create Customer
								</Button>
							</Stack>
						)}
						<Stack>
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
									value={
										dayjs(form.values.due_date).isValid()
											? dayjs(form.values.due_date).toDate()
											: null
									}
									onChange={date => form.setFieldValue('due_date', date)}
									error={form.errors.due_date}
									inputFormat='DD-MM-YYYY'
									allowLevelChange={false}
								/>
							</Group>
							<TextInput
								withAsterisk
								label='Invoice Number'
								placeholder='INV-##########'
								{...form.getInputProps('invoice_number')}
							/>
						</Stack>
					</SimpleGrid>
					<Space py='sm' />
					<SimpleGrid cols={1}>
						<Table
							id='new-invoice-table'
							withBorder
							withColumnBorders={false}
							horizontalSpacing='xl'
							verticalSpacing='sm'
							fontSize='md'
						>
							<thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
								<tr>
									<th></th>
									<th>Items</th>
									<th>Quantity</th>
									<th>Price</th>
									<th>Amount</th>
									<th></th>
								</tr>
							</thead>
							<DragDropContext
								onDragEnd={({ destination, source }) =>
									form.reorderListItem('line_items', {
										from: source.index,
										to: destination.index
									})
								}
							>
								<Droppable droppableId='dnd-list' direction='vertical'>
									{provided => (
										<tbody {...provided.droppableProps} ref={provided.innerRef}>
											{fields}
										</tbody>
									)}
								</Droppable>
							</DragDropContext>
						</Table>
						<Group position='right'>
							<Button
								variant='outline'
								color='green'
								leftIcon={<IconCirclePlus size={18} />}
								onClick={() => form.insertListItem('line_items', default_line_item)}
							>
								Add Item
							</Button>
							<Button
								variant='outline'
								leftIcon={<IconCirclePlus size={18} />}
								onClick={() => showNewItemForm(prevState => ({ show: true, query: '' }))}
							>
								Create New Item
							</Button>
						</Group>
					</SimpleGrid>
					<Space py='sm' />
					<Group position='apart' pb='md' grow align='start'>
						<Textarea placeholder='Invoice Notes' minRows={5} size='lg' />
						<Card withBorder py='md' radius='xs'>
							<SimpleGrid cols={2} spacing='xl'>
								<div>
									<Text size='md' weight='bold' color='dimmed' transform='uppercase'>
										Sub Total
									</Text>
								</div>
								<div>
									<Text size='md'>{GBP(subtotal).format()}</Text>
								</div>
								{form.values.tax_rate && (
									<>
										<div>
											<Text size='md' weight='bold' color='dimmed' transform='uppercase'>
												{form.values.tax_rate.name} ({form.values.tax_rate.percentage} %)
											</Text>
										</div>
										<Group>
											<Text size='md' transform='uppercase'>
												{GBP((form.values.tax_rate.percentage / 100) * subtotal).format()}
											</Text>
											<ActionIcon
												color='red'
												onClick={() => form.setFieldValue('tax_rate', null)}
											>
												<IconTrash size={16} stroke={1.5} />
											</ActionIcon>
										</Group>
									</>
								)}
								<div />
								<Menu shadow='md' width={200} withinPortal position='bottom'>
									<div>
										<Menu.Target>
											<Anchor
												component='button'
												type='button'
												color={form.values.tax_rate ? 'dimmed' : undefined}
												disabled={!!form.values.tax_rate}
											>
												+ Add Tax
											</Anchor>
										</Menu.Target>
									</div>

									<Menu.Dropdown>
										<Menu.Label>Tax Rates</Menu.Label>
										{taxItemQuery.data.map((tax, index) => (
											<Menu.Item
												key={index}
												rightSection={<Text>{tax.percentage} %</Text>}
												onClick={() => form.setFieldValue('tax_rate', tax)}
											>
												{tax.name}
											</Menu.Item>
										))}
										<Menu.Divider />
										<Menu.Item
											icon={<IconCirclePlus size={16} />}
											onClick={() => showNewTaxForm(true)}
										>
											Create New Tax
										</Menu.Item>
									</Menu.Dropdown>
								</Menu>
							</SimpleGrid>
							<Divider size='md' my='xs' />
							<SimpleGrid cols={2} spacing='xl'>
								<Text size='md' weight='bold' color='dimmed' transform='uppercase'>
									Total Amount
								</Text>
								<Text size='md'>{GBP(total).format()}</Text>
							</SimpleGrid>
						</Card>
					</Group>
				</form>
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
	return {
		props: {
			session_id: session.id
		}
	};
}

export default CreateInvoice;
