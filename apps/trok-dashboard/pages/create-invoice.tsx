import React, { forwardRef, useCallback, useState } from 'react';
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
import { PATHS, SAMPLE_CUSTOMERS, SAMPLE_LINE_ITEMS } from '../utils/constants';
import { useRouter } from 'next/router';
import { DatePicker } from '@mantine/dates';
import { IconCalendar, IconCirclePlus, IconGripVertical, IconSearch, IconTrash, IconUserPlus } from '@tabler/icons';
import dayjs from 'dayjs';
import { useForm } from '@mantine/form';
import { LineItem } from '../utils/types';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { GBP } from '@trok-app/shared-utils';
import NewCustomerForm from '../modals/NewCustomerForm';

interface CreateInvoiceForm {
	invoice_date: string | Date;
	due_date: string | Date;
	invoice_number: string;
	line_items: LineItem[];
	discount: number;
}

interface ItemProps extends SelectItemProps {
	color: MantineColor;
	name: string;
	company: string;
	email: string;
}

const AutoCompleteItem = forwardRef<HTMLDivElement, ItemProps>(
	({ company, label, value, email, ...others }: ItemProps, ref) => (
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

const CreateInvoice = () => {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const { classes, cx } = useStyles();
	const [scrolled, setScrolled] = useState(false);
	const [opened, setOpened] = useState(false);
	const [visible, setVisible] = useState(false);
	const [newCustomer, showNewCustomerForm] = useState({ query: '', show: false });
	const items = [
		{ title: 'Home', href: PATHS.HOME },
		{ title: 'Invoices', href: PATHS.INVOICES },
		{ title: 'Create Invoice', href: PATHS.CREATE_INVOICE }
	].map((item, index) => (
		<Anchor href={item.href} key={index} weight={router.pathname === item.href ? 'bold' : 'normal'}>
			{item.title}
		</Anchor>
	));

	const form = useForm<CreateInvoiceForm>({
		initialValues: {
			invoice_date: '',
			due_date: '',
			invoice_number: '',
			line_items: [
				{
					name: 'Cereal',
					quantity: 1,
					price: 0,
					amount: 0
				}
			],
			discount: 0
		}
	});

	const createNewCustomer = useCallback(async (values) => {
		console.log(values)
	}, [])

	const fields = form.values.line_items.map((_, index) => (
		<Draggable key={index} index={index} draggableId={index.toString()}>
			{provided => (
				<tr
					className='bg-white'
					ref={provided.innerRef}
					{...provided.draggableProps}
					key={index}
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
						<Select
							placeholder='Enter item name'
							withAsterisk
							dropdownPosition='bottom'
							maxDropdownHeight={1000}
							searchable
							creatable
							radius='sm'
							withinPortal={false}
							getCreateLabel={query => `+ Create ${query}`}
							onCreate={query => {
								showNewCustomerForm(prevState => ({ show: true, query }));
								return null;
							}}
							data={SAMPLE_LINE_ITEMS.map(cus => ({
								value: cus.name,
								label: cus.name
							}))}
							{...form.getInputProps(`line_items.${index}.name`)}
						/>
					</td>
					<td>
						<NumberInput
							value={_.quantity}
							min={1}
							max={10}
							{...form.getInputProps(`line_items.${index}.quantity`)}
						/>
					</td>
					<td>
						<NumberInput
							value={GBP(_.price)}
							precision={2}
							min={1}
							max={10}
							parser={value => value.replace(/£\s?|(,*)/g, '')}
							formatter={value =>
								!Number.isNaN(parseFloat(value))
									? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
									: '£ '
							}
							{...form.getInputProps(`line_items.${index}.price`)}
						/>
					</td>
					<td>{GBP(_.amount).format()}</td>
					<td>
						<ActionIcon color='red' onClick={() => form.removeListItem('line_items', index)}>
							<IconTrash size={16} stroke={1.5} />
						</ActionIcon>
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
				onClose={() => showNewCustomerForm(prevState => ({show: false, query: ''}))}
				loading={loading}
				onSubmit={createNewCustomer}
				query={newCustomer.query}
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
									data={SAMPLE_CUSTOMERS.map(cus => ({
										value: cus.name,
										label: cus.name,
										name: cus.name,
										email: cus.email,
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
									onClick={() => showNewCustomerForm(prevState => ({show: true, query: ''}))}
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
								leftIcon={<IconCirclePlus size={18} />}
								onClick={() =>
									form.insertListItem('line_items', {
										name: '',
										quantity: 1,
										price: 0,
										amount: 0
									})
								}
							>
								Add New Item
							</Button>
						</Group>
					</SimpleGrid>
					<Space py='sm' />
					<Group position='apart' pb='md' grow align='start'>
						<Textarea placeholder='Invoice Notes' minRows={5} size="lg"/>
						<Card withBorder py='md' radius='xs'>
							<SimpleGrid cols={2} spacing='xl'>
								<div>
									<Text size='md' weight='bold' color='dimmed' transform='uppercase'>
										Sub Total
									</Text>
								</div>
								<div>
									<Text size='md'>{GBP(0).format()}</Text>
								</div>
								<div />
								<div>
									<Anchor component="button" type="button">
										+ Add Tax
									</Anchor>
								</div>
							</SimpleGrid>
							<Divider size='md' my='xs' />
							<SimpleGrid cols={2} spacing='xl'>
								<Text size='md' weight='bold' color='dimmed' transform='uppercase'>
									Total Amount
								</Text>
								<Text size='md'>{GBP(0).format()}</Text>
							</SimpleGrid>
						</Card>
					</Group>
				</form>
			</Page.Body>
		</Page.Container>
	);
};

export default CreateInvoice;
