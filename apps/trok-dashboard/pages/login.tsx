import React, { useCallback, useEffect, useState } from 'react';
import { Anchor, Button, Group, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import Image from 'next/image';
import { useForm } from '@mantine/form';
import Link from 'next/link';
import { PATHS } from '../utils/constants';
import { useRouter } from 'next/router';
import { getCsrfToken, signIn } from 'next-auth/react';
import { notifyError } from '@trok-app/shared-utils';
import { IconX } from '@tabler/icons';
import prisma from '../prisma';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
const Login = ({ csrfToken, users }) => {
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const form = useForm({
		initialValues: {
			email: undefined,
			password: undefined
		},
		validate: values => ({
			email: !values.email
				? 'Required'
				: !users.find(item => item.email === values.email)
				? 'No user found with that email address'
				: null,
			password: !values.password ? 'Required' : null
		})
	});

	const handleSignIn = useCallback(
		async values => {
			try {
				setLoading(true);
				const { ok, error } = await signIn('credentials', {
					email: values.email,
					password: values.password,
					redirect: false
				});
				if (ok) {
					console.log('Login Success');
					await router.replace('/');
					return;
				}
				// Something went wrong
				if (error) {
					if (error === 'CredentialsSignin') {
						form.setFieldError('password', 'Password is incorrect');
					} else {
						notifyError('login-failure', error, <IconX size={20} />);
					}
				}
				setLoading(false);
			} catch (error) {
				setLoading(false);
				notifyError('login-failure', error.error?.message ?? error.message, <IconX size={20} />);
				console.log(error);
			}
		},
		[router]
	);

	useEffect(() => {
		if (router.query?.error) {
			const message = String(router.query.error);
			notifyError('login-failed', message, <IconX size={20} />);
		}
	}, [router.query]);

	return (
		<div className='h-screen w-full overflow-x-hidden bg-white p-5'>
			<form
				data-cy="login-form"
				onSubmit={form.onSubmit(handleSignIn)}
				className='flex h-full w-full flex-col'
				onError={() => console.log(form.errors)}
			>
				<TextInput
					name='csrfToken'
					//@ts-ignore
					type='hidden'
					defaultValue={csrfToken}
				/>
				<Group position='apart' px='xl'>
					<header className='flex flex-row space-x-2'>
						<Image src='/static/images/logo.svg' width={30} height={30} />
						<span className='text-2xl font-medium'>Trok</span>
					</header>
					<Group spacing='xl'>
						<Text>{"Don't have an account?"}</Text>
						<Link href={PATHS.SIGNUP}>
							<span role='button' className='text-primary'>
								Sign up
							</span>
						</Link>
					</Group>
				</Group>
				<Stack className='mx-auto my-auto w-1/3' spacing='lg'>
					<header className='flex flex-col space-y-1'>
						<Title order={2}>Welcome back</Title>
						<span>Sign in to your Trok account.</span>
					</header>
					<TextInput label='Email' {...form.getInputProps('email', { withError: true })} data-cy={"login-email"} />
					<PasswordInput label='Password' {...form.getInputProps('password', { withError: true })} data-cy={"login-password"} />
					<Link href={PATHS.FORGOT_PASSWORD} passHref>
						<Anchor size='sm' color='brand'>
							Forgot password?
						</Anchor>
					</Link>
					<Group py='md'>
						<Button type='submit' size='md' loading={loading} fullWidth>
							<Text weight='normal'>Sign in</Text>
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
	const csrfToken = await getCsrfToken();
	const users = await prisma.user.findMany({
		select: {
			email: true
		}
	});
	return {
		props: {
			csrfToken: csrfToken ?? null,
			users
		}
	};
}

export default Login;
