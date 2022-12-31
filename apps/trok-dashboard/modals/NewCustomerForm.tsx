import React from 'react';
import { Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { AddressInfo } from '@trok-app/shared-utils';

export interface CustomerFormValues {
	display_name: string
	primary_contact: string
	company_name: string
	email: string
	phone: string
	billing_address: AddressInfo
}
interface NewCustomerFormProps {
	opened: boolean;
	onClose: () => void;
	onSubmit: (values: CustomerFormValues) => Promise<void>;
	loading: boolean;
	query: string | null
}
const NewCustomerForm = ({opened, onClose, onSubmit, loading, query} : NewCustomerFormProps) => {
	const form = useForm<CustomerFormValues>({
		initialValues: {
			display_name: '',
			primary_contact: '',
			company_name: '',
			email: '',
			phone: '',
			billing_address: {
				line1: '',
				line2: '',
				city: '',
				postcode: '',
				region: '',
				country: ''
			}
		}
	});
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
						{...form.getInputProps('primary_contact')}
					/>
					<TextInput
						label="Email"
						{...form.getInputProps('email')}
					/>
					<TextInput
						label="Company Name"
						{...form.getInputProps('company_name')}
					/>
					<Group grow>
						<TextInput
							label="Phone"
							{...form.getInputProps('phone')}
						/>
						<TextInput
							label="Website"
							{...form.getInputProps('display_name')}
						/>
					</Group>
				</Stack>
				<Group position='right'>
					<Button disabled={!form.isDirty()} type='submit' loading={loading}>
						<Text weight={500}>Create Customer</Text>
					</Button>
				</Group>
			</form>
		</Modal>
	);
};

export default NewCustomerForm;
