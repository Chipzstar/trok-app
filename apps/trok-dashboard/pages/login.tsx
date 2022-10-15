import React, { useCallback } from 'react';
import { Button, Group, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import Image from 'next/image';
import { useForm, zodResolver } from '@mantine/form';
import { LoginSchema } from '../schemas';
import Link from 'next/link';
import { PATHS } from '../utils/constants';
import { useRouter } from 'next/router';

const Login = ({ auth, setAuth }) => {
	const router = useRouter();
	const form = useForm({
		initialValues: {
			email: undefined,
			password: undefined
		},
		validate: zodResolver(LoginSchema)
	});

	const handleSubmit = useCallback(
		values => {
			console.log(values);
			router.push(PATHS.HOME).then(() => setAuth(true))
		},
		[setAuth]
	);

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
						<Text>{"Don't have an account?"}</Text>
						<Link href={PATHS.SIGNUP}>
							<span role='button' className='text-primary'>
								Sign up
							</span>
						</Link>
					</Group>
				</Group>
				<Stack className='mx-auto my-auto w-1/3' spacing="lg">
					<header className='flex flex-col space-y-1'>
						<Title order={2}>Welcome back</Title>
						<span>Sign in to your Trok account.</span>
					</header>
					<TextInput label='Email' {...form.getInputProps('email', { withError: true })} />
					<PasswordInput label='Password' {...form.getInputProps('password', { withError: true })} />
					<Text size='sm' color='brand'>
						Forgot password?
					</Text>
					<Group py="lg">
						<Button type="submit" size='md' fullWidth>
							<Text weight='normal'>Sign in</Text>
						</Button>
					</Group>
				</Stack>
			</form>
		</div>
	);
};

export default Login;
