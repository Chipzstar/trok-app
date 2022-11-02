import {
	ActionIcon,
	Button,
	Checkbox,
	Drawer,
	Group,
	Loader,
	NumberInput,
	Select,
	Stack,
	Text,
	TextInput,
	Title
} from '@mantine/core';
import React, { useCallback, useState } from 'react';
import { IconCheck, IconPencil, IconTrash, IconX } from '@tabler/icons';
import { GBP, SAMPLE_DRIVERS } from '../utils/constants';
import Page from '../layout/Page';
import DriversTable from '../containers/DriversTable';
import { useForm } from '@mantine/form';
import { trpc } from '../utils/clients';
import {  getE164Number, intervals, notifyError, notifySuccess } from '@trok-app/shared-utils';
import { capitalize, sanitize } from '../utils/functions';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import EditDriverForm from '../modals/EditDriverForm';
import { openConfirmModal } from '@mantine/modals';

const Drivers = ({ testMode, session_id, stripe_account_id }) => {
	const [driver, setEditDriver] = useState(null);
	const [loading, setLoading] = useState(false);
	const [opened, setOpened] = useState(false);
	const utils = trpc.useContext();
	const query = trpc.getDrivers.useQuery({ userId: session_id });
	const createMutation = trpc.createDriver.useMutation({
		onSuccess: function (input) {
			utils.invalidate({ userId: session_id }).then(r => console.log(input, 'Drivers refetched'));
		}
	});
	const updateMutation = trpc.updateDriver.useMutation({
		onSuccess: function (input) {
			utils.invalidate({ userId: session_id }).then(r => console.log(input, 'Drivers refetched'));
		}
	});
	const deleteMutation = trpc.deleteDriver.useMutation({
		onSuccess: function (input) {
			utils.invalidate({ userId: session_id }).then(r => console.log(input, 'Drivers refetched'));
		}
	});

	const openModal = driver =>
		openConfirmModal({
			title: `Deleting ${driver.full_name}\n`,
			children: (
				<Text size='sm'>
					Please confirm that you'd like to delete this driver and disable their card?{' '}
					<strong>This action cannot be reversed!</strong>
				</Text>
			),
			labels: { confirm: 'Confirm', cancel: 'Cancel' },
			onCancel: () => console.log('Cancel'),
			onConfirm: async () => {
				try {
					await deleteMutation.mutateAsync({
						id: driver.id,
						cardholder_id: driver.cardholder_id,
						customer_id: driver.customer_id,
						stripeId: stripe_account_id
					});
					notifySuccess('delete-driver-success', 'Driver deleted successfully!', <IconCheck size={20} />)
				} catch (err) {
					console.log(err)
					notifySuccess('delete-driver-failed', err?.error?.message ?? err.message, <IconX size={20} />)
				}
			}
		});

	const rows = testMode
		? SAMPLE_DRIVERS.map((element, index) => {
				return (
					<tr key={index}>
						<td colSpan={1}>
							<span>{element.firstname}</span>
						</td>
						<td colSpan={1}>
							<span>{element.lastname}</span>
						</td>
						<td colSpan={1}>
							<span>{GBP(element.current_spend).format()}</span>
						</td>
						<td colSpan={1}>
							<span>{GBP(element.spending_limit).format()}</span>
						</td>
						<td colSpan={1}>
							<span>{element.phone}</span>
						</td>
						<td colSpan={1}>
							<span>{element.email}</span>
						</td>
						<td>
							<Group spacing='md' position='left'>
								<ActionIcon size='sm' onClick={() => null}>
									<IconPencil />
								</ActionIcon>
							</Group>
						</td>
					</tr>
				);
		  })
		: !query.isLoading
		? query.data.filter(d => d.status === "active").map((element, index) => {
				return (
					<tr key={index}>
						<td colSpan={1}>
							<span>{element.firstname}</span>
						</td>
						<td colSpan={1}>
							<span>{element.lastname}</span>
						</td>
						<td colSpan={1}>
							<span>{GBP(element.current_spend).format()}</span>
						</td>
						<td colSpan={1}>
							<span>
								{element?.spending_limit?.amount ? GBP(element.spending_limit.amount).format() : '-'}
							</span>
						</td>
						<td colSpan={1}>
							<span>{element.phone}</span>
						</td>
						<td colSpan={1}>
							<span>{element.email}</span>
						</td>
						<td>
							<Group spacing='md' position='left'>
								<ActionIcon size='sm' onClick={() => setEditDriver(element)}>
									<IconPencil />
								</ActionIcon>
								<ActionIcon size='sm' onClick={() => openModal(element)} color='red'>
									<IconTrash />
								</ActionIcon>
							</Group>
						</td>
					</tr>
				);
		  })
		: [];

	const form = useForm({
		initialValues: {
			firstname: '',
			lastname: '',
			email: '',
			phone: '',
			address: {
				line1: '',
				city: '',
				postcode: '',
				region: '',
				country: 'GB'
			},
			has_spending_limit: false,
			spending_limit: {
				amount: 100,
				interval: ''
			}
		}
	});

	const handleSubmit = useCallback(
		async values => {
			setLoading(true);
			try {
				await createMutation.mutateAsync({
					userId: session_id,
					stripeId: stripe_account_id,
					address: values.address,
					email: values.email,
					firstname: values.firstname,
					lastname: values.lastname,
					phone: getE164Number(values.phone),
					...(values.has_spending_limit && {
						spending_limit: {
							amount: values.spending_limit.amount * 100,
							interval: values.spending_limit.interval
						}
					})
				});
				setLoading(false);
				setOpened(false);
				notifySuccess('add-driver-success', 'New Driver added successfully', <IconCheck size={20} />);
			} catch (err) {
				console.error(err);
				setLoading(false);
				notifyError('add-driver-failed', err?.error?.message ?? err.message, <IconX size={20} />);
			}
		},
		[session_id, stripe_account_id]
	);

	const handleUpdate = useCallback(
		async values => {
			setLoading(true);
			console.log(values);
			try {
				await updateMutation.mutateAsync({
					id: values.id,
					userId: session_id,
					cardholder_id: values.cardholder_id,
					customer_id: values.customer_id,
					stripeId: stripe_account_id,
					address: values.address,
					email: values.email,
					firstname: values.firstname,
					lastname: values.lastname,
					phone: getE164Number(values.phone),
					...(values.has_spending_limit && {
						spending_limit: {
							amount: values.spending_limit.amount * 100,
							interval: values.spending_limit.interval
						}
					})
				});
				setLoading(false);
				setEditDriver(null);
				notifySuccess('update-driver-success', 'Driver updated successfully', <IconCheck size={20} />);
			} catch (err) {
				console.error(err);
				setLoading(false);
				notifyError('update-driver-failed', err?.error?.message ?? err.message, <IconX size={20} />);
			}
		},
		[session_id, stripe_account_id]
	);

	return (
		<Page.Container
			header={
				<Page.Header extraClassNames='mb-0'>
					<span className='text-2xl font-medium'>Drivers</span>
					<Button className='' onClick={() => setOpened(true)}>
						<span className='text-base font-normal'>Add new driver</span>
					</Button>
				</Page.Header>
			}
		>
			<EditDriverForm
				loading={loading}
				driver={driver}
				onClose={() => setEditDriver(null)}
				onSubmit={handleUpdate}
			/>
			<Drawer opened={opened} onClose={() => setOpened(false)} padding='xl' size='xl' position='right'>
				<Stack justify='center'>
					<Title order={2} weight={500}>
						<span>Create new driver</span>
					</Title>
					<form onSubmit={form.onSubmit(handleSubmit)} className='flex flex-col space-y-4'>
						<Group grow spacing='xl'>
							<TextInput required label='First Name' {...form.getInputProps('firstname')} />
							<TextInput required label='Last Name' {...form.getInputProps('lastname')} />
						</Group>
						<Group grow spacing='xl'>
							<TextInput required type='tel' label='Phone Number' {...form.getInputProps('phone')} />
							<TextInput required type='email' label='Email' {...form.getInputProps('email')} />
						</Group>
						<Group grow spacing='xl'>
							<TextInput required label='Address 1' {...form.getInputProps('address.line1')} />
							<TextInput label='Address 2' {...form.getInputProps('address.line2')} />
						</Group>
						<Group grow spacing='xl'>
							<TextInput required label='City' {...form.getInputProps('address.city')} />
							<TextInput required label='Postal Code' {...form.getInputProps('address.postcode')} />
						</Group>
						<Group grow spacing='xl'>
							<TextInput required label='Region' {...form.getInputProps('address.region')} />
							<TextInput required label='Country' readOnly {...form.getInputProps('address.country')} />
						</Group>
						<Checkbox
							label='Add spending limit'
							size='sm'
							{...form.getInputProps('has_spending_limit', { type: 'checkbox' })}
						/>
						{form.values.has_spending_limit && (
							<Group grow spacing='xl'>
								<NumberInput
									required={form.values.has_spending_limit}
									type='text'
									label='Spend Limit'
									min={100}
									max={1000000}
									step={100}
									parser={(value: string) => value.replace(/£\s?|(,*)/g, '')}
									formatter={(value: string) =>
										!Number.isNaN(parseFloat(value))
											? `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
											: '£ '
									}
									{...form.getInputProps('spending_limit.amount')}
								/>
								<Select
									required={form.values.has_spending_limit}
									label='Frequency'
									data={intervals.slice(0, -1).map(item => ({
										label: capitalize(sanitize(item)),
										value: item
									}))}
									{...form.getInputProps('spending_limit.interval')}
								/>
							</Group>
						)}
						<Group py='xl' position='right'>
							<Button type='submit'>
								<Loader size='sm' className={`mr-3 ${!loading && 'hidden'}`} color='white' />
								<Text weight={500}>Add Driver</Text>
							</Button>
						</Group>
					</form>
				</Stack>
			</Drawer>
			<Page.Body>
				<DriversTable rows={rows} />
			</Page.Body>
		</Page.Container>
	);
};

export const getServerSideProps = async ({ req, res }) => {
	// @ts-ignore
	const session = await unstable_getServerSession(req, res, authOptions);
	return {
		props: {
			session_id: session.id,
			stripe_account_id: session?.stripe.account_id
		}
	};
};

export default Drivers;
