import { createStyles, Title, Text, Button, Container, Group } from '@mantine/core';
import Link from 'next/link';
import { PATHS } from '../utils/constants';
import Page from '../layout/Page';

const useStyles = createStyles(theme => ({
	root: {
		paddingTop: 80,
		paddingBottom: 80
	},

	label: {
		textAlign: 'center',
		fontWeight: 900,
		fontSize: 220,
		lineHeight: 1,
		marginBottom: theme.spacing.xl * 1.5,
		color: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2],

		[theme.fn.smallerThan('sm')]: {
			fontSize: 120
		}
	},

	title: {
		fontFamily: `Greycliff CF, ${theme.fontFamily}`,
		textAlign: 'center',
		fontWeight: 900,
		fontSize: 38,

		[theme.fn.smallerThan('sm')]: {
			fontSize: 32
		}
	},

	description: {
		maxWidth: 500,
		margin: 'auto',
		marginTop: theme.spacing.xl,
		marginBottom: theme.spacing.xl * 1.5
	}
}));

export default function Custom404Error() {
	const { classes } = useStyles();

	return (
		<Page.Container classNames="h-screen flex flex-col justify-center">
			<div className={classes.label}>404</div>
			<Title className={classes.title}>You have found a secret place.</Title>
			<Text color='dimmed' size='lg' align='center' className={classes.description}>
				Page you are trying to open does not exist. You may have mistyped the address, or the page has been
				moved to another URL. If you think this is an error contact support.
			</Text>
			<Group position='center'>
				<Link href={PATHS.HOME} passHref>
					<Button variant='subtle' size='md'>
						Take me back to home page
					</Button>
				</Link>
			</Group>
		</Page.Container>
	);
}