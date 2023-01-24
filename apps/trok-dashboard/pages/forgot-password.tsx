import React, { useCallback, useState } from 'react';
import { useForm } from '@mantine/form';
import Image from 'next/image';
import { Button, Group, Stack, Text, TextInput, Title } from '@mantine/core';
import { PATHS } from '../utils/constants';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { useRouter } from 'next/router';
import { trpc } from '../utils/clients';
import { notifyError, notifySuccess } from '@trok-app/shared-utils';
import { IconCheck, IconX } from '@tabler/icons';

const ForgotPassword = () => {
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const sendResetEmail = trpc.auth.sendResetEmail.useMutation();
	const form = useForm({
		initialValues: {
			email: ''
		}
	});
	const handleSubmit = useCallback(async values => {
		setLoading(true);
		try {
			const result = await sendResetEmail.mutateAsync(values.email);
			setLoading(false);
			notifySuccess(
				'forgot-password-success',
				'We sent you password reset email. Please check your email and click the link to reset your password',
				<IconCheck size={20} />
			);
		} catch (err) {
			console.error(err);
			setLoading(false);
			notifyError('reset-password-failure', err?.message, <IconX size={20} />);
		}
	}, []);
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
						<Title order={2}>Forgot your password?</Title>
						<span>Enter your email below to reset your password</span>
					</header>
					<TextInput label='Email' type='email' {...form.getInputProps('email', { withError: true })} />
					<Group py='md'>
						<Button type='submit' size='md' loading={loading} fullWidth>
							<Text weight='normal'>Submit</Text>
						</Button>
					</Group>
				</Stack>
			</form>
		</div>
	);
};

export async function getServerSideProps({ req, res }) {
	// @ts-ignore
	const session = await unstable_getServerSession(req, res, authOptions);
	if (session) {
		return {
			redirect: {
				destination: PATHS.HOME,
				permanent: false
			}
		};
	}
	return {
		props: {
			session
		}
	};
}

export default ForgotPassword;
