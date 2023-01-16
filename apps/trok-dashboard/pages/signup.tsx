import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useLocalStorage } from '@mantine/hooks';
import { useRouter } from 'next/router';
import { useForm, zodResolver } from '@mantine/form';
import { PATHS, requirements, STORAGE_KEYS } from '../utils/constants';
import {
	Anchor,
	Button,
	Checkbox,
	Box,
	Group,
	PasswordInput,
	Popover,
	Progress,
	Stack,
	Text,
	TextInput,
	Title
} from '@mantine/core';
import { trpc } from '../utils/clients';
import { getE164Number, notifyError, SignupInfo } from '@trok-app/shared-utils';
import { IconCheck, IconX } from '@tabler/icons';
import prisma from '../prisma';
import { z } from 'zod';
import { getStrength } from '../utils/functions';
import { authOptions } from './api/auth/[...nextauth]';
import { unstable_getServerSession } from 'next-auth';

function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
	return (
		<Text color={meets ? 'teal' : 'red'} sx={{ display: 'flex', alignItems: 'center' }} mt={7} size='sm'>
			{meets ? <IconCheck size={14} /> : <IconX size={14} />} <Box ml={10}>{label}</Box>
		</Text>
	);
}

export function Signup({ secret, emails }: { secret: string; emails: string[] }) {
	const SignupSchema = z.object({
		email: z
			.string()
			.email({ message: 'Invalid email' })
			.max(50)
			.refine((value: string) => !emails.includes(value), 'Account with this email already exists'),
		password: z
			.string({ required_error: 'Required' })
			.min(6, "Password must be at least 6 characters")
			.max(50, "Password must have at most 50 characters")
			.refine((val: string) => getStrength(val) >= 100, 'Your password is too weak, use the suggestions increase password strength'),
		full_name: z.string().nullable(),
		firstname: z.string({ required_error: 'Required' }).max(25),
		lastname: z.string({ required_error: 'Required' }).max(25),
		phone: z.string({ required_error: 'Required' }).max(25),
		referral_code: z.string().optional(),
		terms: z.boolean().refine((val: boolean) => val, 'Please check this box')
	});
	const [popoverOpened, setPopoverOpened] = useState(false);
	const [loading, setLoading] = useState(false);
	const [newAccount, setNewAccount] = useLocalStorage({ key: STORAGE_KEYS.ACCOUNT, defaultValue: null });
	const mutation = trpc.auth.signup.useMutation();
	const [userForm, setUserForm] = useLocalStorage<Partial<SignupInfo>>({
		key: STORAGE_KEYS.SIGNUP_FORM,
		defaultValue: {
			full_name: null,
			terms: undefined,
			password: ''
		}
	});
	const router = useRouter();
	const form = useForm({
		initialValues: {
			...userForm
		},
		validate: zodResolver(SignupSchema)
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

	const handleSubmit = useCallback(
		async values => {
			setLoading(true);
			values.full_name = values.firstname + ' ' + values.lastname;
			values.phone = getE164Number(values.phone);
			try {
				const result = await mutation.mutateAsync(values);
				setNewAccount({ ...values, password: result.hashed_password });
				router.push(`${PATHS.ONBOARDING}?page=1`);
				setLoading(false);
			} catch (err) {
				setLoading(false);
				notifyError('signup-failure', err?.error?.message ?? err.message, <IconX size={20} />);
			}
		},
		[router, secret, setNewAccount]
	);

	useEffect(() => {
		const storedValue = window.localStorage.getItem(STORAGE_KEYS.SIGNUP_FORM);
		if (storedValue) {
			try {
				const parsedData = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.SIGNUP_FORM));
				form.setValues(parsedData);
			} catch (e) {
				console.log('Failed to parse stored value');
				console.error(e);
			}
		}
	}, []);

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEYS.SIGNUP_FORM, JSON.stringify({ ...form.values, password: '' }));
	}, [form.values]);

	return (
		<div className='h-screen w-full overflow-x-hidden bg-white p-5'>
			<form
				data-cy="signup-form"
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
						<Title order={2}>Get started</Title>
						<span>Welcome to Trok— start saving on fuel in days.</span>
					</header>
					<Group grow spacing={40}>
						<TextInput
							data-cy={"signup-firstname"}
							withAsterisk
							label='Legal first name'
							{...form.getInputProps('firstname', { withError: true })}
						/>
						<TextInput
							data-cy={"signup-lastname"}
							withAsterisk
							label='Legal last name'
							{...form.getInputProps('lastname', { withError: true })}
						/>
					</Group>
					<TextInput
						data-cy={"signup-email"}
						withAsterisk
						label='Business email'
						{...form.getInputProps('email', { withError: true })}
					/>
					<TextInput
						data-cy={"signup-phone"}
						withAsterisk
						label='Business phone number'
						{...form.getInputProps('phone', { withError: true })}
					/>
					<Popover opened={popoverOpened} position='bottom' width='target' transition='pop'>
						<Popover.Target>
							<div
								onFocusCapture={() => setPopoverOpened(true)}
								onBlurCapture={() => setPopoverOpened(false)}
							>
								<PasswordInput
									data-cy={"signup-password"}
									withAsterisk
									label='Password'
									description='Strong passwords should include letters in lower and uppercase, at least 1 number, and at least 1 special symbol'
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
					<TextInput data-cy={"signup-referral-code"} label='Referral code' {...form.getInputProps('referral_code', { withError: true })} />
					<Checkbox
						data-cy={"signup-terms"}
						label={
							<>
								By checking this box, I acknowledge and agree to the terms of the Trok Terms of Service
								on behalf of the Company identified above, that I am authorised to do so on behalf of
								the Company, and that I have reviewed the terms of the Trok Privacy Policy and the{' '}
								<Anchor
									size='xs'
									href='/static/documents/Stripe Issuing_ Commercial Card Program Agreement — EU & UK - Beta.pdf'
									target='_blank'
								>
									Stripe Issuing Commercial Card Program Agreement.
								</Anchor>
							</>
						}
						checked={form.values.terms}
						size='xs'
						{...form.getInputProps('terms', { type: 'checkbox', withError: true })}
					/>
					<Group mt='md' position='right'>
						<Button
							type='submit'
							variant='filled'
							size='md'
							style={{
								width: 200
							}}
							loading={loading}
						>
							<Text weight={500}>Sign up</Text>
						</Button>
					</Group>
				</Stack>
			</form>
		</div>
	);
}

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
	const emails = await prisma.user.findMany({
		select: {
			email: true
		}
	});
	return {
		props: {
			secret: process.env.ENC_SECRET,
			emails: emails.map(({ email }) => email)
		}
	};
}
export default Signup;
