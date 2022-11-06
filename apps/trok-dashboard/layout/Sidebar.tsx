import React, { useState } from 'react';
import { createStyles, Group, Navbar, Switch, Text } from '@mantine/core';
import {
	IconArrowsLeftRight,
	IconCalendarTime,
	IconChartLine,
	IconCreditCard,
	IconFileText,
	IconGift,
	IconLogout,
	IconSettings,
	IconUsers,
	IconWallet
} from '@tabler/icons';
import Image from 'next/image';
import { useRouter } from 'next/router';
import {DEFAULT_HEADER_HEIGHT, isProd, PATHS, STORAGE_KEYS} from '../utils/constants';
import { useLocalStorage } from '@mantine/hooks';
import { signOut } from 'next-auth/react';

const useStyles = createStyles((theme, _params, getRef) => {
	const icon = getRef('icon');

	return {
		header: {
			paddingRight: theme.spacing.md,
			paddingLeft: theme.spacing.sm,
			paddingTop: theme.spacing.xs,
			color: theme.colorScheme === 'dark' ? theme.white : theme.black,
			minHeight: DEFAULT_HEADER_HEIGHT - 10
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
				backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
				color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
				[`& .${icon}`]: {
					color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color
				}
			}
		},

		footer: {
			borderTop: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
			paddingTop: theme.spacing.md
		}
	};
});

const Sidebar = () => {
	const [testMode, setTestMode] = useLocalStorage({ key: STORAGE_KEYS.TEST_MODE, defaultValue: false });
	const router = useRouter();
	const tabs = {
		general: [
			{
				link: PATHS.HOME,
				label: 'Dashboard',
				icon: IconChartLine,
				isActive: router.pathname === PATHS.HOME
			},
			{
				link: PATHS.TRANSACTIONS,
				label: 'Transactions',
				icon: IconArrowsLeftRight,
				isActive: router.pathname === PATHS.TRANSACTIONS
			},
			{
				link: PATHS.CARDS,
				label: 'Cards',
				icon: IconCreditCard,
				isActive: router.pathname.includes(PATHS.CARDS)
			},
			{
				link: PATHS.DRIVERS,
				label: 'Drivers',
				icon: IconUsers,
				isActive: router.pathname.includes(PATHS.DRIVERS)
			},
			{
				link: PATHS.PAYMENTS,
				label: 'Payments',
				icon: IconCalendarTime,
				isActive: router.pathname === PATHS.PAYMENTS
			},
			{
				link: PATHS.STATEMENTS,
				label: 'Statements',
				icon: IconFileText,
				isActive: router.pathname === PATHS.STATEMENTS
			},
			{
				link: PATHS.BANK_ACCOUNT,
				label: 'Payment Method',
				icon: IconWallet,
				isActive: router.pathname === PATHS.BANK_ACCOUNT
			}
		]
	};
	const { classes, cx } = useStyles();
	const [section, setSection] = useState<'account' | 'general'>('general');

	const links = tabs[section].map((item, index) => (
		<div
			role='button'
			className={cx(classes.link, { [classes.linkActive]: item.isActive })}
			key={index}
			onClick={() => router.push(item.link)}
		>
			<item.icon className={classes.linkIcon} stroke={1.5} />
			<span>{item.label}</span>
		</div>
	));

	return (
		<Navbar width={{ base: 250 }} p='xs'>
			<Navbar.Section className={classes.header}>
				<Group spacing='xs'>
					<Image src='/static/images/logo-blue.svg' width={35} height={35} />
					<Text size={28} weight='600'>
						Trok
					</Text>
				</Group>
			</Navbar.Section>
			<Navbar.Section grow>{links}</Navbar.Section>
			{!isProd && (
				<Navbar.Section py='md' mx='auto'>
					<Switch
						color='orange'
						label='Test mode'
						size='md'
						checked={!!testMode}
						onChange={event => setTestMode(event.currentTarget.checked)}
					/>
				</Navbar.Section>
			)}
			<Navbar.Section className={classes.footer}>
				{!isProd && <div
					role='button'
					className={cx(classes.link, { [classes.linkActive]: router.pathname === PATHS.REFERRAL })}
					onClick={() => router.push(PATHS.REFERRAL)}
				>
					<IconGift className={classes.linkIcon} stroke={1.5} />
					<span>Refer & Earn</span>
				</div>}
				<div
					role='button'
					className={cx(classes.link, { [classes.linkActive]: router.pathname === PATHS.SETTINGS })}
					onClick={() => router.push(PATHS.SETTINGS)}
				>
					<IconSettings className={classes.linkIcon} stroke={1.5} />
					<span>Settings</span>
				</div>
				<div
					role='button'
					className={classes.link}
					onClick={() => signOut().then(r => console.log('Sign Out Success!'))}
				>
					<IconLogout className={classes.linkIcon} stroke={1.5} /> <span>Logout</span>
				</div>
			</Navbar.Section>
		</Navbar>
	);
};

export default Sidebar;
