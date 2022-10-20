import React, { useMemo } from 'react';
import { AppShell, Header } from '@mantine/core';
import Sidebar from './Sidebar';
import { useRouter } from 'next/router';
import VerifyBanner from '../components/VerifyBanner';
import { DEFAULT_HEADER_HEIGHT, PATHS } from '../utils/constants';

const Layout = ({ children, auth, setAuth }) => {
	const router = useRouter()
	const isLoggedIn = useMemo(() => auth || ![PATHS.LOGIN, PATHS.SIGNUP, PATHS.ONBOARDING].includes(router.pathname), [auth, router.pathname]);
	
	return (
		<div className='relative flex min-h-screen font-aeonik'>
			<AppShell
				padding={0}
				header={router.query?.token && <Header height={DEFAULT_HEADER_HEIGHT - 10} zIndex={50}><VerifyBanner/></Header>}
				navbar={isLoggedIn && <Sidebar setAuth={setAuth} />}
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
