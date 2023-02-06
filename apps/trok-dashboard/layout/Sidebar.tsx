import React, { useState } from 'react';
import { createStyles, Group, Navbar } from '@mantine/core';
import {
	IconArrowsLeftRight,
	IconCalendarTime,
	IconChartLine,
	IconCreditCard,
	IconFileInvoice,
	IconFileText,
	IconLogout,
	IconSettings,
	IconUsers
} from '@tabler/icons';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { DEFAULT_HEADER_HEIGHT, default_invoice_form_values, PATHS, STORAGE_KEYS } from '../utils/constants';
import { useLocalStorage } from '@mantine/hooks';
import { signOut, useSession } from 'next-auth/react';
import { trpc } from '../utils/clients';
import { InvoiceFormValues } from '../utils/types';

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
		linkDisabled: {
			color: theme.colors.gray[5],
			'&, &:hover': {
				color: theme.colors.gray[5],
				[`& .${icon}`]: {
					color: theme.colors.gray[5]
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
	const [invoiceForm, setInvoiceForm] = useLocalStorage<InvoiceFormValues>({
		key: STORAGE_KEYS.INVOICE_FORM,
		defaultValue: default_invoice_form_values
	});
	const router = useRouter();
	const { data: session } = useSession();
	const { data } = trpc.user.checkAccountApproved.useQuery(
		{
			id: session?.id
		},
		{
			// The query will not execute until the userId exists
			enabled: !!session?.id
		}
	);

	const tabs = {
		general: [
			{
				link: PATHS.HOME,
				label: 'Dashboard',
				icon: IconChartLine,
				isActive: router.pathname === PATHS.HOME,
				dataCy: "sidebar-dashboard",
				disabled: false
			},
			{
				link: PATHS.TRANSACTIONS,
				label: 'Transactions',
				icon: IconArrowsLeftRight,
				isActive: router.pathname === PATHS.TRANSACTIONS,
				dataCy: "sidebar-transactions",
				disabled: data === false
			},
			{
				link: PATHS.INVOICES,
				label: 'Invoices',
				icon: IconFileInvoice,
				isActive: router.pathname === PATHS.INVOICES,
				dataCy: "sidebar-invoices",
				disabled: data === false
			},
			{
				link: PATHS.CARDS,
				label: 'Cards',
				icon: IconCreditCard,
				isActive: router.pathname.includes(PATHS.CARDS),
				dataCy: "sidebar-cards",
				disabled: data === false
			},
			{
				link: PATHS.DRIVERS,
				label: 'Drivers',
				icon: IconUsers,
				isActive: router.pathname.includes(PATHS.DRIVERS),
				dataCy: "sidebar-drivers",
				disabled: data === false
			},
			{
				link: PATHS.PAYMENTS,
				label: 'Payments',
				icon: IconCalendarTime,
				isActive: router.pathname === PATHS.PAYMENTS,
				dataCy: "sidebar-payments",
				disabled: data === false
			},
			{
				link: PATHS.STATEMENTS,
				label: 'Statements',
				icon: IconFileText,
				isActive: router.pathname === PATHS.STATEMENTS,
				dataCy: "sidebar-statements",
				disabled: data === false
			}
		]
	};
	const { classes, cx } = useStyles();
	const [section, setSection] = useState<'account' | 'general'>('general');

	const links = tabs[section].map((item, index) => (
		<div
			data-cy={item.dataCy}
			role='button'
			className={cx(classes.link, {
				[classes.linkDisabled]: item.disabled,
				[classes.linkActive]: item.isActive
			})}
			key={index}
			onClick={() => !item.disabled && router.push(item.link)}
		>
			<item.icon className={classes.linkIcon} stroke={1.5} />
			<span>{item.label}</span>
		</div>
	));

	return (
		<Navbar width={{ base: 250 }} p='xs'>
			<Navbar.Section className={classes.header}>
				<Group spacing='xs' role='button' onClick={() => router.push(PATHS.HOME)}>
					<Image src='/static/images/logo-with-text.svg' width={100} height={35} />
				</Group>
			</Navbar.Section>
			<Navbar.Section grow>{links}</Navbar.Section>
			<Navbar.Section className={classes.footer}>
				<div
					role='button'
					className={cx(classes.link, { [classes.linkActive]: router.pathname === PATHS.SETTINGS })}
					onClick={() => router.push(PATHS.SETTINGS)}
				>
					<IconSettings className={classes.linkIcon} stroke={1.5} />
					<span>Settings</span>
				</div>
				<div
					data-cy='logout-button'
					role='button'
					className={classes.link}
					onClick={() => signOut().then(r =>setInvoiceForm(default_invoice_form_values))}
				>
					<IconLogout className={classes.linkIcon} stroke={1.5} /> <span>Logout</span>
				</div>
			</Navbar.Section>
		</Navbar>
	);
};

export default Sidebar;
