import React, { useCallback, useState } from 'react';
import { Button, Card, Group, Loader, PasswordInput, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifyError, notifySuccess } from '@trok-app/shared-utils';
import { IconCheck, IconX } from '@tabler/icons';
import { trpc } from '../../utils/clients';

const ChangePassword = ({ user_id }) => {
	const [loading, setLoading] = useState(false);
	const form = useForm({
		initialValues: {
			curr_password: '',
			new_password: '',
			confirm_password: ''
		}
	});
	const mutation = trpc.user.changePassword.useMutation()

	const handleSubmit = useCallback(
		async (values) => {
			setLoading(true)
			try {
				await mutation.mutateAsync({
					id: user_id,
					curr_password: values.curr_password,
					new_password: values.new_password,
					confirm_password: values.confirm_password
				})
				setLoading(false);
				form.reset();
				notifySuccess(
					'update-password-success',
					'Password changed successfully',
					<IconCheck size={20} />
				);
			} catch (err) {
				console.error(err);
				setLoading(false);
				notifyError('update-password-failed', err?.error?.message ?? err.message, <IconX size={20} />);
			}
		},
		[]
	);

	return (
		<form className='container py-5' onSubmit={form.onSubmit(handleSubmit)}>
			<Card shadow='sm' p='xl' radius='xs' className='w-1/2'>
				<Stack>
					<div className='flex flex-col'>
						<span>Current password</span>
						<PasswordInput {...form.getInputProps('curr_password')} />
					</div>
					<div className='flex flex-col'>
						<span>New password</span>
						<PasswordInput {...form.getInputProps('new_password')} />
					</div>
					<div className='flex flex-col'>
						<span>Confirm new password</span>
						<PasswordInput {...form.getInputProps('confirm_password')} />
					</div>
					<Group py='xl'>
						<Button type="submit" loading={loading}>
							<Text weight='normal'>Save</Text>
						</Button>
					</Group>
				</Stack>
			</Card>
		</form>
	);
};

export default ChangePassword;
