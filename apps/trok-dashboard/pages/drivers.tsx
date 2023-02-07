import { Button, Checkbox, Drawer, Group, NumberInput, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import React, { useCallback, useState } from 'react';
import { IconCheck, IconX } from '@tabler/icons';
import { PATHS, SAMPLE_DRIVERS } from '../utils/constants';
import Page from '../layout/Page';
import DriversTable from '../containers/DriversTable';
import { useForm } from '@mantine/form';
import { trpc } from '../utils/clients';
import {
	capitalize,
	getE164Number,
	intervals,
	DriverFormValues,
	notifyError,
	notifySuccess,
	sanitize
} from '@trok-app/shared-utils';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import EditDriverForm from '../modals/EditDriverForm';
import { openConfirmModal } from '@mantine/modals';
import { useRouter } from 'next/router';

const Drivers = ({ testMode, session_id, stripe_account_id }) => {
	const router = useRouter();
	const [driver, setEditDriver] = useState(null);
	const [loading, setLoading] = useState(false);
	const [opened, setOpened] = useState(false);
	const utils = trpc.useContext();
	const query = trpc.driver.getDrivers.useQuery({ userId: session_id });
	const createDriver = trpc.driver.createDriver.useMutation({
		onSuccess: function (input) {
			utils.driver.getDrivers
				.invalidate({ userId: session_id })
				.then(r => console.log(input, 'Drivers refetched'));
		}
	});
	const updateDriver = trpc.driver.updateDriver.useMutation({
		onSuccess: function (input) {
			utils.driver.getDrivers
				.invalidate({ userId: session_id })
				.then(r => console.log(input, 'Drivers refetched'));
		}
	});
	const deleteDriver = trpc.driver.deleteDriver.useMutation({
		onSuccess: function (input) {
			utils.driver.getDrivers
				.invalidate({ userId: session_id })
				.then(r => console.log(input, 'Drivers refetched'));
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
			centered: true,
			onCancel: () => console.log('Cancel'),
			confirmProps: {
				color: 'red'
			},
			onConfirm: async () => {
				try {
					await deleteDriver.mutateAsync({
						id: driver.id,
						cardholder_id: driver.cardholder_id,
						customer_id: driver.customer_id,
						stripeId: stripe_account_id
					});
					notifySuccess('delete-driver-success', 'Driver deleted successfully!', <IconCheck size={20} />);
				} catch (err) {
					console.log(err);
					notifySuccess('delete-driver-failed', err?.error?.message ?? err.message, <IconX size={20} />);
				}
			}
		});

	const data = testMode ? SAMPLE_DRIVERS : query.data ? query.data.filter(d => !d.deleted) : [];

	const form = useForm<DriverFormValues>({
		initialValues: {
			firstname: '',
			lastname: '',
			email: '',
			phone: '',
			line1: '',
			line2: '',
			city: '',
			postcode: '',
			region: '',
			country: 'GB',
			has_spending_limit: false,
			spending_limit: {
				amount: null,
				interval: null
			}
		},
		validate: {
			firstname: val => (!val ? 'Required' : null),
			lastname: val => (!val ? 'Required' : null),
			email: val => (!val ? 'Required' : null),
			phone: val => (!val ? 'Required' : null),
			line1: val => (!val ? 'Required' : null),
			city: val => (!val ? 'Required' : null),
			postcode: val => (!val ? 'Required' : null),
			region: val => (!val ? 'Required' : null),
			country: val => (!val ? 'Required' : null),
			spending_limit: {
				amount: (value, values) =>
					values.has_spending_limit && (!value || Number(value) < 100)
						? 'Amount must be at least £100'
						: null,
				interval: (value, values) => (values.has_spending_limit && !value ? 'Required' : null)
			}
		}
	});

	const handleSubmit = useCallback(
		async (values: DriverFormValues) => {
			setLoading(true);
			try {
				const driver = await createDriver.mutateAsync({
					userId: session_id,
					stripeId: stripe_account_id,
					address: {
						line1: values.line1,
						line2: values.line2,
						city: values.city,
						postcode: values.postcode,
						region: values.region,
						country: values.country
					},
					email: values.email,
					firstname: values.firstname,
					lastname: values.lastname,
					phone: getE164Number(values.phone),
					spending_limit: values.has_spending_limit
						? {
								amount: values.spending_limit.amount * 100,
								interval: values.spending_limit.interval
						  }
						: null
				});
				// append the driver's ID to the url for accessing the driver in integration tests
				router.push(`${PATHS.DRIVERS}?driver_id=${driver.id}`, undefined, { shallow: true });
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
		async (values: DriverFormValues) => {
			setLoading(true);
			try {
				const updated_driver = await updateDriver.mutateAsync({
					id: driver.id,
					userId: session_id,
					cardholder_id: driver.cardholder_id,
					customer_id: driver.customer_id,
					stripeId: stripe_account_id,
					address: {
						line1: values.line1,
						line2: values.line2,
						city: values.city,
						postcode: values.postcode,
						region: values.region,
						country: values.country
					},
					email: values.email,
					firstname: values.firstname,
					lastname: values.lastname,
					phone: getE164Number(values.phone),
					spending_limit: values.has_spending_limit
						? {
								amount: values.spending_limit.amount * 100,
								interval: values.spending_limit.interval
						  }
						: null
				});
				// append the driver's ID to the url for accessing the driver in integration tests
				router.push(`${PATHS.DRIVERS}?driver_id=${updated_driver.id}`, undefined, { shallow: true });
				setLoading(false);
				setEditDriver(null);
				notifySuccess('update-driver-success', 'Driver updated successfully', <IconCheck size={20} />);
			} catch (err) {
				console.error(err);
				setLoading(false);
				notifyError('update-driver-failed', err?.error?.message ?? err.message, <IconX size={20} />);
			}
		},
		[session_id, stripe_account_id, driver]
	);

	return (
		<Page.Container
			header={
				<Page.Header extraClassNames='mb-0'>
					<span className='text-2xl font-medium'>Drivers</span>
					<Button className='' onClick={() => setOpened(true)} data-cy='new-driver-btn'>
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
					<form
						onSubmit={form.onSubmit(handleSubmit)}
						className='flex flex-col space-y-4'
						data-cy='add-driver-form'
					>
						<Group grow spacing='xl'>
							<TextInput
								withAsterisk
								label='First Name'
								{...form.getInputProps('firstname')}
								data-cy='new-driver-firstname'
							/>
							<TextInput
								withAsterisk
								label='Last Name'
								{...form.getInputProps('lastname')}
								data-cy='new-driver-lastname'
							/>
						</Group>
						<Group grow spacing='xl'>
							<TextInput
								withAsterisk
								type='tel'
								label='Phone Number'
								{...form.getInputProps('phone')}
								data-cy='new-driver-phone'
							/>
							<TextInput
								withAsterisk
								type='email'
								label='Email'
								{...form.getInputProps('email')}
								data-cy='new-driver-email'
							/>
						</Group>
						<Group grow spacing='xl'>
							<TextInput
								withAsterisk
								label='Address 1'
								{...form.getInputProps('line1')}
								data-cy='new-driver-address-line1'
							/>
							<TextInput
								label='Address 2'
								{...form.getInputProps('line2')}
								data-cy='new-driver-address-line2'
							/>
						</Group>
						<Group grow spacing='xl'>
							<TextInput
								withAsterisk
								label='City'
								{...form.getInputProps('city')}
								data-cy='new-driver-address-city'
							/>
							<TextInput
								withAsterisk
								label='Postal Code'
								{...form.getInputProps('postcode')}
								data-cy='new-driver-address-postcode'
							/>
						</Group>
						<Group grow spacing='xl'>
							<TextInput
								withAsterisk
								label='Region'
								{...form.getInputProps('region')}
								data-cy='new-driver-address-region'
							/>
							<TextInput
								withAsterisk
								label='Country'
								readOnly
								{...form.getInputProps('country')}
								data-cy='new-driver-address-country'
							/>
						</Group>
						<Checkbox
							label='Add spending limit'
							size='sm'
							{...form.getInputProps('has_spending_limit', { type: 'checkbox' })}
							data-cy='new-driver-has-spending-limit'
						/>
						{form.values.has_spending_limit && (
							<Group grow spacing='xl'>
								<NumberInput
									withAsterisk={form.values.has_spending_limit}
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
									data-cy='new-driver-limit-amount'
								/>
								<Select
									withAsterisk={form.values.has_spending_limit}
									label='Frequency'
									data={intervals.slice(0, -1).map(item => ({
										label: capitalize(sanitize(item)),
										value: item
									}))}
									{...form.getInputProps('spending_limit.interval')}
									data-cy='new-driver-limit-interval'
								/>
							</Group>
						)}
						<Group py='xl' position='right'>
							<Button type='submit' loading={loading}>
								<Text weight={500}>Add Driver</Text>
							</Button>
						</Group>
					</form>
				</Stack>
			</Drawer>
			<Page.Body>
				<DriversTable
					loading={!testMode && query.isLoading}
					data={data}
					onEdit={setEditDriver}
					onDelete={openModal}
				/>
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
