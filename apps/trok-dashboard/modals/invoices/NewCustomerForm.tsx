import React, { useEffect } from 'react';
import { Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { AddressInfo } from '@trok-app/shared-utils';

export interface CustomerFormValues {
	display_name: string
	primary_contact: string
	company: string
	email: string
	phone: string
	billing_address: AddressInfo
	website: string
}
interface NewCustomerFormProps {
	opened: boolean;
	onClose: () => void;
	onSubmit: (values: CustomerFormValues) => Promise<void>;
	loading: boolean;
	query?: string
}
const NewCustomerForm = ({opened, onClose, onSubmit, loading, query=""} : NewCustomerFormProps) => {
	const form = useForm<CustomerFormValues>({
		initialValues: {
			display_name: query,
			primary_contact: '',
			company: '',
			email: undefined,
			phone: undefined,
			billing_address: undefined,
			website: undefined
		}
	});

	useEffect(() => {
		form.reset()
	}, [query]);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			centered
			padding='lg'
			size='lg'
			title='Add Customer'
			styles={{
				title: {
					fontSize: 24,
					fontWeight: 500
				}
			}}
		>
			<form onSubmit={form.onSubmit(onSubmit)} className='flex flex-col space-y-4'>
				<Stack>
					<TextInput
						label="Display Name"
						required
						{...form.getInputProps('display_name')}
					/>
					<TextInput
						label="Primary Contact Name"
						required
						{...form.getInputProps('primary_contact')}
					/>
					<TextInput
						label="Company Name"
						required
						{...form.getInputProps('company')}
					/>
					<TextInput
						label="Email"
						type="email"
						{...form.getInputProps('email')}
					/>
					<Group grow>
						<TextInput
							type="tel"
							label="Phone"
							{...form.getInputProps('phone')}
						/>
						<TextInput
							label="Website"
							type="url"
							{...form.getInputProps('website')}
						/>
					</Group>
				</Stack>
				<Group position='right'>
					<Button disabled={!form.isDirty()} type='submit' loading={loading}>
						<Text weight={500}>Save</Text>
					</Button>
				</Group>
			</form>
		</Modal>
	);
};

export default NewCustomerForm;
