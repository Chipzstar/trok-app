import React, { useCallback } from 'react';
import { useForm } from '@mantine/form';
import { Button, Checkbox, Group, PasswordInput, Stack, TextInput } from '@mantine/core';

const Step1 = () => {
	const form = useForm({
		initialValues: {
			full_name: '',
			firstname: '',
			lastname: '',
			email: '',
			phone: '',
			password: '',
			confirm_password: '',
			company_name: '',
			terms: false
		}
	});

	const handleSubmit = useCallback((values) => {
			alert(values);
		},
		[]
	);

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className='h-full w-full flex'>
			<Stack className="w-2/3 mx-auto my-auto">
				<TextInput
					required
					label='Full Name'
					placeholder='Your name'
					{...form.getInputProps('full_name')}

				/>
				<TextInput
					required
					label='Business Email'
					placeholder='hello@mantine.dev'
					{...form.getInputProps('email')}
				/>
				<TextInput
					required
					label='Business Phone Number'
					placeholder='+44 123 4567 890'
					{...form.getInputProps('name')}

				/>
				<PasswordInput
					required
					label='Password'
					placeholder='Your password'
					{...form.getInputProps('password')}
				/>
				<PasswordInput
					required
					label='Confirm Password'
					placeholder='Your password'
					{...form.getInputProps('confirm_password')}
				/>
				<Checkbox
					required
					label='I accept terms and conditions'
					checked={form.values.terms}
					onChange={(event) => form.setFieldValue('terms', event.currentTarget.checked)}
				/>
				<Group grow mt="lg">
					<Button type='submit' variant='filled' color='dark' size='lg' classNames={{
						root: 'bg-black w-full'
					}}>
						Continue
					</Button>
				</Group>
			</Stack>
		</form>
	);
};

export default Step1;
