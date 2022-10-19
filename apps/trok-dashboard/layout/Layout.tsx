import React from 'react';
import { AppShell, Header } from '@mantine/core';
import Sidebar from './Sidebar';
import { useRouter } from 'next/router';
import VerifyBanner from '../components/VerifyBanner';

const Layout = ({ children, auth, setAuth }) => {
	const router = useRouter()
	return (
		<div className='relative flex min-h-screen font-aeonik'>
			<AppShell
				padding={0}
				header={router.query?.token && <Header height={65} zIndex={50}><VerifyBanner/></Header>}
				navbar={auth && <Sidebar setAuth={setAuth} />}
				styles={theme => ({
					main: {
						backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]
					}
				})}
			>
				{children}
			</AppShell>
		</div>
	);
};

export default Layout;
