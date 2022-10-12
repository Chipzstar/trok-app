import React, { useState } from 'react';
import { createStyles, Group, Navbar, Text } from '@mantine/core';
import {
	IconArrowsLeftRight,
	IconGauge,
	IconLogout,
	IconReceipt,
	IconSwitchHorizontal, IconUser,
	IconUsers
} from '@tabler/icons';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { PATHS } from '../utils/constants';

const useStyles = createStyles((theme, _params, getRef) => {
	const icon = getRef('icon');

	return {
		header: {
			padding: theme.spacing.md,
			paddingTop: theme.spacing.xs,
			color: theme.colorScheme === 'dark' ? theme.white : theme.black,
			borderBottom: `1px solid ${
				theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
			}`,
		},
		navbar: {
			backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white
		},

		title: {
			textTransform: 'uppercase',
			letterSpacing: -0.25
		},

		link: {
			...theme.fn.focusStyles(),
			display: 'flex',
			alignItems: 'center',
			textDecoration: 'none',
			fontSize: theme.fontSizes.sm,
			color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[7],
			padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
			borderRadius: theme.radius.sm,
			fontWeight: 500,

			'&:hover': {
				backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
				color: theme.colorScheme === 'dark' ? theme.white : theme.black,

				[`& .${icon}`]: {
					color: theme.colorScheme === 'dark' ? theme.white : theme.black
				}
			}
		},

		linkIcon: {
			ref: icon,
			color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[6],
			marginRight: theme.spacing.sm
		},

		linkActive: {
			'&, &:hover': {
				backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor })
					.background,
				color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
				[`& .${icon}`]: {
					color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color
				}
			}
		},

		footer: {
			borderTop: `1px solid ${
				theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
			}`,
			paddingTop: theme.spacing.md
		}
	};
});

const Sidebar = ({setAuth}) => {
	const router = useRouter();
	const tabs = {
		general: [
			{
				link: '/',
				label: 'Dashboard',
				icon: IconGauge,
				isActive: router.pathname === PATHS.HOME,
			},
			{
				link: '/transactions',
				label: 'Transactions',
				icon: IconArrowsLeftRight,
				isActive: router.pathname === PATHS.TRANSACTIONS,
			},
			{
				link: '/drivers',
				label: 'Cards & Drivers',
				icon: IconUsers,
				isActive: router.pathname === PATHS.DRIVERS,
			},

			{
				link: '/billing',
				label: 'Billing',
				icon: IconReceipt,
				isActive: router.pathname === PATHS.BILLING
			}
		]
	};
	const { classes, cx } = useStyles();
	const [section, setSection] = useState<'account' | 'general'>('general');

	const links = tabs[section].map((item, index) => (
		<div
			role="button"
			className={cx(classes.link, { [classes.linkActive]: item.isActive })}
			key={index}
			onClick={() => router.push(item.link)}
		>
			<item.icon className={classes.linkIcon} stroke={1.5} />
			<span>{item.label}</span>
		</div>
	));

	return (
		<Navbar width={{ base: 300 }} p='xs'>
			<Navbar.Section className={classes.header}>
				<Group spacing="xs">
					<Image src='/static/images/logo-blue.svg' width={30} height={30}/>
					<Text size="xl" weight="600">Trok</Text>
				</Group>
			</Navbar.Section>
			<Navbar.Section grow mt='xl'>
				{links}
			</Navbar.Section>
			<Navbar.Section className={classes.footer}>
				<a href='#' className={classes.link} onClick={(event) => event.preventDefault()}>
					<IconUser className={classes.linkIcon} stroke={1.5} />
					<span>Profile</span>
				</a>
				<div className={classes.link} onClick={() => setAuth(false)}>
					<IconLogout className={classes.linkIcon} stroke={1.5} /> <span>Logout</span>
				</div>
			</Navbar.Section>
		</Navbar>
	)
};

export default Sidebar;
