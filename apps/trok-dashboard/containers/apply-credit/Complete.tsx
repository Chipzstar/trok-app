import React, { useEffect } from 'react';
import { Button, createStyles, Image, Space, Text, Title } from '@mantine/core';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

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

const Complete = () => {
	const router = useRouter();
	const { classes } = useStyles();
	const { data: session } = useSession();
	return (
		<div className='flex md:py-10 w-full items-center justify-center'>
			<div className='space-y-5'>
				<Image src='/static/images/logo-with-text.svg' width={200} />
				<Space h='xs' />
				<Title weight={500} order={2} mb={5}>
					Thank you for submitting your application
				</Title>
				<Text size='sm' color='dimmed'>
					We will review your application shortly.
				</Text>
				<Text size='sm' color='dimmed'>
					Please check your inbox at <span className='font-medium'>{session?.user?.email}</span> for an email
					update on the status of your credit application. We will notify you within 24 hours.
				</Text>

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

			</div>
		</div>
	);
};

export default Complete;