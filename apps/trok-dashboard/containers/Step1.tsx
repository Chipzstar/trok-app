import React, { useCallback } from 'react';
import { useForm, zodResolver } from '@mantine/form';
import { Button, Checkbox, Group, PasswordInput, Stack, TextInput, Text, Title } from '@mantine/core';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { PATHS } from '../utils/constants';
import { SignupSchema } from '../schemas';

const Step1 = ({ setNewAccount }) => {
	const router = useRouter();
	const form = useForm({
		initialValues: {
			full_name: null,
			firstname: undefined,
			lastname: undefined,
			email: undefined,
			phone: undefined,
			password: undefined,
			referral_code: undefined,
			terms: undefined
		},
		validate: zodResolver(SignupSchema)
	});

	const handleSubmit = useCallback(values => {
		values.full_name = values.firstname + " " + values.lastname
		console.log(values)
		setNewAccount(values);
		router.push(PATHS.ONBOARDING)
	}, []);

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className='font-aeonik flex h-full w-full flex-col' onError={() => console.log(form.errors)}>
			<Group position='apart' px='xl'>
				<header className='flex flex-row space-x-2'>
					<Image src='/static/images/logo.svg' width={30} height={30} />
					<span className='text-2xl font-medium'>Trok</span>
				</header>
				<Group spacing='xl'>
					<Text>Have an account?</Text>
					<Button px='xl' variant='outline' color='dark'>
						Sign in
					</Button>
				</Group>
			</Group>
			<Stack className='mx-auto my-auto w-1/3'>
				<header className='flex flex-col space-y-1'>
					<Title order={2}>Get started</Title>
					<span>Welcome to Trok— start saving on fuel in days.</span>
				</header>
				<Group grow spacing={40}>
					<TextInput
						withAsterisk
						label='Legal first name'
						{...form.getInputProps('firstname', { withError: true })}
					/>
					<TextInput
						withAsterisk
						label='Legal last name'
						{...form.getInputProps('lastname', { withError: true })}
					/>
				</Group>
				<TextInput
					withAsterisk
					label='Business Email'
					{...form.getInputProps('email', { withError: true })}
				/>
				<TextInput
					withAsterisk
					label='Business Phone Number'
					{...form.getInputProps('phone', { withError: true })}
				/>
				<PasswordInput
					withAsterisk
					label='Password'
					{...form.getInputProps('password', { withError: true })}
				/>
				<TextInput
					label='Referral Code'
					placeholder='Your referral code'
					{...form.getInputProps('referral_code')}
				/>
				<Checkbox
					label='By checking this box, I acknowledge and agree to the terms of the Trok Terms of Service on behalf of the Company identified above, that I am authorised to do so on behalf of the Company, and that I have reviewed the terms of the Trok Privacy Policy.'
					checked={form.values.terms}
					size='xs'
					{...form.getInputProps('terms', { type: 'checkbox' , withError: true })}
				/>
				<Group mt='md' position='right'>
					<Button
						type='submit'
						variant='filled'
						size='md'
						style={{
							width: 200
						}}
						onClick={() => console.log(form.errors)}
					>
						<Text weight={500}>Sign up</Text>
					</Button>
				</Group>
			</Stack>
		</form>
	);
};

export default Step1;
