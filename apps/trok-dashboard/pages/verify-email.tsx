import React, { useEffect } from 'react';
import { Button, createStyles, Image, Space, Text, Title } from '@mantine/core';
import { useRouter } from 'next/router';
import { useLocalStorage } from '@mantine/hooks';
import { STORAGE_KEYS } from '../utils/constants';
import { trpc } from '../utils/clients';
import { signIn } from 'next-auth/react';
import { IconCheck, IconX } from '@tabler/icons';
import { notifyError, notifySuccess } from '@trok-app/shared-utils';

const useStyles = createStyles(theme => ({
	wrapper: {
		display: 'flex',
		alignItems: 'center',
		padding: theme.spacing.xl * 2,
		borderRadius: theme.radius.md,
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
		border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[3]}`,

		[`@media (max-width: ${theme.breakpoints.sm}px)`]: {
			flexDirection: 'column-reverse',
			padding: theme.spacing.xl
		}
	},

	image: {
		maxWidth: '40%',

		[`@media (max-width: ${theme.breakpoints.sm}px)`]: {
			maxWidth: '100%'
		}
	},

	body: {
		paddingRight: theme.spacing.xl * 4,

		[`@media (max-width: ${theme.breakpoints.sm}px)`]: {
			paddingRight: 0,
			marginTop: theme.spacing.xl
		}
	},

	title: {
		color: theme.colorScheme === 'dark' ? theme.white : theme.black,
		lineHeight: 1,
		marginBottom: theme.spacing.md
	},

	controls: {
		display: 'flex',
		marginTop: theme.spacing.xl
	},

	inputWrapper: {
		width: '100%',
		flex: '1'
	},

	input: {
		borderTopRightRadius: 0,
		borderBottomRightRadius: 0,
		borderRight: 0
	},

	control: {
		borderTopLeftRadius: 0,
		borderBottomLeftRadius: 0
	}
}));

const SignUpComplete = () => {
	const [account, setAccount] = useLocalStorage({ key: STORAGE_KEYS.ACCOUNT, defaultValue: null });
	const router = useRouter();
	const { classes } = useStyles();
	const mutation = trpc.auth.verifyEmail.useMutation();

	useEffect(() => {
		(async () => {
			const params = router.query;
			if (params?.email && params?.token) {
				try {
					await mutation.mutateAsync({
						email: String(params.email),
						token: String(params.token)
					});
					notifySuccess('email-verification-success', "Email verification successful", <IconCheck size={20} />)
					const { ok, error } = await signIn('verify-email', {
						email: params.email,
						password: params.token,
						redirect: false
					});
					if (ok) {
						console.log('Login Success');
						await router.replace('/');
						return;
					} else {
						notifyError('email-verification-failed', error, <IconX size={20} />);
					}
				} catch (err) {
					const message = err.message instanceof Array ? err[0].message : err?.message;
					notifyError('email-verification-failed', message, <IconX size={20} />);
				}
			}
		})();
	}, [router]);

	return (
		<div className='flex h-screen w-full items-center justify-center'>
			<div className='w-2/5 space-y-5'>
				<Image src="/static/images/logo-with-text.svg" width={250}/>
				<Space h="xs"/>
				<Title weight={500} order={2} mb={5}>
					Thank you for submitting your application
				</Title>
				<Text size='sm' color='dimmed'>
					Before we approve your application, we need you to confirm your email.
				</Text>
				<Text size='sm' color='dimmed'>
					Please check your inbox at <span className='font-medium'>{account?.email}</span> for an email
					confirmation link. <br />
					You have 24 hours to confirm your email.
				</Text>
				{process.env.NODE_ENV !== 'production' && (
					<div className={classes.controls}>
						<Button
							px='xl'
							size='md'
							onClick={() => {
								router.push('/');
							}}
						>
							<Text weight={500}>Go to Dashboard</Text>
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};

export default SignUpComplete;
