import React from 'react';
import { Button, Checkbox, Drawer, Group, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import SortCodeInput from '../components/SortCodeInput';
import { PLAID_INSTITUTIONS } from '@trok-app/shared-utils';

const BankAccountForm = ({opened, onClose, form, onSubmit, loading, numBankAccounts}) => {
	return (
		<Drawer
			opened={opened}
			onClose={onClose}
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
				<form onSubmit={form.onSubmit(onSubmit)} className='flex flex-col space-y-4'>
					<TextInput
						required
						label='Business Account Name'
						{...form.getInputProps('account_holder_name')}
					/>
					<Group grow spacing='xl'>
						<TextInput
							type='number'
							required
							label='Account Number'
							{...form.getInputProps('account_number')}
							minLength={8}
						/>
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
						label='Institution'
						data={process.env.NEXT_PUBLIC_ENVIRONMENT === "production" ? PLAID_INSTITUTIONS : PLAID_INSTITUTIONS.concat({
							label: 'STRIPE TEST BANK',
							value: "ins_117181",
						})}
						{...form.getInputProps('institution_id')}
					/>
					{Boolean(numBankAccounts) && (
						<Group py='xs'>
							<Checkbox
								size='sm'
								label='Set as default'
								{...form.getInputProps('is_default', { type: 'checkbox' })}
							/>
						</Group>
					)}
					<Group py='xl' position='right'>
						<Button type='submit' loading={loading}>
							<Text weight={500}>Add bank account</Text>
						</Button>
					</Group>
				</form>
			</Stack>
		</Drawer>
	);
};

export default BankAccountForm;
