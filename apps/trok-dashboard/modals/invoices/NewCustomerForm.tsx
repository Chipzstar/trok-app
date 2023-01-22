import React, { useEffect, useState } from 'react';
import { Button, Group, Modal, Stack, Tabs, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { AddressInfo } from '@trok-app/shared-utils';
import { IconAddressBook, IconTruckDelivery, IconUser } from '@tabler/icons';

const basic_info_keys = ['display_name', 'primary_contact', 'company', 'phone', 'email', 'website'] as const
export type BasicInfoKey = typeof basic_info_keys[number];

type BasicInfoForm = {
	[key in BasicInfoKey]: string;
}

export type CustomerFormValues = {
	billing_address: AddressInfo
	shipping_address?: AddressInfo
} & BasicInfoForm
interface NewCustomerFormProps {
	opened: boolean;
	onClose: () => void;
	onSubmit: (values: CustomerFormValues) => Promise<void>;
	loading: boolean;
	query?: string
}
const NewCustomerForm = ({opened, onClose, onSubmit, loading, query=""} : NewCustomerFormProps) => {
	const [activeTab, setActiveTab] = useState('basic')
	const form = useForm<CustomerFormValues>({
		initialValues: {
			display_name: query,
			primary_contact: '',
			company: '',
			email: '',
			phone: undefined,
			website: undefined,
			billing_address: {
				line1: '',
				line2: '',
                city: '',
                postcode: '',
				region: '',
				country: ''
			},
			shipping_address: undefined
		},
		validate: {
			display_name: value => !value ? "Required" : null,
		    primary_contact: value => !value ? "Required": null,
			company: value => !value ? "Required" : null,
			email: value =>!value? "Required" : null,
			billing_address: {
				line1: value => !value ? "Required": null,
				city: value =>!value? "Required" : null,
				postcode: value => !value ? "Required" : null,
				region: value => !value ? "Required" : null,
				country: value =>!value? "Required" : null,
			}
		}
	});

	const onValidate = (errors, values, event) => {
		console.log(errors)
		if (basic_info_keys.some(key => Object.keys(errors).includes(key))) {
			setActiveTab('basic')
		} else if (Object.values(errors).length) {
			setActiveTab('billing')
		}
	}

	useEffect(() => {
		form.setFieldValue('display_name', query)
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
				},
				header: {
					paddingBottom: 8,
					borderBottom: '1px solid #E5E5E5'
				}
			}}
		>
			<form onSubmit={form.onSubmit(onSubmit, onValidate)} className='flex flex-col space-y-4'>
				<Tabs value={activeTab} onTabChange={setActiveTab}>
					<Tabs.List grow>
						<Tabs.Tab value="basic" icon={<IconUser size={14} />}>Basic Info</Tabs.Tab>
						<Tabs.Tab value="billing" icon={<IconAddressBook size={14} />}>Billing Address</Tabs.Tab>
						<Tabs.Tab value="shipping" icon={<IconTruckDelivery size={14} />}>Shipping Address</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel value="basic" pt="xs">
						<Stack>
							<TextInput
								label="Display Name"
								withAsterisk
								{...form.getInputProps('display_name')}
							/>
							<TextInput
								label="Primary Contact Name"
								withAsterisk
								{...form.getInputProps('primary_contact')}
							/>
							<TextInput
								label="Company Name"
								withAsterisk
								{...form.getInputProps('company')}
							/>
							<TextInput
								label="Email"
								type="email"
								withAsterisk
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
					</Tabs.Panel>
					<Tabs.Panel value="billing" pt="xs">
						<Stack>
							<Group grow>
								<TextInput withAsterisk label='Address line 1' {...form.getInputProps('billing_address.line1')} />
								<TextInput label='Address line 2' {...form.getInputProps('billing_address.line2')} />
							</Group>
							<Group grow>
								<TextInput withAsterisk label='City' {...form.getInputProps('billing_address.city')} />
								<TextInput withAsterisk label='Postal Code' {...form.getInputProps('billing_address.postcode')} />
							</Group>
							<Group grow>
								<TextInput withAsterisk label='County / Region' {...form.getInputProps('billing_address.region')} />
								<TextInput withAsterisk label='Country' {...form.getInputProps('billing_address.country')} />
							</Group>
						</Stack>
					</Tabs.Panel>
					<Tabs.Panel value="shipping" pt="xs">
						<Stack>
							<Group grow>
								<TextInput label='Address line 1' {...form.getInputProps('shipping_address.line1')} />
								<TextInput label='Address line 2' {...form.getInputProps('shipping_address.line2')} />
							</Group>
							<Group grow>
								<TextInput label='City' {...form.getInputProps('shipping_address.city')} />
								<TextInput label='Postal Code' {...form.getInputProps('shipping_address.postcode')} />
							</Group>
							<Group grow>
								<TextInput label='County / Region' {...form.getInputProps('shipping_address.region')} />
								<TextInput label='Country' {...form.getInputProps('shipping_address.country')} />
							</Group>
						</Stack>
					</Tabs.Panel>
				</Tabs>
				<Group position='right'>
					<Button variant="outline" type='button' onClick={onClose} styles={{
						root: {
							width: 90,
						}
					}}>
						<Text weight={500}>Cancel</Text>
					</Button>
					<Button disabled={!form.isDirty()} type='submit' loading={loading} styles={{
						root: {
							width: 90,
						}
					}}>
						<Text weight={500}>Save</Text>
					</Button>
				</Group>
			</form>
		</Modal>
	);
};

export default NewCustomerForm;
