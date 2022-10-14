import { Badge, Button, Checkbox, Drawer, Group, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import React, { useCallback, useState } from 'react';
import Page from '../layout/Page';
import { SAMPLE_BANK_ACCOUNTS } from '../utils/constants';
import BankAccountsTable from '../containers/BankAccountsTable';
import { sanitize } from '../utils/functions';
import { useForm } from '@mantine/form';
import SortCodeInput from '../components/SortCodeInput';

const formatAccNumber = (accNumber: string): string => (accNumber ? '****' + accNumber : undefined);

const formatCode = codeText => {
	return codeText
		.replace(' ', '')
		.replace('-', '')
		.match(/.{1,2}/g)
		.join('-');
};

const rows = SAMPLE_BANK_ACCOUNTS.map((element, index) => {
	return (
		<tr key={index}>
			<td colSpan={1}>
				<span>{element.account_holder_name}</span>
			</td>
			<td colSpan={1}>
				<span className='capitalize'>{sanitize(element.type)}</span>
			</td>
			<td colSpan={1}>
				<span>{element.account_number}</span>
			</td>
			<td colSpan={1}>
				<span>{element.sort_code}</span>
			</td>
			<td>
				{element.isDefault && (
					<Badge radius='xs' variant='light' color='gray'>
						DEFAULT
					</Badge>
				)}
			</td>
		</tr>
	);
});

const PaymentMethod = () => {
	const [opened, setOpened] = useState(false);

	const form = useForm({
		initialValues: {
			account_holder_name: '',
			account_number: '',
			sort_code: '',
			account_type: '',
			default: false
		}
	});

	const handleSubmit = useCallback(values => {
		alert(JSON.stringify(values));
		console.log(values);
	}, []);

	return (
		<Page.Container
			header={
				<Page.Header extraClassNames='mb-3'>
					<span className='text-2xl font-medium capitalize'>Payment Method</span>
					<Button className='' onClick={() => setOpened(true)}>
						<span className='text-base font-normal'>Add Bank Account</span>
					</Button>
				</Page.Header>
			}
		>
			<Drawer
				opened={opened}
				onClose={() => setOpened(false)}
				padding='xl'
				size='xl'
				position='right'
				classNames={{
					drawer: 'flex h-full'
				}}
			>
				<Stack justify='center'>
					<Title order={2} weight={500}>
						<span>Add new bank account</span>
					</Title>
					<form onSubmit={form.onSubmit(handleSubmit)} className='flex flex-col space-y-4'>
						<TextInput
							required
							label='Business Account Name'
							{...form.getInputProps('account_holder_name')}
						/>
						<Group grow spacing='xl'>
							<TextInput required label='Account Number' {...form.getInputProps('account_number')} />
							<SortCodeInput
								onChange={event => {
									console.log(event.currentTarget.value);
									form.setFieldValue('sort_code', event.currentTarget.value);
								}}
								value={form.values.sort_code}
								required
							/>
						</Group>
						<Select
							required
							label='Account Type'
							data={['Business', 'Personal']}
							{...form.getInputProps('account_type')}
						/>
						<Group py="xs">
							<Checkbox
								size='sm'
								label='Set as default'
								{...form.getInputProps('default', { type: 'checkbox' })}
							/>
						</Group>
						<Group py='xl' position='right'>
							<Button type='submit'>
								<Text weight={500}>Add bank account</Text>
							</Button>
						</Group>
					</form>
				</Stack>
			</Drawer>
			<Page.Body>
				<BankAccountsTable rows={rows} />
			</Page.Body>
		</Page.Container>
	);
};

export default PaymentMethod;
