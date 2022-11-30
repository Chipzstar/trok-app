import React, { useCallback, useState } from 'react';
import { useForm, zodResolver } from '@mantine/form';
import { Box, Button, Group, PasswordInput, Popover, Progress, Stack, Text, Title } from '@mantine/core';
import Image from 'next/image';
import { PATHS, requirements } from '../utils/constants';
import { useRouter } from 'next/router';
import { getStrength } from '../utils/functions';
import { z } from 'zod';
import { IconCheck, IconX } from '@tabler/icons';
import { trpc } from '../utils/clients';
import { notifyError, notifySuccess } from '@trok-app/shared-utils';

function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
	return (
		<Text color={meets ? 'teal' : 'red'} sx={{ display: 'flex', alignItems: 'center' }} mt={7} size='sm'>
			{meets ? <IconCheck size={14} /> : <IconX size={14} />} <Box ml={10}>{label}</Box>
		</Text>
	);
}

const passwordResetSchema = z
	.object({
		password: z
			.string({ required_error: 'Required' })
			.min(6, 'Password must be at least 6 characters')
			.max(50, 'Password must have at most 50 characters')
			.refine(
				(val: string) => getStrength(val) >= 100,
				'Your password is too weak, use the suggestions to increase password strength'
			),
		confirm_password: z
			.string()
			.min(6, 'Password must be at least 6 characters')
			.max(50, 'Password must have at most 50 characters')
	})
	.refine((data) => data.password === data.confirm_password, {
		message: 'Passwords don\'t match',
		path: ['confirm_password'] // path of error
	});
const ResetPassword = () => {
	const router = useRouter();
	const resetPassword = trpc.resetPassword.useMutation();
	const [loading, setLoading] = useState(false);
	const [popoverOpened, setPopoverOpened] = useState(false);
	const form = useForm({
		initialValues: {
			password: '',
			confirm_password: ''
		},
		validate: zodResolver(passwordResetSchema)
	});
	const strength = getStrength(form.values?.password ?? '');
	const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';
	const checks = requirements.map((requirement, index) => (
		<PasswordRequirement
			key={index}
			label={requirement.label}
			meets={requirement.re.test(form.values?.password ?? '')}
		/>
	));
	const handleSubmit = useCallback(async values => {
		setLoading(true)
		try {
			const res = await resetPassword.mutateAsync({
				email: String(router.query?.email),
				token: String(router.query?.token),
				password: values.password,
				confirm_password: values.confirm_password
			});
			setLoading(false);
			notifySuccess('reset-password-success', res, <IconCheck size={20} />)
			router.replace(PATHS.LOGIN)
		} catch (err) {
			setLoading(false);
			console.error(err);
			notifyError('reset-password-failed', err?.message, <IconX size={20} />);
		}
	}, [router.query]);

	return (
		<div className='h-screen w-full overflow-x-hidden bg-white p-5'>
			<form
				onSubmit={form.onSubmit(handleSubmit)}
				className='flex h-full w-full flex-col'
				onError={() => console.log(form.errors)}
			>
				<Group position='apart' px='xl'>
					<header className='flex flex-row space-x-2'>
						<Image src='/static/images/logo.svg' width={30} height={30} />
						<span className='text-2xl font-medium'>Trok</span>
					</header>
					<Group spacing='xl'>
						<Text>Have an account?</Text>
						<Button px='xl' variant='outline' color='dark' onClick={() => router.push(PATHS.LOGIN)}>
							Sign in
						</Button>
					</Group>
				</Group>
				<Stack className='mx-auto my-auto w-1/3'>
					<header className='flex flex-col space-y-1'>
						<Title order={2}>Reset your password?</Title>
						<span>Enter your new password</span>
					</header>
					<Popover opened={popoverOpened} position='bottom' width='target' transition='pop'>
						<Popover.Target>
							<div
								onFocusCapture={() => setPopoverOpened(true)}
								onBlurCapture={() => setPopoverOpened(false)}
							>
								<PasswordInput
									label='Password'
									{...form.getInputProps('password', { withError: true })}
								/>
							</div>
						</Popover.Target>
						<Popover.Dropdown>
							<Progress color={color} value={strength} size={5} style={{ marginBottom: 10 }} />
							<PasswordRequirement
								label='Includes at least 6 characters'
								meets={form.values?.password?.length > 5}
							/>
							{checks}
						</Popover.Dropdown>
					</Popover>
					<PasswordInput
						label='Confirm Password'
						{...form.getInputProps('confirm_password', { withError: true })}
					/>
					<Group py='md'>
						<Button type='submit' size='md' loading={loading} fullWidth>
							<Text weight='normal'>Reset Password</Text>
						</Button>
					</Group>
				</Stack>
			</form>
		</div>
	);
};

export default ResetPassword;
