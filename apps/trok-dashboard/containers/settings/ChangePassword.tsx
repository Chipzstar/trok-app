import React from 'react';
import { Button, Card, Group, PasswordInput, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';

const ChangePassword = ({ account }) => {
	const form = useForm({
		initialValues: {
			password: '',
			confirm_password: ''
		}
	});
	return (
		<div className='container py-5'>
			<Card shadow='sm' p='xl' radius='xs' className='w-1/2'>
				<Stack>
					<div className='flex flex-col'>
						<span>Password</span>
						<PasswordInput {...form.getInputProps('password')} isPassword />
					</div>
					<div className='flex flex-col'>
						<span>New Password</span>
						<PasswordInput {...form.getInputProps('password')} isPassword />
					</div>
					<Group py='xl'>
						<Button type="submit">
							<Text weight='normal'>Save</Text>
						</Button>
					</Group>
				</Stack>
			</Card>
		</div>
	);
};

export default ChangePassword;
